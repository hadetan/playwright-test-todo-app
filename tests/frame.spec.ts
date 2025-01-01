import test, { expect } from '@playwright/test';

test('should click on the frame', async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	await page.goto('https://docs.oracle.com/javase/8/docs/api/');

	await page
		.frame('packageListFrame')
		?.getByRole('link', { name: 'java.applet' })
		.click();

	const [newPage] = await Promise.all([
        // NOW AWAIT HERE -

		context.waitForEvent('page'),
		page
			.frame('classFrame')
			?.getByRole('link', { name: 'documentation redistribution policy' })
			.click(),
	]);

	await expect(newPage).toHaveURL(
		'https://www.oracle.com/java/technologies/redistribution-policy.html'
	);
	await page.pause();
    // await newPage.close();
    await page.bringToFront();

    await page
        .frame('packageListFrame')
        ?.getByRole('link', {name: 'java.awt', exact: true})
        .click();

    await page.pause();
});
