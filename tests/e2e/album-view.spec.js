import { test, expect, _electron as electron } from '@playwright/test';

test.describe('Album view', () => {
  test('renders album header and empty state when no photos exist', async () => {
    const app = await electron.launch({ args: ['.'] });
    const window = await app.firstWindow();

    await window.waitForLoadState('domcontentloaded');
    await window.evaluate(() => {
      window.location.hash = '#album/test-album';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await expect(window.locator('.page-title')).toContainText('Album');
    await expect(window.locator('.empty-state-message')).toContainText('No photos yet');

    await app.close();
  });
});
