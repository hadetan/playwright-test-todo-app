import { Page, expect } from '@playwright/test';
import TodoApp from '../todo-app/TodoPage';

const screenshotHelper = async (
	page: Page,
	index: any,
	screenshotName: string
): Promise<void> => {
	const todo = new TodoApp(page);

	const todoLists = todo.todoLists;

	if (index !== null) {
		await todoLists.nth(index).hover();
	}

	await expect(todoLists).toHaveScreenshot(screenshotName, {
		maxDiffPixels: 41,
	});
};

export default screenshotHelper;
