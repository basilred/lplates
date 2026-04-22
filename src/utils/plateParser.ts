export interface IParsedCodes {
  ru?: string[];
  ua?: string[];
  cz?: string[];
  by?: string[];
  any: string[];
}

/**
 * Normalizes and extracts potential regional codes from a license plate input string.
 * Handles RU, UA, and CZ plate formats.
 */
export function parsePlate(input: string): IParsedCodes {
  const normalized = input.trim().toUpperCase().replace(/[\s-]/g, '');

  // Map of Cyrillic characters to their Latin visual equivalents
  const CYRILLIC_TO_LATIN: Record<string, string> = {
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
    'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X',
    'І': 'I'
  };

  let standardized = '';
  for (const char of normalized) {
    standardized += CYRILLIC_TO_LATIN[char] || char;
  }

  const results: IParsedCodes = {
    any: Array.from(new Set([normalized, standardized]))
  };

  // RU: Russian plates
  // Standard: A123BC77, Trailer: AB123477, Motorcycle: 1234AB77, Public: AB12377, Police: A123477, Military: 1234AA77, Transit: AB123A77
  const ruPatterns = [
    /^[ABEKMHOPCTYX]\d{3}[ABEKMHOPCTYX]{2}(\d{2,3})$/, // Standard
    /^[ABEKMHOPCTYX]{2}\d{4}(\d{2,3})$/,               // Trailer
    /^\d{4}[ABEKMHOPCTYX]{2}(\d{2,3})$/,               // Motorcycle/Military
    /^[ABEKMHOPCTYX]{2}\d{3}(\d{2})$/,                 // Public
    /^[ABEKMHOPCTYX]\d{4}(\d{2})$/,                    // Police
    /^[ABEKMHOPCTYX]{2}\d{3}[ABEKMHOPCTYX](\d{2})$/    // Transit
  ];

  for (const pattern of ruPatterns) {
    const match = standardized.match(pattern);
    if (match) {
      results.ru = [match[1]];
      break;
    }
  }

  // UA: Ukrainian plates (e.g., AA1234BB, KA1234BK)
  const uaMatch = standardized.match(/^([A-Z]{2})\d{4}[A-Z]{2}$/);
  if (uaMatch) {
    results.ua = [uaMatch[1]];
  }

  // CZ: Czech plates (e.g., 1A23456)
  const czMatch = standardized.match(/^\d([A-Z])[\dA-Z]\d{4}$/);
  if (czMatch) {
    results.cz = [czMatch[1]];
  }
  
  // BY: Belarusian plates (e.g., 1234 AB-7, AB 1234-7)
  const byMatch = standardized.match(/^(\d{4}[A-Z]{2}|[A-Z]{2}\d{4})(\d)$/);
  if (byMatch) {
    results.by = [byMatch[2]];
  }

  return results;
}
