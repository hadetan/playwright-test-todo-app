import test, { expect } from '@playwright/test';

test('should click on youtube', async ({ page }) => {
	await page.goto('https://www.google.com');
	await page.getByRole('combobox').type('mukesh otwani');

	await page.waitForSelector('//li[@role="presentation"]');

	const elements = await page.$$('//li[@role="presentation"]');
	
    for(let i = 0; i < elements.length; i++) {
        const text = await elements[i].textContent();

        if (text?.includes('youtube')) {
            await elements[i].click();
            break;
        }
    }
    await expect(page.locator('#ixcYae').getByRole('link', { name: 'Mukesh otwani YouTube ·' })).toBeVisible();
    await page.waitForTimeout(2000);
});
