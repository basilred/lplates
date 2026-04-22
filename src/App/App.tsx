import React from 'react';
import './App.css';

import Input from '../Input/Input';
import List from '../List/List';

import { IData, IDataList } from '../interfaces';
import { parsePlate, IParsedCodes } from '../utils/plateParser';


class App extends React.Component<{data: IData}, {dataList: IDataList[]; query: string; showFlags: boolean; isFocused: boolean}> {

  private originalList = this.getPlainData(this.props.data);

  constructor(props: {data: IData}) {
    super(props);

    this.state = {
      dataList: [],
      query: '',
      showFlags: true,
      isFocused: false,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggleFlags = this.handleToggleFlags.bind(this);
  }

  private getPlainData(data: IData): IDataList[] {
    const result: IDataList[] = [];

    for (const country in data) {
      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const region in currentCountry) {
          if (currentCountry.hasOwnProperty(region)) {
            const regionCodes = currentCountry[region];
            const stringCodes = regionCodes.map(code => code.toString());

            result.push({
              name: region,
              codes: stringCodes,
              country,
            });
          }
        }
      }
    }

    return result;
  }

  private getCountryFlag(country: string) {
    switch (country) {
      case 'ru':
        return '🇷🇺';
      case 'ua':
        return '🇺🇦';
      case 'cz':
        return '🇨🇿';
      case 'by':
        return '🇧🇾';
      default:
        return '🏳️';
    }
  }

  private getCountryLabel(country: string) {
    switch (country) {
      case 'ru':
        return 'Russia';
      case 'ua':
        return 'Ukraine';
      case 'cz':
        return 'Czech Republic';
      case 'by':
        return 'Belarus';
      default:
        return country.toUpperCase();
    }
  }

  private handleToggleFlags() {
    this.setState(prevState => ({ showFlags: !prevState.showFlags }));
  }

  private handleFocus = () => {
    this.setState({ isFocused: true });
  }

  private handleBlur = () => {
    this.setState({ isFocused: false });
  }

  private handleInputChange(value: string) {
    this.setState({ query: value });

    if (!value.trim()) {
      this.setState({ dataList: [] });
      return;
    }

    const potentials = parsePlate(value);
    const list = this.originalList;
    const newDataList: IDataList[] = [];

    for (const item of list) {
      const { codes, country } = item;
      
      // Check if any of the "any" codes match (direct input or standardized)
      const matchInAny = codes.some(code => potentials.any.includes(code));
      
      // Check if the country-specific extracted code matches
      const countryPotentials = potentials[country as keyof Omit<IParsedCodes, 'any'>];
      const matchInCountry = countryPotentials && codes.some(code => countryPotentials.includes(code));

      if (matchInAny || matchInCountry) {
        newDataList.push(item);
      }
    }
    this.setState({ dataList: newDataList });
  }

  render() {
    const totalRegions = this.originalList.length;
    const totalCodes = this.originalList.reduce((sum, region) => sum + region.codes.length, 0);
    const totalCountries = Object.keys(this.props.data).length;

    const isActive = this.state.isFocused || this.state.query.length > 0;

    return (
      <div className={`App ${isActive ? 'App_active' : ''}`}>
        <div className="App-Backdrop" />
        <main className="App-Shell">
          {!isActive && (
            <section className="App-Intro">
              <p className="App-Eyebrow">Regional lookup</p>
              <h1 className="App-Title">Find a license plate region in one keystroke.</h1>
              <p className="App-Description">
                A focused lookup tool for regional plate codes. Type a numeric or letter code and
                get the matching region instantly.
              </p>

              <div className="App-Stats" aria-label="Dataset summary">
                <div className="App-Stat">
                  <span className="App-StatValue">{totalRegions}</span>
                  <span className="App-StatLabel">regions indexed</span>
                </div>
                <div className="App-Stat">
                  <span className="App-StatValue">{totalCodes}</span>
                  <span className="App-StatLabel">codes available</span>
                </div>
                <div className="App-Stat">
                  <span className="App-StatValue">
                    {totalCountries}
                    {this.state.showFlags && (
                      <div className="App-StatFlags">
                        {Object.keys(this.props.data).map(country => (
                          <span key={country} title={this.getCountryLabel(country)}>
                            {this.getCountryFlag(country)}
                          </span>
                        ))}
                      </div>
                    )}
                  </span>
                  <span className="App-StatLabel">countries covered</span>
                </div>
              </div>
            </section>
          )}

          <section className="LookupPanel" aria-label="License plate lookup">
            <div className="LookupPanel-Topbar">
              <div className="LookupPanel-Dots">
                <span className="LookupPanel-Dot" />
                <span className="LookupPanel-Dot" />
                <span className="LookupPanel-Dot" />
              </div>
              <button
                className={`FlagToggle ${this.state.showFlags ? 'FlagToggle_active' : ''}`}
                onClick={this.handleToggleFlags}
                aria-label="Toggle flags"
                title={this.state.showFlags ? 'Hide flags' : 'Show flags'}
              >
                <span className="FlagToggle-Icon">🏳️</span>
                <span className="FlagToggle-Label">Flags</span>
              </button>
            </div>

            <div className={`LookupPanel-Command ${isActive ? 'LookupPanel-Command_active' : ''}`}>
              {!isActive && (
                <div className="LookupPanel-CommandMeta">
                  <span className="LookupPanel-CommandLabel">Search</span>
                  <span className="LookupPanel-CommandHint">Code or full plate</span>
                </div>
              )}
              <Input 
                value={this.state.query}
                onChange={this.handleInputChange} 
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
              />
            </div>

            {!isActive && (
              <div className="LookupPanel-Summary">
                <span className="LookupPanel-SummaryLabel">Available examples</span>
                <div className="LookupPanel-Tags" aria-label="Example codes">
                  <span>77</span>
                  <span>A 123 BC 77</span>
                  <span>AA</span>
                  <span>AA 1234 BB</span>
                  <span>A</span>
                  <span>1A2 3456</span>
                  <span>7</span>
                  <span>1234 AB 7</span>
                </div>
              </div>
            )}

            {isActive && (
              <div className="LookupPanel-ResultsArea">
                <List
                  data={this.state.dataList}
                  getCountryLabel={this.getCountryLabel}
                  getCountryFlag={this.getCountryFlag}
                  showFlags={this.state.showFlags}
                  query={this.state.query}
                />
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }
}

export default App;
