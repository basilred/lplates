import en from './en.json';
import ru from './ru.json';
import ua from './ua.json';
import cz from './cz.json';
import by from './by.json';
import crh from './crh.json';

export type Locale = 'en' | 'ru' | 'ua' | 'cz' | 'by' | 'crh';

export const translations = {
  en,
  ru,
  ua,
  cz,
  by,
  crh,
} as const;

export type TranslationKey = keyof typeof en;

export default translations;
