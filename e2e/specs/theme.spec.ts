import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

test.describe('Theme switching', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
  });

  test('should cycle through themes: system -> light -> dark -> system', async ({ page }) => {
    // Initial state should be system (default)
    let selection = await appPage.getThemeSelection();
    expect(selection === 'system' || selection === null).toBeTruthy();

    // Click to switch to light
    await appPage.toggleTheme();
    await expect.poll(async () => await appPage.getThemeSelection()).toBe('light');
    expect(await appPage.getTheme()).toBe('light');

    // Click to switch to dark
    await appPage.toggleTheme();
    await expect.poll(async () => await appPage.getThemeSelection()).toBe('dark');
    expect(await appPage.getTheme()).toBe('dark');

    // Click to switch back to system
    await appPage.toggleTheme();
    await expect.poll(async () => await appPage.getThemeSelection()).toBe('system');
  });


  test('should persist theme after page reload', async () => {
    // Switch to dark
    await appPage.toggleTheme(); // system -> light
    await expect.poll(async () => await appPage.getThemeSelection()).toBe('light');
    
    await appPage.toggleTheme(); // light -> dark
    await expect.poll(async () => await appPage.getThemeSelection()).toBe('dark');
    
    await appPage.page.reload();
    await appPage.page.waitForSelector('.ThemeToggle');
    
    expect(await appPage.getThemeSelection()).toBe('dark');
    expect(await appPage.getTheme()).toBe('dark');
  });


  test('should have working translations for tooltips', async () => {
    // Default (system) -> next is light
    const button = appPage.page.locator('.ThemeToggle');
    await expect(button).toHaveAttribute('title', /Switch to light theme/);

    // Switch to light -> next is dark
    await appPage.toggleTheme();
    await expect(button).toHaveAttribute('title', /Switch to dark theme/);

    // Switch to Russian
    await appPage.switchLanguage('RU');
    await expect(button).toHaveAttribute('title', /Переключить на темную тему/);

    // Switch to dark -> next is system
    await appPage.toggleTheme();
    await expect(button).toHaveAttribute('title', /Переключить на системную тему/);
  });
});
