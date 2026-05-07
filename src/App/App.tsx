import React, { useState, useMemo, useCallback, useContext } from 'react';
import './App.css';

import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import LookupPanel from '../components/LookupPanel/LookupPanel';

import { IData, IDataList } from '../interfaces';
import LanguageContext from '../contexts/LanguageContext';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [isActive, setIsActive] = useState(false);
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

  const getCountryFlag = useCallback((country: string) => {
    switch (country) {
      case 'ru': return '🇷🇺';
      case 'ua': return '🇺🇦';
      case 'cz': return '🇨🇿';
      case 'by': return '🇧🇾';
      default: return '🏳️';
    }
  }, []);

  const getCountryLabel = useCallback((country: string) => {
    if (languageContext) {
      const { t: contextT } = languageContext;
      const translated = contextT(`countries.${country}`);
      if (translated && translated !== `countries.${country}`) {
        return translated;
      }
    }
    switch (country) {
      case 'ru': return 'Russia';
      case 'ua': return 'Ukraine';
      case 'cz': return 'Czech Republic';
      case 'by': return 'Belarus';
      default: return country.toUpperCase();
    }
  }, [languageContext]);

  const totalRegions = originalList.length;
  const totalCodes = originalList.reduce((sum, region) => sum + region.codes.length, 0);
  const totalCountries = Object.keys(data).length;

  const handleToggleFlags = useCallback(() => {
    setShowFlags(prev => !prev);
  }, []);

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

        <LookupPanel 
          data={data} 
          showFlags={showFlags}
          onToggleFlags={handleToggleFlags}
          onActiveChange={setIsActive}
        />
      </main>
    </div>
  );
};

export default App;
