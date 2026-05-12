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
    default:
      return country.toUpperCase();
  }
};

/**
 * Нормализует название региона для использования в запросах к картам.
 * Удаляет текст в скобках (административные центры) для более точного поиска региона.
 * Для Праги используем английское название для лучшей совместимости с Google Maps.
 *
 * @param regionName Название региона из данных
 * @param countryCode Код страны ('ru', 'ua', 'cz', 'by')
 * @returns Нормализованное название для поиска на картах
 */
export const normalizeRegionNameForMap = (regionName: string, countryCode: string): string => {
  // Удаляем текст в скобках и сами скобки
  let normalized = regionName.replace(/\s*\([^)]*\)/g, '').trim();
  
  // Специальная обработка для Праги
  if (countryCode === 'cz' && normalized === 'Praha') {
    // Используем английское название для лучшего понимания Google Maps
    return 'Prague';
  }
  
  // Для России "Саха (Якутия)" останется "Саха" - это корректно
  // Пользователь указал, что это два названия одной области, но для карт лучше оставить первое
  
  return normalized;
};
