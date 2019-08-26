import React from 'react';
import './List.css';

const List = (props: { data: any[]; }) => {
  const { data } = props;

  return (
    <ul className="List">
      {data.map(region => {
        return (
          <li key={region.name}>{region.name}</li>
        );
      })}
    </ul>
  );
};

export default List;
