import { JSHandle, Page } from '@playwright/test';

const checkNumberOfCompletedTodosInLocalStorage = async (
	page: Page,
	expected: number
): Promise<JSHandle<boolean>> => {
	return await page.waitForFunction((e) => {
		return (
			JSON.parse(localStorage['react-todos']).filter(
				(todo: any) => todo.completed
			).length === e
		);
	}, expected);
};

export default checkNumberOfCompletedTodosInLocalStorage;
