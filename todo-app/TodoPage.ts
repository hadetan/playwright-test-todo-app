import { Page, Locator } from '@playwright/test';
import { TODO_ITEMS } from '../utils/todoItems';

export default class TodoApp {
	readonly page: Page;
	readonly newTodoInput: Locator;
	readonly todoItems: Locator;
	readonly todoLists: Locator;
	readonly todoCount: Locator;
	readonly toggleAll: Locator;
	readonly clearCompletedButton: Locator;
	readonly toggleTodo: Locator;
	readonly all: Locator;
	readonly active: Locator;
	readonly completed: Locator;
	readonly TEXT: string;

	constructor(page: Page) {
		this.page = page;
		this.newTodoInput = page.getByPlaceholder('What needs to be done?');
		this.todoItems = page.getByTestId('todo-item');
		this.todoLists = page.locator('ul.todo-list');
		this.todoCount = page.getByTestId('todo-count');
		this.toggleAll = page.getByLabel('Mark all as complete');
		this.clearCompletedButton = page.getByRole('button', {
			name: 'Clear completed',
		});
		this.toggleTodo = page.locator('.todo-list li .toggle');
		this.all = page.getByRole('link', { name: 'All' });
		this.active = page.getByRole('link', { name: 'Active' });
		this.completed = page.getByRole('link', { name: 'Completed' });
		this.TEXT = 'Buy some sausages';
	}

	async goto(): Promise<void> {
		const p = this.page;
		await p.goto('https://demo.playwright.dev/todomvc/');
		await p.addStyleTag({
			content:
				'* { transition: none !important; animation: none !important; }',
		});
	}

	async addTodoItem(item: string): Promise<void> {
		const i = this.newTodoInput;
		await i.fill(item);
		await i.press('Enter');
	}

	async addSpecificItems(from: number, to: number): Promise<void> {
		for (const item of [...TODO_ITEMS].splice(from, to)) {
			await this.addTodoItem(item);
		}
	}

	async getTodoItemsText(): Promise<string[]> {
		return this.todoItems.allTextContents();
	}

	async markAllAsComplete(): Promise<void> {
		await this.toggleAll.check();
	}

	async unmarkAllAsComplete(): Promise<void> {
		await this.toggleAll.uncheck();
	}

	async clearAllCompleted(): Promise<void> {
		await this.clearCompletedButton.click();
	}

	async getTodoCountText(): Promise<string | null> {
		return this.todoCount.textContent();
	}

	async markItemAsComplete(index: number): Promise<void> {
		await this.todoItems.nth(index).getByRole('checkbox').check();
	}

	async unmarkItemsAsComplete(index: number): Promise<void> {
		await this.todoItems.nth(index).getByRole('checkbox').uncheck();
	}

	async editTodoItem(
		index: number,
		newText: string,
		blur?: boolean
	): Promise<void> {
		const todoItem = this.todoItems.nth(index);
		const todoItemsTextbox = todoItem.getByRole('textbox', {
			name: 'Edit',
		});
		await todoItem.dblclick();
		await todoItemsTextbox.fill(newText);
		blur
			? await todoItemsTextbox.dispatchEvent('blur')
			: await todoItemsTextbox.press('Enter');
	}

	async getNthTodoItem(index: number): Promise<Locator> {
		return this.todoItems.nth(index);
	}

	async getNthTodoCheckbox(index: number): Promise<Locator> {
		return (await this.getNthTodoItem(index)).getByRole('checkbox');
	}

	async doubleClickNthTodoItem(index: number): Promise<void> {
		await this.todoItems.nth(index).dblclick();
	}

	async getNthTodoItemTextbox(index: number): Promise<Locator> {
		return this.todoItems.nth(index).getByRole('textbox', { name: 'Edit' });
	}

	async toggleFirstTodoItem(): Promise<void> {
		await this.toggleTodo.first().click();
	}

	async nthTodoCheck(index: number): Promise<Locator> {
		return this.todoItems.nth(index).getByRole('checkbox');
	}
}
