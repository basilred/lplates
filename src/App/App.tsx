import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import './App.css';

import Header from '../components/Header/Header';
import LookupPanel from '../components/LookupPanel/LookupPanel';
import CameraScanner from '../components/CameraScanner/CameraScanner';
import PWAInstallPrompt from '../components/PWAInstallPrompt/PWAInstallPrompt';

import { IData } from '../interfaces';
import LanguageContext from '../contexts/LanguageContext';
import { getCountryFlag, getCountryLabel } from '../utils/countryUtils';
import { useRegionData } from '../hooks/useRegionData';
import { ensureHapticContext } from '../utils/haptic';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [isActive, setIsActive] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedPlate, setScannedPlate] = useState('');
  const [firstActionDone, setFirstActionDone] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);

  const prevScannedPlateRef = useRef('');

  const { originalList } = useRegionData(data);

  const countryFlagGetter = useCallback((country: string) => getCountryFlag(country), []);
  const countryLabelGetter = useCallback((country: string) => getCountryLabel(country, t), [t]);

  const totalRegions = originalList.length;
  const totalCodes = originalList.reduce((sum, region) => sum + region.codes.length, 0);
  const totalCountries = Object.keys(data).length;

  const handleToggleFlags = useCallback(() => {
    setShowFlags(prev => !prev);
  }, []);

  const handleScanClick = useCallback(() => {
    ensureHapticContext();
    setScannedPlate('');
    setIsScannerOpen(true);
  }, []);

  const handleCapture = useCallback((plate: string) => {
    setScannedPlate(plate);
    setIsScannerOpen(false);
  }, []);

  const handleFirstAction = useCallback(() => {
    if (!firstActionDone) {
      setFirstActionDone(true);
    }
  }, [firstActionDone]);

  // Show prompt when first action completes (small delay so user sees results first)
  useEffect(() => {
    if (firstActionDone && !promptVisible) {
      const timer = setTimeout(() => setPromptVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [firstActionDone, promptVisible]);

  // Trigger on camera scan success
  useEffect(() => {
    if (scannedPlate && scannedPlate !== prevScannedPlateRef.current) {
      prevScannedPlateRef.current = scannedPlate;
      handleFirstAction();
    }
  }, [scannedPlate, handleFirstAction]);

  const handlePromptClose = useCallback(() => {
    setPromptVisible(false);
  }, []);

  return (
    <div className={`App ${isActive ? 'App_active' : ''}`}>
      <div className="App-Backdrop" />
      <Header />
      <main className="App-Shell">
        <section className="App-Intro">
          <p className="App-Eyebrow">{t('app.eyebrow')}</p>
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
          externalQuery={scannedPlate}
          onScanClick={handleScanClick}
          onMatchFound={handleFirstAction}
        />
      </main>

      {isScannerOpen && (
        <CameraScanner 
          onClose={() => setIsScannerOpen(false)}
          onCapture={handleCapture}
        />
      )}

      <PWAInstallPrompt
        visible={promptVisible}
        onClose={handlePromptClose}
      />
    </div>
  );
};

export default App;
