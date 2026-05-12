export interface IDataRegion {
  codes: (string | number)[];
  mapName?: string;
}

export interface IData {
  [countryIndex: string]: {
    [regionIndex: string]: IDataRegion | (string | number)[]
  }
}

export interface IDataList {
  name: string;
  codes: string[];
  country: string;
  mapName?: string;
}
