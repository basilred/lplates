import { useMemo } from 'react';
import { IData, IDataList, IDataRegion } from '../interfaces';

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

        for (const region in currentCountry) {
          if (currentCountry.hasOwnProperty(region)) {
            const regionValue = currentCountry[region];
            let codes: (string | number)[];
            let mapName: string | undefined;

            // Проверяем формат данных
            if (Array.isArray(regionValue)) {
              // Старый формат: массив кодов
              codes = regionValue;
              mapName = undefined;
            } else {
              // Новый формат: объект IDataRegion
              const regionData = regionValue as IDataRegion;
              codes = regionData.codes;
              mapName = regionData.mapName;
            }

            const stringCodes = codes.map(code => code.toString());

            result.push({
              name: region,
              codes: stringCodes,
              country,
              mapName,
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
