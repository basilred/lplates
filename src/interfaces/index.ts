export interface IDataRegion {
  codes: string[];
  mapName: string;
  localName: string;
}

export interface IData {
  [countryCode: string]: {
    [regionId: string]: IDataRegion;
  };
}

export interface IDataList {
  id: string;
  codes: string[];
  country: string;
  mapName: string;
  localName: string;
}
