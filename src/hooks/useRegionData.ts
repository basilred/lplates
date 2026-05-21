import { useMemo } from 'react';
import { IData, IDataList } from '../interfaces';

/**
 * Хук для обработки и индексации данных о регионах.
 * Трансформирует древовидную структуру данных в плоский список и создает индекс для быстрого поиска по коду.
 * Поддерживает как старый формат (массив кодов), так и новый формат (объект с codes и mapName).
 *
 * @param data Исходные данные о странах и регионах
 * @returns Объект с плоским списком регионов (originalList) и Map-индексом (codeIndex)
 */
export const useRegionData = (data: IData) => {
  const originalList = useMemo(() => {
    const result: IDataList[] = [];

    for (const country in data) {
      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const regionId in currentCountry) {
          if (currentCountry.hasOwnProperty(regionId)) {
            const regionData = currentCountry[regionId];

            result.push({
              id: regionId,
              codes: regionData.codes,
              country,
              mapName: regionData.mapName,
              localName: regionData.localName,
            });
          }
        }
      }
    }

    return result;
  }, [data]);

  const codeIndex = useMemo(() => {
    const index = new Map<string, IDataList[]>();
    originalList.forEach(item => {
      item.codes.forEach(code => {
        if (!index.has(code)) index.set(code, []);
        index.get(code)?.push(item);
      });
    });
    return index;
  }, [originalList]);

  return { originalList, codeIndex };
};
