import { expect, test } from '@playwright/test';

async function waitForServiceWorkerControl(page: import('@playwright/test').Page) {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    await navigator.serviceWorker.ready;
    return true;
  });

  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
  }

  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}

test('starts from the cached app shell while offline', async ({ context, page }) => {
  await page.goto('./');
  await expect(page.getByRole('textbox')).toBeVisible();

  await waitForServiceWorkerControl(page);

  await context.setOffline(true);
  await page.goto('./');

  await expect(page.locator('.App-Shell')).toBeVisible();
  await expect(page.getByRole('textbox')).toBeVisible();
});
