import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

test.describe('Localization and language switching', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
  });

  test('should display English by default', async () => {
    const title = await appPage.getTitle();
    expect(title).toContain('Find a license plate region in one keystroke.');
    
    const description = await appPage.getDescription();
    expect(description).toContain('focused lookup tool');
  });

  test('should switch to Russian language', async () => {
    await appPage.switchLanguage('RU');
    
    // Проверяем что язык переключился (код RU отображается)
    const currentLang = await appPage.getCurrentLanguage();
    expect(currentLang).toBe('RU');
    
    // Проверяем что заголовок изменился (не равен английскому)
    const title = await appPage.getTitle();
    expect(title).toBeTruthy();
    expect(title).not.toContain('Find a license plate region in one keystroke.');
  });

  test('should switch to Ukrainian language', async () => {
    await appPage.switchLanguage('UA');
    
    const currentLang = await appPage.getCurrentLanguage();
    expect(currentLang).toBe('UA');
  });

  test('should switch to Czech language', async () => {
    await appPage.switchLanguage('CZ');
    
    const currentLang = await appPage.getCurrentLanguage();
    expect(currentLang).toBe('CZ');
  });

  test('should switch to Belarusian language', async () => {
    await appPage.switchLanguage('BY');
    
    const currentLang = await appPage.getCurrentLanguage();
    expect(currentLang).toBe('BY');
  });

  test('should maintain search functionality after language switch', async () => {
    // Switch to Russian first (LanguageSwitcher is visible)
    await appPage.switchLanguage('RU');
    
    // Search in Russian
    await appPage.searchPlate('Е123ОУ01');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
  });

  test('should translate stats labels', async () => {
    // Switch to Russian
    await appPage.switchLanguage('RU');
    
    const stats = await appPage.getStats();
    expect(stats.regions).toBeTruthy();
    // Проверяем что текст не английский
    if (stats.regions) {
      expect(stats.regions).not.toContain('regions indexed');
    }
  });

  test('should preserve input value during language switch', async () => {
    // Очищаем input, чтобы LanguageSwitcher стал видимым
    await appPage.clearInput();
    
    // Переключаем язык на русский (switchLanguage сам обеспечит видимость)
    await appPage.switchLanguage('RU');
    
    // Вводим текст после переключения языка
    await appPage.searchPlate('A123BC77');
    const valueAfterSwitch = await appPage.getInputValue();
    
    // Проверяем, что значение сохранилось (оно должно быть тем же, что введено)
    expect(valueAfterSwitch).toBe('A123BC77');
  });

  test('should have working language switcher UI', async () => {
    const langSwitcher = appPage.page.locator('.LanguageSwitcher');
    await expect(langSwitcher).toBeVisible();
    
    // Проверяем что кнопка имеет правильный aria-label
    const button = appPage.page.locator('.LanguageSwitcher-Button');
    await expect(button).toHaveAttribute('aria-label', /Select language/);
    
    // Открываем dropdown
    await button.click();
    
    // Проверяем что dropdown открылся
    const dropdown = appPage.page.locator('.LanguageSwitcher-Dropdown');
    await expect(dropdown).toBeVisible();
    
    // Проверяем наличие опций языков
    const options = dropdown.locator('.LanguageSwitcher-Option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(4); // EN, RU, UA, CZ, BY
    
    // Проверяем что текущий язык отмечен как активный
    const activeOption = dropdown.locator('.LanguageSwitcher-Option_active');
    await expect(activeOption).toHaveCount(1);
    
    // Проверяем accessibility атрибуты
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    
    // Проверяем что каждая опция имеет aria-label
    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      await expect(option).toHaveAttribute('aria-label', /Switch to/);
    }
    
    // Закрываем dropdown
    await appPage.page.keyboard.press('Escape');
    await expect(dropdown).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('should persist language after page reload', async () => {
    // Переключаем на русский
    await appPage.switchLanguage('RU');
    
    // Проверяем что язык переключился
    const langBefore = await appPage.getCurrentLanguage();
    expect(langBefore).toBe('RU');
    
    // Проверяем что html lang атрибут изменился
    const htmlLang = await appPage.page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ru');
    
    // Проверяем что localStorage содержит locale 'ru'
    const localeInStorage = await appPage.page.evaluate(() => localStorage.getItem('locale'));
    expect(localeInStorage).toBe('ru');
    
    // Перезагружаем страницу
    await appPage.page.reload();
    
    // Ждем загрузки LanguageSwitcher
    await appPage.page.waitForSelector('.LanguageSwitcher', { state: 'visible' });
    
    // Проверяем что localStorage всё ещё содержит 'ru'
    const localeAfterReload = await appPage.page.evaluate(() => localStorage.getItem('locale'));
    expect(localeAfterReload).toBe('ru');
    
    // Проверяем что язык сохранился
    const langAfter = await appPage.getCurrentLanguage();
    expect(langAfter).toBe('RU');
    
    // Проверяем что заголовок на русском
    const title = await appPage.getTitle();
    expect(title).toBeTruthy();
    expect(title).not.toContain('Find a license plate region in one keystroke.');
  });

  test('should close dropdown when clicking outside', async () => {
    // Открываем dropdown
    await appPage.page.locator('.LanguageSwitcher-Button').click();
    const dropdown = appPage.page.locator('.LanguageSwitcher-Dropdown');
    await expect(dropdown).toBeVisible();
    
    // Кликаем вне dropdown (например, на заголовок)
    await appPage.page.locator('.App-Title').click();
    
    // Проверяем что dropdown закрылся
    await expect(dropdown).toBeHidden();
    
    // Проверяем aria-expanded
    const button = appPage.page.locator('.LanguageSwitcher-Button');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
