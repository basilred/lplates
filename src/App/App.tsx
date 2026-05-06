import React, { useState, useMemo, useCallback, useContext, lazy, Suspense, useDeferredValue } from 'react';
import './App.css';

const Input = lazy(() => import('../Input/Input'));
const List = lazy(() => import('../List/List'));
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';

import { IData, IDataList } from '../interfaces';
import { parsePlate } from '../utils/plateParser';
import LanguageContext from '../contexts/LanguageContext';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [query, setQuery] = useState('');
  const [showFlags, setShowFlags] = useState(true);

  // Преобразование данных в плоский список (мемоизировано)
  const originalList = useMemo(() => {
    const result: IDataList[] = [];

    for (const country in data) {
      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const region in currentCountry) {
          if (currentCountry.hasOwnProperty(region)) {
            const regionCodes = currentCountry[region];
            const stringCodes = regionCodes.map(code => code.toString());

            result.push({
              name: region,
              codes: stringCodes,
              country,
            });
          }
        }
      }
    }

    return result;
  }, [data]);

  const deferredQuery = useDeferredValue(query);

  // Индекс для быстрого поиска
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

  const deferredDataList = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    
    const matchingItems = new Set<IDataList>();
    
    const potentials = parsePlate(deferredQuery);
    
    Object.entries(potentials).forEach(([country, codes]) => {
      (codes as string[])?.forEach((code: string) => {
        const items = codeIndex.get(code);
        if (items) {
          items.forEach(item => {
            if (country === 'any' || item.country === country) {
              matchingItems.add(item);
            }
          });
        }
      });
    });
    
    return Array.from(matchingItems);
  }, [deferredQuery, codeIndex]);

  const getCountryFlag = useCallback((country: string) => {
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
  }, []);

  const getCountryLabel = useCallback((country: string) => {
    // Если контекст доступен, пробуем получить перевод
    if (languageContext) {
      const { t: contextT } = languageContext;
      const translated = contextT(`countries.${country}`);
      // Проверяем, что перевод существует и не равен исходному ключу
      if (translated && translated !== `countries.${country}`) {
        return translated;
      }
    }
    // Fallback для случаев:
    // 1. Контекст недоступен (редко)
    // 2. Перевод не найден
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
  }, [languageContext]);

  const handleToggleFlags = useCallback(() => {
    setShowFlags(prev => !prev);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    // deferredDataList обновится автоматически через useMemo с deferredQuery
  }, []);

  const totalRegions = originalList.length;
  const totalCodes = originalList.reduce((sum, region) => sum + region.codes.length, 0);
  const totalCountries = Object.keys(data).length;

  const isActive = query.length > 0;

  return (
    <div className={`App ${isActive ? 'App_active' : ''}`}>
      <div className="App-Backdrop" />
      <main className="App-Shell">
          <section className="App-Intro">
            <div className="App-HeaderRow">
              <p className="App-Eyebrow">{t('app.eyebrow')}</p>
              <LanguageSwitcher />
            </div>
            <h1 className="App-Title">{t('app.title')}</h1>
            <p className="App-Description">
              {t('app.description')}
            </p>

            <div className="App-Stats" aria-label={t('app.datasetSummary')}>
              <div className="App-Stat">
                <span className="App-StatValue">{totalRegions}</span>
                <span className="App-StatLabel">{t('app.stats.regionsIndexed')}</span>
              </div>
              <div className="App-Stat">
                <span className="App-StatValue">{totalCodes}</span>
                <span className="App-StatLabel">{t('app.stats.codesAvailable')}</span>
              </div>
              <div className="App-Stat">
                <span className="App-StatValue">
                  {totalCountries}
                  {showFlags && (
                    <div className="App-StatFlags">
                      {Object.keys(data).map(country => (
                        <span key={country} title={getCountryLabel(country)}>
                          {getCountryFlag(country)}
                        </span>
                      ))}
                    </div>
                  )}
                </span>
                <span className="App-StatLabel">{t('app.stats.countriesCovered')}</span>
              </div>
            </div>
          </section>

        <section className="LookupPanel" aria-label={t('app.licensePlateLookup')}>
          <div className="LookupPanel-Topbar">
            <div className="LookupPanel-Dots">
              <span className="LookupPanel-Dot" />
              <span className="LookupPanel-Dot" />
              <span className="LookupPanel-Dot" />
            </div>
            <button
              className={`FlagToggle ${showFlags ? 'FlagToggle_active' : ''}`}
              onClick={handleToggleFlags}
              aria-label={t('app.toggleFlags')}
              title={showFlags ? t('app.hideFlags') : t('app.showFlags')}
            >
              <span className="FlagToggle-Icon">🏳️</span>
              <span className="FlagToggle-Label">{t('app.toggleFlags')}</span>
            </button>
          </div>

          <div className={`LookupPanel-Command ${isActive ? 'LookupPanel-Command_active' : ''}`}>
            <div className="LookupPanel-CommandMeta">
              <span className="LookupPanel-CommandLabel">{t('app.search')}</span>
              <span className="LookupPanel-CommandHint">{t('app.codeOrFullPlate')}</span>
            </div>

            <Suspense fallback={<div className="LoadingFallback">Loading input...</div>}>
              <Input
                value={query}
                onChange={handleInputChange}
              />
            </Suspense>
          </div>

          {!isActive && (
            <div className="LookupPanel-Summary">
              <span className="LookupPanel-SummaryLabel">{t('app.availableExamples')}</span>
              <div className="LookupPanel-Tags" aria-label={t('app.exampleCodes')}>
                <span>77</span>
                <span>A 123 BC 77</span>
                <span>AA</span>
                <span>AA 1234 BB</span>
                <span>A</span>
                <span>1A2 3456</span>
                <span>7</span>
                <span>1234 AB 7</span>
              </div>
            </div>
          )}

          {isActive && (
            <div className="LookupPanel-ResultsArea">
              <Suspense fallback={<div className="LoadingFallback">Loading results...</div>}>
                <List
                  data={deferredDataList}
                  getCountryLabel={getCountryLabel}
                  getCountryFlag={getCountryFlag}
                  showFlags={showFlags}
                  query={deferredQuery}
                />
              </Suspense>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
