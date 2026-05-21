import React from 'react';
import { IDataList } from '../../interfaces';
import { useTranslation } from '../../hooks/useTranslation';

const RegionMap = React.lazy(() => import('../RegionMap/RegionMap'));

import './List.css';

const List = React.memo((props: {
  data: IDataList[];
  getCountryLabel: (country: string) => string;
  getCountryFlag: (country: string) => string;
  showFlags: boolean;
  query: string;
}) => {
  const { data, getCountryLabel, getCountryFlag, showFlags, query } = props;
  const { t } = useTranslation();

  const getRegionLabel = (region: IDataList) => {
    const translationKey = `regions.${region.country}.${region.id}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : region.localName;
  };

  return (
    <section className="Results" aria-label={t('list.searchResults')}>
      <div className="Results-Header">
        <span className="Results-Title">{t('list.matches')}</span>
        <span className="Results-Count">{data.length}</span>
      </div>

      {data.length ? (
        <ul className="List">
          {data.map(region => {
            const mapName = region.mapName;
            const mapQuery = `${mapName}, ${getCountryLabel(region.country)}`;
            const regionLabel = getRegionLabel(region);
            return (
              <li className="List-Item" key={`${region.country}-${region.id}`}>
                <div className="List-ItemContent">
                  <div className="List-ItemMain">
                  <span className="List-ItemName">
                    {regionLabel}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="List-ItemMapLink"
                      title={t('list.viewOnMap')}
                    >
                      ↗
                    </a>
                  </span>
                  <span className="List-ItemCountry">
                    {showFlags ? <span className="List-ItemFlag">{getCountryFlag(region.country)}</span> : null}
                    {getCountryLabel(region.country)}
                  </span>
                </div>
                <div className="List-ItemCodes" aria-label={`Codes for ${regionLabel}`}>
                  {region.codes.map(code => (
                    <span className="List-ItemCode" key={`${region.id}-${code}`}>
                      {code}
                    </span>
                  ))}
                </div>
              </div>
                <React.Suspense fallback={<div className="RegionMap-Placeholder" />}>
                  <RegionMap country={region.country} mapName={region.mapName} />
                </React.Suspense>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="Results-Empty">
          <p className="Results-EmptyTitle">
            {query ? t('list.noMatch') : t('list.start')}
          </p>
          <p className="Results-EmptyText">
            {query
              ? t('list.tryAnother')
              : t('list.enterExact')}
          </p>
        </div>
      )}
    </section>
  );
});

export default List;
