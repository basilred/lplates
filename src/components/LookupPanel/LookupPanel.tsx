import React, { useState, useMemo, useCallback, useContext, lazy, Suspense, useDeferredValue } from 'react';
import { IData, IDataList } from '../../interfaces';
import { parsePlate } from '../../utils/plateParser';
import { getCountryFlag, getCountryLabel } from '../../utils/countryUtils';
import { useRegionData } from '../../hooks/useRegionData';
import LanguageContext from '../../contexts/LanguageContext';
import './LookupPanel.css';

const Input = lazy(() => import('../Input/Input'));
const List = lazy(() => import('../List/List'));

interface LookupPanelProps {
  data: IData;
  showFlags: boolean;
  onToggleFlags: () => void;
  onActiveChange?: (isActive: boolean) => void;
}

const LookupPanel: React.FC<LookupPanelProps> = ({ data, showFlags, onToggleFlags, onActiveChange }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [query, setQuery] = useState('');

  const { codeIndex } = useRegionData(data);

  const deferredQuery = useDeferredValue(query);

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

  const handleInputChange = useCallback((value: string) => {
    const wasActive = query.length > 0;
    const isNowActive = value.length > 0;
    
    setQuery(value);
    
    if (wasActive !== isNowActive && onActiveChange) {
      onActiveChange(isNowActive);
    }
  }, [query, onActiveChange]);

  const getCountryLabelInside = useCallback((country: string) => getCountryLabel(country, t), [t]);

  const isActive = query.length > 0;

  return (
    <section className={`LookupPanel ${isActive ? 'LookupPanel_active' : ''}`} aria-label={t('app.licensePlateLookup')}>
      <div className="LookupPanel-Topbar">
        <div className="LookupPanel-Dots">
          <span className="LookupPanel-Dot" />
          <span className="LookupPanel-Dot" />
          <span className="LookupPanel-Dot" />
        </div>
        <button
          className={`FlagToggle ${showFlags ? 'FlagToggle_active' : ''}`}
          onClick={onToggleFlags}
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
              getCountryLabel={getCountryLabelInside}
              getCountryFlag={getCountryFlag}
              showFlags={showFlags}
              query={deferredQuery}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
};

export default LookupPanel;
