import React from 'react';
import './List.css';

const List = (props: { data: object; }) => {
  const { data } = props;

  function getPlainData(data: any) {
    const result: { name: string; codes: any; }[] = [];
    const resultTree: string[] = [];

    for (const country in data) {

      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const region in currentCountry) {

          if (currentCountry.hasOwnProperty(region)) {
            const regionCodes = currentCountry[region];

            result.push({ name: region, codes: regionCodes });
          }
        }
      }
    }

    return {result, resultTree};
  }

  return (
    <ul className="List">
      {getPlainData(data).result.map(region => {
        
        return (
          <li key={region.name}>{region.name}</li>
        );
      })}
    </ul>
  );
};

export default List;
