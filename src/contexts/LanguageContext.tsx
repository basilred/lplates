import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale } from '../locales';

export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const defaultLocale: Locale = 'en';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Инициализация локали из localStorage или определение языка браузера
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && savedLocale in translations) {
      setLocaleState(savedLocale);
      return;
    }

    // Определение языка браузера
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (browserLang in translations) {
      setLocaleState(browserLang);
    } else {
      setLocaleState(defaultLocale);
    }
  }, []);

  // Сохранение локали в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Обновляем атрибут lang у html
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale in translations) {
      setLocaleState(newLocale);
    }
  };

  // Функция перевода
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Если перевод не найден, попробуем английский как fallback
        let fallbackValue: any = translations.en;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Возвращаем ключ, если перевод отсутствует
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Подстановка параметров
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
        value
      );
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
