import React, { useState, useMemo, useCallback, useContext, lazy, Suspense, useDeferredValue } from 'react';
import { IData, IDataList } from '../../interfaces';
import { parsePlate } from '../../utils/plateParser';
import { getCountryFlag, getCountryLabel } from '../../utils/countryUtils';
import { useRegionData } from '../../hooks/useRegionData';
import LanguageContext from '../../contexts/LanguageContext';
import './LookupPanel.css';

const STORAGE_KEY = 'search_history_v1';

const Input = lazy(() => import('../Input/Input'));
const List = lazy(() => import('../List/List'));

interface LookupPanelProps {
  data: IData;
  showFlags: boolean;
  onToggleFlags: () => void;
  onActiveChange?: (isActive: boolean) => void;
  externalQuery?: string;
  onScanClick?: () => void;
  onMatchFound?: () => void;
}

const DEFAULT_CONTEXT = { t: (key: string) => key };

const LookupPanel: React.FC<LookupPanelProps> = React.memo(({ 
  data, 
  showFlags, 
  onToggleFlags, 
  onActiveChange, 
  externalQuery,
  onScanClick,
  onMatchFound
}) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || DEFAULT_CONTEXT;

  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const matchFiredRef = React.useRef(false);

  const { codeIndex } = useRegionData(data);

  const handleInputChange = useCallback((value: string) => {
    setQuery(prev => {
      const wasActive = prev.length > 0;
      const isNowActive = value.length > 0;
      
      if (wasActive !== isNowActive && onActiveChange) {
        onActiveChange(isNowActive);
      }
      return value;
    });
  }, [onActiveChange]);

  // Sync external query (e.g. from OCR scanner)
  React.useEffect(() => {
    if (externalQuery) {
      handleInputChange(externalQuery);
    }
  }, [externalQuery, handleInputChange]);

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
            if (country === 'generic' || item.country === country) {
              matchingItems.add(item);
            }
          });
        }
      });
    });
    
    return Array.from(matchingItems);
  }, [deferredQuery, codeIndex]);

  // side-effect: save to history (rerender-derived-state-no-effect)
  React.useEffect(() => {
    if (deferredDataList.length > 0 && deferredQuery.length >= 2) {
      if (!matchFiredRef.current && onMatchFound) {
        matchFiredRef.current = true;
        onMatchFound();
      }

      const trimmed = deferredQuery.trim().toUpperCase();
      
      setHistory(prev => {
        if (prev.includes(trimmed)) return prev;
        const newHistory = [trimmed, ...prev].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [deferredDataList, deferredQuery]);

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
            onScanClick={onScanClick}
            scanLabel={t('app.scanPlate')}
          />
        </Suspense>
      </div>

      {!isActive ? (
        <div className="LookupPanel-Summary">
          {history.length > 0 ? (
            <div className="LookupPanel-History">
              <div className="LookupPanel-HistoryHeader">
                <span className="LookupPanel-SummaryLabel">{t('app.recent')}</span>
                <button 
                  className="LookupPanel-HistoryClear" 
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem(STORAGE_KEY);
                  }}
                  title={t('app.clearHistory')}
                >
                  ✕
                </button>
              </div>
              <div className="LookupPanel-Tags">
                {history.map(item => (
                  <button 
                    key={item} 
                    className="LookupPanel-Tag"
                    onClick={() => handleInputChange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          
          <span className="LookupPanel-SummaryLabel">{t('app.availableExamples')}</span>
          <div className="LookupPanel-Tags" aria-label={t('app.exampleCodes')}>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('77')}>77</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('A 123 BC 77')}>A 123 BC 77</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('AA')}>AA</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('AA 1234 BB')}>AA 1234 BB</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('A')}>A</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('1A2 3456')}>1A2 3456</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('7')}>7</button>
            <button className="LookupPanel-Tag" onClick={() => handleInputChange('1234 AB 7')}>1234 AB 7</button>
          </div>
        </div>
      ) : null}

      {isActive ? (
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
      ) : null}
    </section>
  );
});

export default LookupPanel;
