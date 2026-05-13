export type Locale = 'en' | 'ru' | 'ua' | 'cz' | 'by' | 'crh' | 'es';

export interface LanguageInfo {
  code: Locale;
  flag: string;
  label: string;
}

export const LANGUAGE_CONFIG: Record<Locale, LanguageInfo> = {
  en: { code: 'en', flag: '🇺🇸', label: 'English' },
  ru: { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  ua: { code: 'ua', flag: '🇺🇦', label: 'Українська' },
  cz: { code: 'cz', flag: '🇨🇿', label: 'Čeština' },
  by: { code: 'by', flag: '🇧🇾', label: 'Беларуская' },
  crh: { code: 'crh', flag: '🇺🇦', label: 'Къырымтатарджа' },
  es: { code: 'es', flag: '🇪🇸', label: 'Español' },
};

export const LANGUAGES = Object.values(LANGUAGE_CONFIG);
