import { test, expect } from '@playwright/test';
import TodoPage from '../todo-app/TodoPage';
import ariaSnapshot from '../utils/ariaSnapshot';
import screenshotHelper from '../utils/screenshotHelper';
import { TODO_ITEMS } from '../utils/todoItems';
import createDefaultTodos from '../utils/createDefaultTodos';
import checkNumberOfTodosInLocalStorage from '../utils/checkNumberOfTodosInLocalStorage';
import checkNumberOfCompletedTodosInLocalStorage from '../utils/checkNumberOfCompletedTodosInLocalStorage';
import checkTodosInLocalStorage from '../utils/checkTodosInLocalStorage';

test.beforeEach(async ({ page }) => {
	const todoPage = new TodoPage(page);
	await todoPage.goto();
});

test.describe('New Todo', () => {
	test('should allow me to add todo items', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.addTodoItem(TODO_ITEMS[0]);
		await expect(todoPage.getTodoItemsText()).resolves.toContain(
			TODO_ITEMS[0]
		);

		await todoPage.addTodoItem(TODO_ITEMS[1]);
		await expect(todoPage.getTodoItemsText()).resolves.toContain(
			TODO_ITEMS[1]
		);

		await checkNumberOfTodosInLocalStorage(page, 2);
		await expect(page).toHaveScreenshot('two-todos-added.png');
		await ariaSnapshot(page, null, 'two-todos-added');
	});

	test('should clear text input field when an item is added', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);

		await todoPage.addTodoItem(TODO_ITEMS[0]);
		await expect(todoPage.newTodoInput).toBeEmpty();
		await expect(todoPage.newTodoInput).toHaveScreenshot(
			'input-field-cleared.png'
		);
		await ariaSnapshot(page, todoPage.newTodoInput, 'input-field-cleared');
		await checkNumberOfTodosInLocalStorage(page, 1);
	});

	test('should append new items to the bottom of the list', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);
		await createDefaultTodos(page);

		await expect(todoPage.todoCount).toHaveText('3 items left');
		await expect(todoPage.todoCount).toHaveScreenshot(
			'three-items-left.png'
		);

		await expect(todoPage.getTodoItemsText()).resolves.toEqual(TODO_ITEMS);
		await screenshotHelper(page, null, 'three-todos-added.png');
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
		const todoPage = new TodoPage(page);

		await todoPage.markAllAsComplete();
		await expect(todoPage.todoItems).toHaveClass([
			'completed',
			'completed',
			'completed',
		]);

		await checkNumberOfCompletedTodosInLocalStorage(page, 3);
		await screenshotHelper(page, null, 'all-items-completed.png');
		await ariaSnapshot(page, null, 'all-three-items-completed');
	});

	test('should allow me to clear the completion state of all items', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);

		await todoPage.markAllAsComplete();
		await todoPage.unmarkAllAsComplete();

		await expect(todoPage.todoItems).toHaveClass(['', '', '']);
		await screenshotHelper(page, null, 'all-items-uncompleted.png');
		await ariaSnapshot(page, null, 'all-items-uncompleted.png');
	});

	test('complete all checkbox should update state when items are completed / cleared', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);

		await todoPage.markAllAsComplete();
		await expect(todoPage.toggleAll).toBeChecked();
		await checkNumberOfCompletedTodosInLocalStorage(page, 3);

		const firstTodo = await todoPage.getNthTodoItem(0);
		await firstTodo.getByRole('checkbox').uncheck();
		await screenshotHelper(page, null, 'two-items-completed.png');
		await ariaSnapshot(page, null, 'two-items-completed');

		await expect(todoPage.toggleAll).not.toBeChecked();

		await firstTodo.getByRole('checkbox').check();
		await checkNumberOfTodosInLocalStorage(page, 3);

		await expect(todoPage.toggleAll).toBeChecked();
		await screenshotHelper(page, null, 'all-items-completed.png');
		await ariaSnapshot(page, null, 'all-items-completed');
	});
});

test.describe('Item', () => {
	test('should allow me to mark items as complete', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.addSpecificItems(0, 2);

		const firstTodo = await todoPage.getNthTodoItem(0);
		await firstTodo.getByRole('checkbox').check();
		await expect(firstTodo).toHaveClass('completed');
		await screenshotHelper(page, 0, 'first-item-completed.png');
		await ariaSnapshot(page, null, 'first-item-completed');

		const secondTodo = await todoPage.getNthTodoItem(1);
		await expect(secondTodo).not.toHaveClass('completed');
		await secondTodo.getByRole('checkbox').check();
		await screenshotHelper(page, 0, 'second-item-completed.png');
		await ariaSnapshot(page, null, 'second-item-completed');

		await expect(firstTodo).toHaveClass('completed');
		await expect(secondTodo).toHaveClass('completed');
	});

	test('should allow me to un-mark items as complete', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.addSpecificItems(0, 2);

		const firstTodo = await todoPage.getNthTodoItem(0);
		const secondTodo = await todoPage.getNthTodoItem(1);
		const firstTodoCheckbox = firstTodo.getByRole('checkbox');

		await firstTodoCheckbox.check();
		await expect(firstTodo).toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await screenshotHelper(page, 0, 'one-item-complete.png');
		await ariaSnapshot(page, null, 'one-item-complete');

		await firstTodoCheckbox.uncheck();
		await expect(firstTodo).not.toHaveClass('completed');
		await expect(secondTodo).not.toHaveClass('completed');
		await checkNumberOfCompletedTodosInLocalStorage(page, 0);
		await screenshotHelper(page, 0, 'both-items-uncompleted.png');
		await ariaSnapshot(page, null, 'both-items-uncompleted');
	});

	test('should allow me to edit an item', async ({ page }) => {
		const todoPage = new TodoPage(page);
		await createDefaultTodos(page);
		const TEXT = todoPage.TEXT;

		await todoPage.doubleClickNthTodoItem(1);
		const secondTodoTextbox = await todoPage.getNthTodoItemTextbox(1);

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

		await expect(todoPage.todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, TEXT);
		await screenshotHelper(page, 0, 'edited-todo-list.png');
		await ariaSnapshot(page, null, 'edited-todo-list');
	});
});

test.describe('Editing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkNumberOfTodosInLocalStorage(page, 3);
	});

	test('should hide other controls when editing', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.doubleClickNthTodoItem(1);
		const todoItem = await todoPage.getNthTodoItem(1);
		await expect(todoItem.getByRole('checkbox')).not.toBeVisible();

		const secondTodoItem = todoItem.locator('label', {
			hasText: TODO_ITEMS[1],
		});
		await expect(secondTodoItem).not.toBeVisible();
		await screenshotHelper(page, 0, 'editing-second-todo-item.png');
		await expect(todoItem).toHaveScreenshot('controls-hidden.png');
		await ariaSnapshot(page, null, 'controls-hidden');
	});

	test('should save edits on blur', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const TEXT = todoPage.TEXT;

		await todoPage.editTodoItem(1, TEXT);

		await expect(todoPage.todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);
		await checkTodosInLocalStorage(page, TEXT);
		await screenshotHelper(page, 0, 'edited-second-list.png');
		await ariaSnapshot(page, null, 'edited-second-list');
	});

	test('should trim entered text', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const TEXT = todoPage.TEXT;
		await todoPage.editTodoItem(1, `    ${TEXT}    `);

		await expect(todoPage.todoItems).toHaveText([
			TODO_ITEMS[0],
			TEXT,
			TODO_ITEMS[2],
		]);

		await checkTodosInLocalStorage(page, TEXT);
		await screenshotHelper(page, 0, 'trimmed-text.png');
		await ariaSnapshot(page, null, 'trimmed-text');
	});

	test('should remove the item if an empty text string was entered', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);
		await todoPage.editTodoItem(1, '');

		await expect(todoPage.todoItems).toHaveText([
			TODO_ITEMS[0],
			TODO_ITEMS[2],
		]);
		await screenshotHelper(page, 0, 'empty-string-removed.png');
		await ariaSnapshot(page, null, 'empty-string-removed');
	});

	test('should cancel edits on escape', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const TEXT = todoPage.TEXT;

		todoPage.doubleClickNthTodoItem(1);
		const todoItemTextbox = await todoPage.getNthTodoItemTextbox(1);
		await todoItemTextbox.fill(TEXT);
		await todoItemTextbox.press('Escape');

		await expect(todoPage.todoItems).toHaveText(TODO_ITEMS);
		await screenshotHelper(page, 0, 'three-todos-added.png');
		await ariaSnapshot(page, null, 'three-todos-added');
	});
});

/* 
		START TESTING FROM HERE
*/

test.describe('Counter', () => {
	test('should display the current number of todo items', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);

		await todoPage.addTodoItem(TODO_ITEMS[0]);
		await expect(todoPage.getTodoCountText()).resolves.toContain('1');

		await todoPage.addTodoItem(TODO_ITEMS[1]);
		await expect(todoPage.getTodoCountText()).resolves.toContain('2');

		await checkNumberOfTodosInLocalStorage(page, 2);
		await screenshotHelper(page, 0, 'two-todos-check.png');
		await ariaSnapshot(page, null, 'two-todos-check');
	});
});

test.describe('Clear completed button', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
	});

	test('should display the correct text', async ({ page }) => {
		const todoPage = new TodoPage(page);
		await todoPage.toggleFirstTodoItem();
		const clearButton = todoPage.clearCompletedButton;
		await expect(clearButton).toBeVisible();
		await expect(clearButton).toHaveScreenshot('clear-button.png');
		await ariaSnapshot(page, clearButton, 'clear-button');
	});

	test('should remove completed items when clicked', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.markItemAsComplete(1);
		await todoPage.clearAllCompleted();

		const todoItems = todoPage.todoItems;
		await expect(todoItems).toHaveCount(2);
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

		await screenshotHelper(page, 0, 'todo-after-clear.png');
		await ariaSnapshot(page, null, 'todo-after-clear');
	});

	test('should be hidden when there are no items that are completed', async ({
		page,
	}) => {
		const todoPage = new TodoPage(page);

		await todoPage.toggleFirstTodoItem();
		await todoPage.clearAllCompleted();

		await expect(todoPage.clearCompletedButton).toBeHidden();
		await expect(page).toHaveScreenshot('clear-button-hidden.png');
		await ariaSnapshot(page, null, 'clear-button-hidden');
	});
});

test.describe('Persistence', () => {
	test('should persist its data', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const todoItems = todoPage.todoItems;
		const firstTodoCheck = todoPage.nthTodoCheck(0);

		await todoPage.addSpecificItems(0, 2);
		await todoPage.markItemAsComplete(0);
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).resolves.toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);
		await screenshotHelper(page, 0, 'todo-persistence.png');
		await ariaSnapshot(page, null, 'todo-persistence');
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		await page.reload();
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
		await expect(firstTodoCheck).resolves.toBeChecked();
		await expect(todoItems).toHaveClass(['completed', '']);
		await screenshotHelper(page, 0, 'todo-persistence.png');
		await ariaSnapshot(page, null, 'todo-not-persistence');
	});
});

test.describe('Routing', () => {
	test.beforeEach(async ({ page }) => {
		await createDefaultTodos(page);
		await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
	});

	test('should allow me to display active items', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const todoItems = todoPage.todoItems;

		await todoPage.markItemAsComplete(1);
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await todoPage.active.click();
		await expect(todoItems).toHaveCount(2);
		await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
		await screenshotHelper(page, 0, 'active-items.png');
		await ariaSnapshot(page, null, 'active-items');
	});

	test('should respect the back button', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const todoItems = todoPage.todoItems;

		await todoPage.markItemAsComplete(1);
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);

		await test.step('showing all items', async () => {
			await todoPage.all.click();
			await expect(todoItems).toHaveCount(3);
			await screenshotHelper(page, 0, 'all-page.png');
			await ariaSnapshot(page, null, 'showing-all-page');
		});

		await test.step('Showing active items', async () => {
			await todoPage.active.click();
			await screenshotHelper(page, 0, 'active-page.png');
			await ariaSnapshot(page, null, 'showing-active-page');
		});

		await test.step('Showing completed items', async () => {
			await todoPage.completed.click();
			await screenshotHelper(page, 0, 'completed-page.png');
			await ariaSnapshot(page, null, 'completed-page');
		});

		await expect(todoItems).toHaveCount(1);
		await screenshotHelper(page, 0, 'completed-page.png');
		await ariaSnapshot(page, null, 'completed-page');

		await page.goBack();

		await expect(todoItems).toHaveCount(2);
		await screenshotHelper(page, 0, 'active-page.png');
		await ariaSnapshot(page, null, 'showing-active-page-2');

		await page.goBack();

		await expect(todoItems).toHaveCount(3);
		await screenshotHelper(page, 0, 'all-page.png');
		await ariaSnapshot(page, null, 'showing-all-page-2');
	});

	test('should allow me to display completed items', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.markItemAsComplete(1);
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await todoPage.completed.click();
		await expect(todoPage.todoItems).toHaveCount(1);
		await screenshotHelper(page, 0, 'completed-page.png');
		await ariaSnapshot(page, null, 'completed-page');
	});

	test('should allow me to display all items', async ({ page }) => {
		const todoPage = new TodoPage(page);

		await todoPage.markItemAsComplete(1);
		await checkNumberOfCompletedTodosInLocalStorage(page, 1);
		await todoPage.active.click();
		await todoPage.completed.click();
		await todoPage.all.click();
		await expect(todoPage.todoItems).toHaveCount(3);
		await screenshotHelper(page, 0, 'all-page.png');
		await ariaSnapshot(page, null, 'all-page');
	});

	test('should highlight the currently applied filter', async ({ page }) => {
		const todoPage = new TodoPage(page);
		const allLink = todoPage.all;
		const activeLink = todoPage.active;
		const completedLink = todoPage.completed;

		await allLink.click();
		await expect(allLink).toHaveClass('selected');
		await expect(allLink).toHaveScreenshot('all-link.png');
		await ariaSnapshot(page, allLink, 'all-link-focused');

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
