/**
 * Возвращает эмодзи флага для указанной страны.
 * 
 * @param country Код страны (например, 'ru', 'ua')
 * @returns Строка с эмодзи флага
 */
export const getCountryFlag = (country: string): string => {
  switch (country) {
    case 'ru':
      return '🇷🇺';
    case 'ua':
      return '🇺🇦';
    case 'cz':
      return '🇨🇿';
    case 'by':
      return '🇧🇾';
    case 'es':
      return '🇪🇸';
    default:
      return '🏳️';
  }
};

/**
 * Возвращает локализованное название страны.
 * Если перевод отсутствует, возвращает название на английском по умолчанию.
 *
 * @param country Код страны
 * @param t Функция перевода
 * @returns Название страны
 */
export const getCountryLabel = (country: string, t: (key: string) => string): string => {
  const translated = t(`countries.${country}`);
  if (translated && translated !== `countries.${country}`) {
    return translated;
  }

  switch (country) {
    case 'ru':
      return 'Russia';
    case 'ua':
      return 'Ukraine';
    case 'cz':
      return 'Czech Republic';
    case 'by':
      return 'Belarus';
    case 'es':
      return 'Spain';
    default:
      return country.toUpperCase();
  }
};

