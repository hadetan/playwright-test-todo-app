import { JSHandle, Page } from '@playwright/test';

const checkTodosInLocalStorage = async (
	page: Page,
	title: string
): Promise<JSHandle<any>> => {
	return await page.waitForFunction((t) => {
		return JSON.parse(localStorage['react-todos'])
			.map((todo: any) => todo.title)
			.includes(t);
	}, title);
};

export default checkTodosInLocalStorage;
