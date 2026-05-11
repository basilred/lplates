import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

test.describe('Search history', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    // Очищаем localStorage перед каждым тестом
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await appPage.goto();
  });

  test('should add search queries to history after finding results', async () => {
    // История должна быть пуста изначально
    let history = await appPage.getHistoryItems();
    expect(history.length).toBe(0);

    // Ищем московский номер
    await appPage.searchPlate('A123BC77');
    await appPage.waitForResults();
    
    // Очищаем ввод, чтобы увидеть историю
    await appPage.clearInput();
    
    history = await appPage.getHistoryItems();
    expect(history).toContain('A123BC77');
  });

  test('should populate input when history item is clicked', async () => {
    await appPage.searchPlate('AA1234BB');
    await appPage.waitForResults();
    await appPage.clearInput();
    
    await appPage.clickHistoryItem('AA1234BB');
    const inputValue = await appPage.getInputValue();
    expect(inputValue).toBe('AA1234BB');
    
    const results = await appPage.getResults();
    expect(results.length).toBeGreaterThan(0);
  });

  test('should limit history to 5 items', async () => {
    const queries = ['77', 'AA', 'AK', '78', '01', '99'];
    for (const q of queries) {
      await appPage.searchPlate(q);
      await appPage.waitForResults();
      await appPage.clearInput();
    }
    
    const history = await appPage.getHistoryItems();
    expect(history.length).toBe(5);
    // '77' должен быть вытеснен (LIFO, slice(0,5))
    expect(history).not.toContain('77');
    expect(history).toContain('99');
  });

  test('should clear history when clear button is clicked', async () => {
    await appPage.searchPlate('77');
    await appPage.waitForResults();
    await appPage.clearInput();
    
    let history = await appPage.getHistoryItems();
    expect(history.length).toBeGreaterThan(0);
    
    await appPage.clearHistory();
    history = await appPage.getHistoryItems();
    expect(history.length).toBe(0);
    
    // Проверяем localStorage
    const savedHistory = await appPage.page.evaluate(() => localStorage.getItem('search_history_v1'));
    expect(savedHistory).toBeNull();
  });

  test('should not add duplicates to history', async () => {
    await appPage.searchPlate('77');
    await appPage.waitForResults();
    await appPage.clearInput();
    
    await appPage.searchPlate('77');
    await appPage.waitForResults();
    await appPage.clearInput();
    
    const history = await appPage.getHistoryItems();
    expect(history.filter(h => h === '77').length).toBe(1);
  });
});
