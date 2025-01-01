import { test, expect, type Page, Locator } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.beforeEach(async ({ page }) => {
	await page.goto('https://demo.playwright.dev/todomvc/');
	await page.addStyleTag({
		content:
			'* { transition: none !important; animation: none !important; }',
	});
});

const TODO_ITEMS = [
	'buy some cheese',
	'feed the cat',
	'book a doctors appointment',
] as const;

test.describe('New Todo', () => {
	test('should allow me to add todo items', async ({ page }) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		await expect(page.getByTestId('todo-title')).toHaveText([
			TODO_ITEMS[0],
		]);

		await newTodo.fill(TODO_ITEMS[1]);
		await newTodo.press('Enter');

		await expect(page.getByTestId('todo-title')).toHaveText([
			TODO_ITEMS[0],
			TODO_ITEMS[1],
		]);

		await checkNumberOfTodosInLocalStorage(page, 2);
		await expect(page).toHaveScreenshot('two-todos-added.png');
		await ariaSnapshot(page, null, 'two-todos-added');
	});

	test('should clear text input field when an item is added', async ({
		page,
	}) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		await expect(newTodo).toBeEmpty();
		await expect(newTodo).toHaveScreenshot('input-field-cleared.png');
		await ariaSnapshot(page, newTodo, 'input-field-cleared');
		await checkNumberOfTodosInLocalStorage(page, 1);
	});

	test('should append new items to the bottom of the list', async ({
		page,
	}) => {
		await createDefaultTodos(page);

		const todoCount = page.getByTestId('todo-count');

		await expect(todoCount).toHaveText('3 items left');
		await expect(todoCount).toHaveScreenshot('three-items-left.png');

		await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
		await listsOfTodos(page, null, 'three-todos-added.png');
		await ariaSnapshot(page, null, 'three-fresh-todos-added');
		await checkNumberOfTodosInLocalStorage(page, 3);
	});
});

test.describe('Mark all as completed', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test.afterEach(async ({ page }) => {
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should allow me to mark all items as completed', async ({ page }) => {
		await page.getByLabel('Mark all as complete').check();

		await expect(page.getByTestId('todo-item')).toHaveClass([
			'completed',
			'completed',
			'completed',
		]);
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);
		await listsOfTodos(page, null, 'all-items-completed.png');
		await ariaSnapshot(page, null, 'all-three-items-completed');
	});

	test('should allow me to clear the completion state of all items', async ({
		page,
	}) => {
		const toggleAll = page.getByLabel('mark all as complete');

		await toggleAll.check();
		await toggleAll.uncheck();

		await expect(page.getByTestId('todo-item')).toHaveClass(['', '', '']);
		await listsOfTodos(page, null, 'all-items-uncompleted.png');
		await ariaSnapshot(page, null, 'all-items-uncompleted');
	});

	test('complete all checkbox should update state when items are completed / cleared', async ({
		page,
	}) => {
		const toggleAll = page.getByLabel('mark all as complete');
		await toggleAll.check();
		await expect(toggleAll).toBeChecked();
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);

		const firstTodo = page.getByTestId('todo-item').nth(0);
		await firstTodo.getByRole('checkbox').uncheck();
		await listsOfTodos(page, null, 'two-items-completed.png');
		await ariaSnapshot(page, null, 'two-items-completed');

		await expect(toggleAll).not.toBeChecked();

		await firstTodo.getByRole('checkbox').check();
		await checkNumberOfTodosInLocalStorage(page, 3);

		await expect(toggleAll).toBeChecked();
		await listsOfTodos(page, null, 'all-items-completed.png');
		await ariaSnapshot(page, null, 'all-items-completed');
	});
});

test.describe('Item', () => {
	test('should allow me to mark items as complete', async ({ page }) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		for (const todo of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(todo);
			await newTodo.press('Enter');
		}

		const firstTodo = page.getByTestId('todo-item').nth(0);
		await firstTodo.getByRole('checkbox').check();
		await expect(firstTodo).toHaveClass('completed');
		await listsOfTodos(page, 0, 'first-item-completed.png');
		await ariaSnapshot(page, null, 'first-item-completed', true);

		const secondTodo = page.getByTestId('todo-item').nth(1);
		await expect(secondTodo).not.toHaveClass('completed');
		await secondTodo.getByRole('checkbox').check();
		await listsOfTodos(page, 0, 'second-item-completed.png');
		await ariaSnapshot(page, null, 'second-item-completed', true);

		await expect(firstTodo).toHaveClass('completed');
		await expect(secondTodo).toHaveClass('completed');
	});

	test('should allow me to un-mark items as complete', async ({ page }) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		for (const todo of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(todo);
			await newTodo.press('Enter');
		}

		const firstTodo = page.getByTestId('todo-item').nth(0);
		const secondTodo = page.getByTestId('todo-item').nth(1);
		const firstTodoCheckbox = firstTodo.getByRole('checkbox');

		await firstTodoCheckbox.check();
		await expect(firstTodo).toHaveClass('completed');
		await expect(secondTodo).not.toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await listsOfTodos(page, 0, 'one-item-complete.png');
		await ariaSnapshot(page, null, 'one-item-complete', true);

		await firstTodoCheckbox.uncheck();
		await expect(firstTodo).not.toHaveClass('completed');
		await expect(secondTodo).not.toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 0);
		await listsOfTodos(page, 0, 'both-items-uncompleted.png');
		await ariaSnapshot(page, null, 'both-items-uncompleted', true);
	});

	test('should allow me to edit an item', async ({ page }) => {
		await createDefaultTodos(page);
		const TEXT = 'Buy some sausages';

		const todoItems = page.getByTestId('todo-item');
		const secondTodo = todoItems.nth(1);
		await secondTodo.dblclick();
		const secondTodoTextbox = secondTodo.getByRole('textbox', {
			name: 'Edit',
		});
		await expect(secondTodoTextbox).toHaveValue(TODO_ITEMS[1]);
		await expect(secondTodoTextbox).toHaveScreenshot(
			'editing-second-todo-textbox.png'
		);
		await ariaSnapshot(
			page,
			secondTodoTextbox,
			'editing-second-todo-textbox'
		);
		await secondTodoTextbox.fill(TEXT);
		await secondTodoTextbox.press('Enter');

		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, TEXT);
		await listsOfTodos(page, 0, 'edited-todo-list.png');
		await ariaSnapshot(page, null, 'edited-todo0list', true);
	});
});

test.describe('Editing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should hide other controls when editing', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item').nth(1);
		await todoItem.dblclick();
		await expect(todoItem.getByRole('checkbox')).not.toBeVisible();
		const secondTodoItem = todoItem.locator('label', {
			hasText: TODO_ITEMS[1],
		});
		await expect(secondTodoItem).not.toBeVisible();
		await listsOfTodos(page, null, 'editing-second-todo-item.png');
		await expect(todoItem).toHaveScreenshot('controls-hidden.png');
		await ariaSnapshot(page, null, 'controls-hidden', true);
	});

	test('should save edits on blur', async ({ page }) => {
		const TEXT = 'buy some sausages';
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		const todoItemTextbox = todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' });
		await todoItemTextbox.fill(TEXT);
		await todoItemTextbox.dispatchEvent('blur');

		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, TEXT);
		await listsOfTodos(page, 0, 'edited-second-list.png');
		await ariaSnapshot(page, null, 'edited-second-list', true);
	});

	test('should trim entered text', async ({ page }) => {
		const TEXT = 'buy one more burger please';
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		const todoItemTextbox = todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' });
		await todoItemTextbox.fill(`   ${TEXT}   `);
		await todoItemTextbox.press('Enter');

		await expect(todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);

		await checkTodosInLocalStorage(page, TEXT);
		await listsOfTodos(page, 0, 'trimmed-text.png');
		await ariaSnapshot(page, null, 'trimmed-text', true);
	});

	test('should remove the item if an empty text string was entered', async ({
		page,
	}) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		const todoItemsTextbox = todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' });
		await todoItemsTextbox.fill('');
		await todoItemsTextbox.press('Enter');

		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
		await listsOfTodos(page, 0, 'empty-string-removed.png');
		await ariaSnapshot(page, null, 'empty-string-removed', true);
	});

	test('should cancel edits on escape', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).dblclick();
		const todoItemTextbox = todoItems
			.nth(1)
			.getByRole('textbox', { name: 'Edit' });
		await todoItemTextbox.fill('buy one more burger please');
		await todoItemTextbox.press('Escape');
		await expect(todoItems).toHaveText(TODO_ITEMS);
		await listsOfTodos(page, 0, 'three-todos-added.png');
		await ariaSnapshot(page, null, 'three-todos-added', true);
	});
});

test.describe('Counter', () => {
	test('should display the current number of todo items', async ({
		page,
	}) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		const todoCount = page.getByTestId('todo-count');

		await newTodo.fill(TODO_ITEMS[0]);
		await newTodo.press('Enter');

		await expect(todoCount).toContainText('1');

		await newTodo.fill(TODO_ITEMS[1]);
		await newTodo.press('Enter');
		await expect(todoCount).toContainText('2');

		await checkNumberOfTodosInLocalStorage(page, 2);
		await listsOfTodos(page, 0, 'two-todos-check.png');
		await ariaSnapshot(page, null, 'two-todos-check', true);
	});
});

test.describe('Clear completed button', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
	});

	test('should display the correct text', async ({ page }) => {
		await page.locator('.todo-list li .toggle').first().click();
		const clearButton = page.getByRole('button', {
			name: 'Clear completed',
		});
		await expect(clearButton).toBeVisible();
		await expect(clearButton).toHaveScreenshot('clear-button.png');
		await ariaSnapshot(page, clearButton, 'clear-button');
	});

	test('should remove completed items when clicked', async ({ page }) => {
		const todoItems = page.getByTestId('todo-item');
		await todoItems.nth(1).getByRole('checkbox').check();
		await page.getByRole('button', { name: 'Clear completed' }).click();
		await expect(todoItems).toHaveCount(2);
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
		await listsOfTodos(page, 0, 'todo-after-clear.png');
		await ariaSnapshot(page, null, 'todo-after-clear', true);
	});

	test('should be hidden when there are no items that are completed', async ({
		page,
	}) => {
		await page.locator('.todo-list li .toggle').first().click();
		await page.getByRole('button', { name: 'Clear completed' }).click();
		await expect(
			page.getByRole('button', { name: 'Clear completed' })
		).toBeHidden();
		await expect(page).toHaveScreenshot('clear-button-hidden.png');
		await ariaSnapshot(page, null, 'clear-button-hidden', false);
	});
});

test.describe('Persistence', () => {
	test('should persist its data', async ({ page }) => {
		const newTodo = page.getByPlaceholder('What needs to be done?');

		for (const todo of TODO_ITEMS.slice(0, 2)) {
			await newTodo.fill(todo);
			await newTodo.press('Enter');
		}

		const todoItems = page.getByTestId('todo-item');
		const firstTodoCheck = todoItems.nth(0).getByRole('checkbox');
		await firstTodoCheck.check();
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);
		await listsOfTodos(page, 0, 'todo-persistence.png');
		await ariaSnapshot(page, null, 'todo-persistence', true);
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		await page.reload();
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);
		await listsOfTodos(page, 0, 'todo-persistence.png');
		await ariaSnapshot(page, null, 'todo-not-persistence', true);
	});
});

test.describe('Routing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
	});

	test('should allow me to display active items', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item');
		await page
			.getByTestId('todo-item')
			.nth(1)
			.getByRole('checkbox')
			.check();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Active' }).click();
		await expect(todoItem).toHaveCount(2);
		await expect(todoItem).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
		await listsOfTodos(page, 0, 'active-items.png');
		await ariaSnapshot(page, null, 'active-items', true);
	});

	test('should respect the back button', async ({ page }) => {
		const todoItem = page.getByTestId('todo-item');
		await page
			.getByTestId('todo-item')
			.nth(1)
			.getByRole('checkbox')
			.click();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		await test.step('showing all items', async () => {
			await page.getByRole('link', { name: 'All' }).click();
			await expect(todoItem).toHaveCount(3);
			await listsOfTodos(page, 0, 'all-page.png');
			await ariaSnapshot(page, null, 'showing-all-page', true);
		});

		await test.step('Showing active items', async () => {
			await page.getByRole('link', { name: 'Active' }).click();
			await listsOfTodos(page, 0, 'active-page.png');
			await ariaSnapshot(page, null, 'showing-active-page', true);
		});

		await test.step('Showing completed items', async () => {
			await page.getByRole('link', { name: 'Completed' }).click();
			await listsOfTodos(page, 0, 'completed-page.png');
			await ariaSnapshot(page, null, 'completed-page', true);
		});

		await expect(todoItem).toHaveCount(1);
		await listsOfTodos(page, 0, 'completed-page.png');
		await ariaSnapshot(page, null, 'completed-page', true);

		await page.goBack();

		await expect(todoItem).toHaveCount(2);
		await listsOfTodos(page, 0, 'active-page.png');
		await ariaSnapshot(page, null, 'showing-active-page-2', true);

		await page.goBack();

		await expect(todoItem).toHaveCount(3);
		await listsOfTodos(page, 0, 'all-page.png');
		await ariaSnapshot(page, null, 'showing-all-page-2', true);
	});

	test('should allow me to display completed items', async ({ page }) => {
		await page
			.getByTestId('todo-item')
			.nth(1)
			.getByRole('checkbox')
			.check();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Completed' }).click();
		await expect(page.getByTestId('todo-item')).toHaveCount(1);
		await listsOfTodos(page, 0, 'completed-page.png');
		await ariaSnapshot(page, null, 'completed-page', true);
	});

	test('should allow me to display all items', async ({ page }) => {
		await page
			.getByTestId('todo-item')
			.nth(1)
			.getByRole('checkbox')
			.check();

		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await page.getByRole('link', { name: 'Active' }).click();
		await page.getByRole('link', { name: 'Completed' }).click();
		await page.getByRole('link', { name: 'All' }).click();
		await expect(page.getByTestId('todo-item')).toHaveCount(3);
		await listsOfTodos(page, 0, 'all-page.png');
		await ariaSnapshot(page, null, 'all-page', true);
	});

	test('should highlight the currently applied filter', async ({ page }) => {
		const allLink = page.getByRole('link', { name: 'All' });
		const activeLink = page.getByRole('link', { name: 'Active' });
		const completedLink = page.getByRole('link', { name: 'Completed' });

		await expect(allLink).toHaveClass('selected');
		await expect(allLink).toHaveScreenshot('all-link.png');
		await ariaSnapshot(page, allLink, 'all-link');

		await activeLink.click();
		await expect(activeLink).toHaveClass('selected');
		await expect(activeLink).toHaveScreenshot('active-link.png');
		await ariaSnapshot(page, activeLink, 'active-link');

		await completedLink.click();
		await expect(completedLink).toHaveClass('selected');
		await expect(completedLink).toHaveScreenshot('completed-link.png');
		await ariaSnapshot(page, completedLink, 'completed-link');
	});
});

/* create a Page Object Model for all of the tests here */

const ariaSnapshot = async (
	page: Page,
	locator: Locator | null = null,
	snapshotName: string,
	boolean: boolean = false
) => {
	let snapshot;

	if (locator) {
		// console.log('Inside of locator because i found locator not null>>>>>>');
		const elementHandle = await locator.elementHandle();
		if (!elementHandle) {
			throw new Error('Locator did not resolve to an element.');
		}
		snapshot = await page.accessibility.snapshot({ root: elementHandle });
	} else {
		// if (boolean) {
		// 	console.log('inside boolean>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		// 	const locate = page.locator('.todoapp');
		// 	// const locate = page.getByPlaceholder('What needs to be done?');
		// 	const elementHandle = await locate.elementHandle();
		// 	if (!elementHandle) {
		// 		throw new Error('Locator did not resolve to an element');
		// 	}
		// 	snapshot = await page.accessibility.snapshot({
		// 		root: elementHandle,
		// 	});
		// } else {
		// console.log('did not find anything so taking full page aria>>>>>>');
		snapshot = await page.accessibility.snapshot();
		// }
	}

	const snapshotDir = path.resolve(__dirname, 'accessibility-snapshots');
	if (!fs.existsSync(snapshotDir)) {
		fs.mkdirSync(snapshotDir, { recursive: true });
	}

	const snapshotPath = path.join(snapshotDir, `${snapshotName}.json`);

	if (fs.existsSync(snapshotPath)) {
		const existingSnapshot = fs.readFileSync(snapshotPath, 'utf-8');

		const newSnapshotString = JSON.stringify(snapshot, null, 2);

		expect(existingSnapshot).toBe(newSnapshotString);
	} else {
		fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
		expect(fs.existsSync(snapshotPath)).toBeTruthy();
	}
};

const listsOfTodos = async (page: Page, index: any, screenshotName: string) => {
	const todoLists = page.locator('ul.todo-list');

	if (index !== null) {
		await todoLists.nth(index).hover();
	}

	await expect(todoLists).toHaveScreenshot(screenshotName, {
		maxDiffPixels: 38,
	});
};

const createDefaultTodos = async (page: Page) => {
	const newTodo = page.getByPlaceholder('What needs to be done?');

	for (const todo of TODO_ITEMS) {
		await newTodo.fill(todo);
		await newTodo.press('Enter');
	}
};

const checkNumberOfTodosInLocalStorage = async (
	page: Page,
	expected: number
) => {
	return await page.waitForFunction((e) => {
		return JSON.parse(localStorage['react-todos']).length === e;
	}, expected);
};

const checkNumberOfCompletedTodosInLocalStorage = async (
	page: Page,
	expected: number
) => {
	return await page.waitForFunction((e) => {
		return (
			JSON.parse(localStorage['react-todos']).filter(
				(todo: any) => todo.completed
			).length === e
		);
	}, expected);
};

const checkTodosInLocalStorage = async (page: Page, title: string) => {
	return await page.waitForFunction((t) => {
		return JSON.parse(localStorage['react-todos'])
			.map((todo: any) => todo.title)
			.includes(t);
	}, title);
};
