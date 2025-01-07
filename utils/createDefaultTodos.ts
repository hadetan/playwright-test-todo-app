import { Page } from '@playwright/test';
import { TODO_ITEMS } from './todoItems';

const createDefaultTodos = async (page: Page): Promise<any> => {
	const newTodo = page.getByPlaceholder('What needs to be done?');

	for (const item of TODO_ITEMS) {
		await newTodo.fill(item);
		await newTodo.press('Enter');
	}
};

export default createDefaultTodos;
