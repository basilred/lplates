import { expect, test } from '@playwright/test';

test.describe('PWA Install Prompt', () => {
  test('prompt is hidden before any user action', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();
  });

  test('prompt appears after successful search', async ({ page }) => {
    await page.goto('./');
    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    await expect(page.locator('.Results')).toBeVisible();

    // Prompt should appear after 1s delay (setTimeout in App.tsx)
    await expect(page.locator('.PWAInstallPrompt')).toBeVisible({ timeout: 5000 });
  });

  test('close button hides prompt and saves dismissed flag', async ({ page }) => {
    await page.goto('./');
    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    await expect(page.locator('.Results')).toBeVisible();
    await expect(page.locator('.PWAInstallPrompt')).toBeVisible({ timeout: 5000 });

    await page.locator('.PWAInstallPrompt-Close').click();
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();

    const dismissed = await page.evaluate(() =>
      localStorage.getItem('pwa_install_dismissed')
    );
    expect(dismissed).toBe('true');
  });

  test('prompt does not reappear after dismissal on reload', async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() =>
      localStorage.setItem('pwa_install_dismissed', 'true')
    );
    await page.reload();

    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    await expect(page.locator('.Results')).toBeVisible();

    // Prompt should NOT appear
    await page.waitForTimeout(3000);
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();
  });

  test('install button in header exists when beforeinstallprompt is available', async ({ page }) => {
    await page.addInitScript(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (window as unknown as Record<string, unknown>).__deferredPrompt = e;
      });
    });

    await page.goto('./');

    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    await expect(page.locator('.Header-InstallButton')).toBeVisible();
  });

  test('install button in header is hidden when app is already installed', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });

    await page.goto('./');
    await expect(page.locator('.Header-InstallButton')).not.toBeVisible();
  });
});
