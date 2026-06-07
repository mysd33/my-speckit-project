import { test, expect, _electron as electron } from '@playwright/test';

async function seedHomeData(appWindow) {
  await appWindow.evaluate(() => {
    // This test expects app-level seed APIs to be added in later tasks.
    // For now we only verify top-level render behavior when no data exists.
  });
}

test.describe('Home page albums', () => {
  test('shows empty state when there are no albums', async () => {
    const app = await electron.launch({ args: ['.'] });
    const window = await app.firstWindow();

    await seedHomeData(window);
    await window.waitForLoadState('domcontentloaded');

    await expect(window.locator('.page-title')).toHaveText('Photo Albums');
    await expect(window.locator('.empty-state-message')).toContainText('No albums yet');

    await app.close();
  });
});
