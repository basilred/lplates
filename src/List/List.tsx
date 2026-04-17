
import './List.css';
import { IDataList } from '../interfaces';

const List = (props: {
  data: IDataList[];
  getCountryLabel: (country: string) => string;
  query: string;
}) => {
  const { data, getCountryLabel, query } = props;

  return (
    <section className="Results" aria-label="Search results">
      <div className="Results-header">
        <span className="Results-title">Matches</span>
        <span className="Results-count">{data.length}</span>
      </div>

      {data.length ? (
        <ul className="List">
          {data.map(region => {
            return (
              <li className="ListItem" key={`${region.country}-${region.name}`}>
                <div className="ListItem-main">
                  <span className="ListItem-name">{region.name}</span>
                  <span className="ListItem-country">{getCountryLabel(region.country)}</span>
                </div>
                <div className="ListItem-codes" aria-label={`Codes for ${region.name}`}>
                  {region.codes.map(code => (
                    <span className="ListItem-code" key={`${region.name}-${code}`}>
                      {code}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="Results-empty">
          <p className="Results-emptyTitle">
            {query ? 'No exact match found' : 'Start with a plate code'}
          </p>
          <p className="Results-emptyText">
            {query
              ? 'Try another exact code to see matching license plate regions.'
              : 'Enter an exact regional code to see matching license plate regions.'}
          </p>
        </div>
      )}
    </section>
  );
};

export default List;
