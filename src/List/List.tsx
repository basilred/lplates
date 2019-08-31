import React from 'react';
import './List.css';
import { IDataList } from '../interfaces';

const List = (props: { data: IDataList[]; }) => {
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
