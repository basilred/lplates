import React, { useState, useMemo, useCallback, useContext } from 'react';
import './App.css';

import Input from '../Input/Input';
import List from '../List/List';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';

import { IData, IDataList } from '../interfaces';
import { parsePlate, IParsedCodes } from '../utils/plateParser';
import LanguageContext from '../contexts/LanguageContext';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [dataList, setDataList] = useState<IDataList[]>([]);
  const [query, setQuery] = useState('');
  const [showFlags, setShowFlags] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setDataList([]);
      return;
    }

    const potentials = parsePlate(value);
    const newDataList: IDataList[] = [];

    for (const item of originalList) {
      const { codes, country } = item;
      
      // Check if any of the "any" codes match (direct input or standardized)
      const matchInAny = codes.some(code => potentials.any.includes(code));
      
      // Check if the country-specific extracted code matches
      const countryPotentials = potentials[country as keyof Omit<IParsedCodes, 'any'>];
      const matchInCountry = countryPotentials && codes.some(code => countryPotentials.includes(code));

      if (matchInAny || matchInCountry) {
        newDataList.push(item);
      }
    }
    setDataList(newDataList);
  }, [originalList]);

  const totalRegions = originalList.length;
  const totalCodes = originalList.reduce((sum, region) => sum + region.codes.length, 0);
  const totalCountries = Object.keys(data).length;

  const isActive = isFocused || query.length > 0;

  return (
    <div className={`App ${isActive ? 'App_active' : ''}`}>
      <div className="App-Backdrop" />
      <main className="App-Shell">
        {!isActive && (
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
        )}

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
            {!isActive && (
              <div className="LookupPanel-CommandMeta">
                <span className="LookupPanel-CommandLabel">{t('app.search')}</span>
                <span className="LookupPanel-CommandHint">{t('app.codeOrFullPlate')}</span>
              </div>
            )}
            <Input
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
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
              <List
                data={dataList}
                getCountryLabel={getCountryLabel}
                getCountryFlag={getCountryFlag}
                showFlags={showFlags}
                query={query}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
