
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
      <div className="Results-Header">
        <span className="Results-Title">Matches</span>
        <span className="Results-Count">{data.length}</span>
      </div>

      {data.length ? (
        <ul className="List">
          {data.map(region => {
            return (
              <li className="List-Item" key={`${region.country}-${region.name}`}>
                <div className="List-ItemMain">
                  <span className="List-ItemName">{region.name}</span>
                  <span className="List-ItemCountry">{getCountryLabel(region.country)}</span>
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
            {query ? 'No exact match found' : 'Start with a plate code'}
          </p>
          <p className="Results-EmptyText">
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
