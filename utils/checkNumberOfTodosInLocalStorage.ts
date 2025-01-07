import { JSHandle, Page } from '@playwright/test';

const checkNumberOfTodosInLocalStorage = async (
	page: Page,
	expected: number
): Promise<JSHandle<boolean>> => {
	return await page.waitForFunction((e) => {
		return JSON.parse(localStorage['react-todos']).length === e;
	}, expected);
};

export default checkNumberOfTodosInLocalStorage;
