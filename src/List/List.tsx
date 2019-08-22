import React from 'react';

const List = (props: { data: object; }) => {
  const { data } = props;

  function getPlainData(data: any) {
    let result = [];

    for (const country in data) {
      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];
        for (const region in currentCountry) {
          if (currentCountry.hasOwnProperty(region)) {
            // const currentRegion = currentCountry[region];
            // result.push(currentRegion);
            result.push(region);
          }
        }
      }
    }

    console.log(result);

    return result;
  }

  return (
    <ul className="List">
      {getPlainData(data).map(region => {
        return (
          <li key={region}>
            {region}
          </li>
          );
      })}
    </ul>
  );
};

export default List;
