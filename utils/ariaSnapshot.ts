import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ariaSnapshot = async (
    page: Page,
    locator: Locator | null = null,
    snapshotName: string
): Promise<void> => {
    let snapshot;

    if (locator) {
        const elementHandle = await locator.elementHandle();
        if (!elementHandle) {
            throw new Error('Locator did not resolve to an element.');
        }
        snapshot = await page.accessibility.snapshot({ root: elementHandle });
    } else {
        snapshot = await page.accessibility.snapshot();
    }

    const browserName = page.context().browser()?.browserType().name() || 'unknown-browser';
    const platform = process.platform;

    const snapshotDir = path.resolve(__dirname, 'accessibility-snapshots');
    if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
    }

    const snapshotPath = path.join(snapshotDir, `${snapshotName}-${browserName}-${platform}.json`);

    if (fs.existsSync(snapshotPath)) {
        const existingSnapshot = fs.readFileSync(snapshotPath, 'utf-8');

        const newSnapshotString = JSON.stringify(snapshot, null, 2);

        expect(existingSnapshot).toBe(newSnapshotString);
    } else {
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
        expect(fs.existsSync(snapshotPath)).toBeTruthy();
    }
};

export default ariaSnapshot;