
import './List.css';
import { IDataList } from '../interfaces';
import { useTranslation } from '../hooks/useTranslation';

const List = (props: {
  data: IDataList[];
  getCountryLabel: (country: string) => string;
  getCountryFlag: (country: string) => string;
  showFlags: boolean;
  query: string;
}) => {
  const { data, getCountryLabel, getCountryFlag, showFlags, query } = props;
  const { t } = useTranslation();

  return (
    <section className="Results" aria-label={t('list.searchResults')}>
      <div className="Results-Header">
        <span className="Results-Title">{t('list.matches')}</span>
        <span className="Results-Count">{data.length}</span>
      </div>

      {data.length ? (
        <ul className="List">
          {data.map(region => {
            return (
              <li className="List-Item" key={`${region.country}-${region.name}`}>
                <div className="List-ItemMain">
                  <span className="List-ItemName">{region.name}</span>
                  <span className="List-ItemCountry">
                    {showFlags && <span className="List-ItemFlag">{getCountryFlag(region.country)}</span>}
                    {getCountryLabel(region.country)}
                  </span>
                </div>
                <div className="List-ItemCodes" aria-label={`Codes for ${region.name}`}>
                  {region.codes.map(code => (
                    <span className="List-ItemCode" key={`${region.name}-${code}`}>
                      {code}
                    </span>
                  ))}
                </div>
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
};

export default List;
