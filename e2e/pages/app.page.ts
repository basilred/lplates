import { Page } from '@playwright/test';

export class AppPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async searchPlate(plate: string) {
    const input = this.page.getByRole('textbox');
    await input.fill(plate);
  }

  async getResults(): Promise<string[]> {
    const items = this.page.locator('.List-Item');
    const count = await items.count();
    const results: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) results.push(text.trim());
    }
    
    return results;
  }

  async getNoResultsMessage(): Promise<string | null> {
    const emptyState = this.page.locator('.List-Empty');
    if (await emptyState.count() > 0) {
      return await emptyState.textContent();
    }
    return null;
  }

  async switchLanguage(langCode: string) {
    // Убедимся, что LanguageSwitcher видим (если скрыт, очищаем input и убираем фокус)
    const switcherButton = this.page.locator('.LanguageSwitcher-Button');
    const isSwitcherVisible = await switcherButton.isVisible();
    if (!isSwitcherVisible) {
      // Очищаем input, чтобы query стала пустой
      await this.clearInput();
      // Кликаем на body, чтобы убрать фокус
      await this.page.locator('body').click({ force: true });
      await switcherButton.waitFor({ state: 'visible', timeout: 5000 });
    }
    
    // Открываем выпадающий список языков
    await switcherButton.click();
    
    // Ждем появления dropdown
    await this.page.waitForSelector('.LanguageSwitcher-Dropdown', { state: 'visible' });
    
    // Ищем кнопку языка по коду (EN, RU, UA, CZ, BY) в элементе LanguageSwitcher-OptionCode
    const langButton = this.page.locator('.LanguageSwitcher-Option').filter({
      has: this.page.locator(`.LanguageSwitcher-OptionCode:has-text("${langCode.toUpperCase()}")`)
    });
    
    // Альтернативный поиск по коду в тексте кнопки
    if (await langButton.count() === 0) {
      const allOptions = this.page.locator('.LanguageSwitcher-Option');
      const count = await allOptions.count();
      for (let i = 0; i < count; i++) {
        const option = allOptions.nth(i);
        const text = await option.textContent();
        if (text && text.toUpperCase().includes(langCode.toUpperCase())) {
          await option.click();
          break;
        }
      }
    } else {
      await langButton.click();
    }
    
    // Ждем закрытия dropdown
    await this.page.waitForSelector('.LanguageSwitcher-Dropdown', { state: 'hidden' });
  }

  async getCurrentLanguage(): Promise<string> {
    // Ищем текущий язык в кнопке выбора языка
    const currentLangCode = this.page.locator('.LanguageSwitcher-Code');
    if (await currentLangCode.count() > 0) {
      const text = await currentLangCode.textContent();
      if (text) return text.trim();
    }
    
    // Альтернативно: ищем в кнопке Select language
    const langButton = this.page.locator('.LanguageSwitcher-Button');
    if (await langButton.count() > 0) {
      const buttonText = await langButton.textContent();
      if (buttonText && buttonText.includes('EN')) return 'EN';
      if (buttonText && buttonText.includes('RU')) return 'RU';
      if (buttonText && buttonText.includes('UA')) return 'UA';
      if (buttonText && buttonText.includes('CZ')) return 'CZ';
      if (buttonText && buttonText.includes('BY')) return 'BY';
    }
    
    // Если LanguageSwitcher скрыт, проверяем атрибут lang у html
    const htmlLang = await this.page.locator('html').getAttribute('lang');
    if (htmlLang) {
      return htmlLang.toUpperCase();
    }
    
    return 'EN';
  }

  async getTitle(): Promise<string | null> {
    return await this.page.locator('.App-Title').textContent();
  }

  async getDescription(): Promise<string | null> {
    return await this.page.locator('.App-Description').textContent();
  }

  async getStats() {
    return {
      regions: await this.page.locator('.App-Stat').nth(0).textContent(),
      codes: await this.page.locator('.App-Stat').nth(1).textContent(),
      countries: await this.page.locator('.App-Stat').nth(2).textContent(),
    };
  }

  async toggleFlags() {
    await this.page.getByRole('button', { name: /flags|флаги/i }).click();
  }

  async isInputFocused(): Promise<boolean> {
    const input = this.page.getByRole('textbox');
    return await input.evaluate((el) => document.activeElement === el);
  }

  async clearInput() {
    const input = this.page.getByRole('textbox');
    await input.fill('');
  }

  async getInputValue(): Promise<string> {
    const input = this.page.getByRole('textbox');
    return await input.inputValue();
  }

  async waitForResults() {
    await this.page.waitForSelector('.List, .Results-Empty', { state: 'visible' });
  }
}
