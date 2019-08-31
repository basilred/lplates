export interface IData {
  [countryIndex: string]: {
    [regionIndex: string]: (string | number)[]
  }
}

export interface IDataList {
  name: string;
  codes: string[];
}
