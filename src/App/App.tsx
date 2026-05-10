import React, { useState, useCallback, useContext } from 'react';
import './App.css';

import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import LookupPanel from '../components/LookupPanel/LookupPanel';

import { IData } from '../interfaces';
import LanguageContext from '../contexts/LanguageContext';
import { getCountryFlag, getCountryLabel } from '../utils/countryUtils';
import { useRegionData } from '../hooks/useRegionData';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [isActive, setIsActive] = useState(false);
  const [showFlags, setShowFlags] = useState(true);

  const { originalList } = useRegionData(data, t);

  const countryFlagGetter = useCallback((country: string) => getCountryFlag(country), []);
  const countryLabelGetter = useCallback((country: string) => getCountryLabel(country, t), [t]);

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
            <div className="App-Controls">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
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
                      <span key={country} title={countryLabelGetter(country)}>
                        {countryFlagGetter(country)}
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
