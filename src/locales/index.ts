import en from './en.json';
import ru from './ru.json';
import ua from './ua.json';
import cz from './cz.json';
import by from './by.json';
import crh from './crh.json';
import es from './es.json';
import { Locale } from './config';

export type { Locale };

export const translations = {
  en,
  ru,
  ua,
  cz,
  by,
  crh,
  es,
} as const;

export type TranslationKey = keyof typeof en;

export default translations;
export * from './config';
