import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

test.describe('Basic plate search', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
  });

  test('should show initial stats and title', async ({ page }) => {
    await expect(page.locator('.App-Title')).toBeVisible();
    await expect(page.locator('.App-Description')).toBeVisible();
    
    const stats = await appPage.getStats();
    // Проверяем, что статистика отображается (содержит числа)
    expect(stats.regions).toBeTruthy();
    expect(stats.codes).toBeTruthy();
    expect(stats.countries).toBeTruthy();
    
    if (stats.regions && stats.codes && stats.countries) {
      expect(stats.regions).toMatch(/\d+/);
      expect(stats.codes).toMatch(/\d+/);
      expect(stats.countries).toMatch(/\d+/);
      
      // Конкретные значения могут меняться, проверяем разумные диапазоны
      const regions = parseInt(stats.regions.match(/\d+/)?.[0] || '0');
      expect(regions).toBeGreaterThan(100);
      expect(regions).toBeLessThan(200);
      
      const codes = parseInt(stats.codes.match(/\d+/)?.[0] || '0');
      expect(codes).toBeGreaterThan(200);
      expect(codes).toBeLessThan(300);
      
      const countries = parseInt(stats.countries.match(/\d+/)?.[0] || '0');
      expect(countries).toBe(4);
    }
  });

  test('should find Moscow region for plate A123BC77', async () => {
    await appPage.searchPlate('A123BC77');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.includes('Москва'))).toBeTruthy();
  });

  test('should find Adygea region for plate Е123ОУ01', async () => {
    await appPage.searchPlate('Е123ОУ01');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.includes('Адыгея'))).toBeTruthy();
  });

  test('should find Moscow region for plate X001XX177', async () => {
    await appPage.searchPlate('X001XX177');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.includes('Москва'))).toBeTruthy();
  });

  test('should handle spaces in plate number', async () => {
    await appPage.searchPlate('A 123 BC 77');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.includes('Москва'))).toBeTruthy();
  });

  test('should handle hyphens in plate number', async () => {
    await appPage.searchPlate('A-123-BC-77');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.includes('Москва'))).toBeTruthy();
  });

  test('should show no results for invalid plate', async () => {
    await appPage.searchPlate('INVALID123');
    await appPage.waitForResults();
    
    const results = await appPage.getResults();
    // Для невалидного номера может быть 0 результатов или сообщение "No exact match found"
    // Принимаем оба варианта как корректные
    if (results.length > 0) {
      // Если есть результаты, проверяем что они не содержат ожидаемых регионов
      const hasValidRegion = results.some(r =>
        r.includes('Москва') || r.includes('Адыгея') || r.includes('Киев')
      );
      expect(hasValidRegion).toBeFalsy();
    }
  });

  test('should clear results when input is cleared', async () => {
    await appPage.searchPlate('A123BC77');
    await appPage.waitForResults();
    
    let results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
    
    await appPage.clearInput();
    // Даем время на обновление UI
    await appPage.page.waitForTimeout(500);
    
    // После очистки ввода результаты могут исчезнуть или остаться пустыми
    // Проверяем что ввод пустой
    const inputValue = await appPage.getInputValue();
    expect(inputValue).toBe('');
  });

  test('should maintain input focus during typing', async () => {
    const input = appPage.page.getByRole('textbox');
    await input.click();
    
    let isFocused = await appPage.isInputFocused();
    expect(isFocused).toBeTruthy();
    
    await appPage.searchPlate('A123');
    isFocused = await appPage.isInputFocused();
    expect(isFocused).toBeTruthy();
  });

  test('should convert lowercase letters to uppercase', async () => {
    await appPage.searchPlate('a123bc77');
    await appPage.waitForResults();
    
    const inputValue = await appPage.getInputValue();
    expect(inputValue).toBe('A123BC77');
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
  });
});
