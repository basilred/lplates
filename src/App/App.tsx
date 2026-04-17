import React from 'react';
import './App.css';

import Input from '../Input/Input';
import List from '../List/List';

import { IData, IDataList } from '../interfaces';


class App extends React.Component<{data: IData}, {dataList: IDataList[]; query: string}> {

  private originalList = this.getPlainData(this.props.data);

  constructor(props: {data: IData}) {
    super(props);

    this.state = {
      dataList: [],
      query: '',
    }

    this.handleInputChange = this.handleInputChange.bind(this);
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

  private getCountryLabel(country: string) {
    switch (country) {
      case 'ru':
        return 'Russia';
      case 'ua':
        return 'Ukraine';
      default:
        return country.toUpperCase();
    }
  }

  private handleInputChange(value: string) {
    this.setState({ query: value });

    if (!value.trim()) {
      this.setState({ dataList: [] });
      return;
    }

    const list = this.originalList;
    let newDataList: IDataList[] = [];

    for (const region in list) {
      if (list.hasOwnProperty(region)) {
        const {name, codes} = list[region];
        let codeExists: boolean = false;

        codes.forEach(code => {
          if (code === value) {
            codeExists = true;
          }
        });

        if (codeExists) {
          newDataList.push({ name, codes, country: list[region].country });
        }
      }
    }
    this.setState({ dataList: newDataList });
  }

  render() {
    const totalRegions = this.originalList.length;
    const totalCodes = this.originalList.reduce((sum, region) => sum + region.codes.length, 0);

    return (
      <div className="App">
        <div className="App-backdrop" />
        <main className="App-shell">
          <section className="App-intro">
            <p className="App-eyebrow">Regional lookup</p>
            <h1 className="App-title">Find a license plate region in one keystroke.</h1>
            <p className="App-description">
              A focused lookup tool for regional plate codes. Type a numeric or letter code and
              get the matching region instantly.
            </p>

            <div className="App-stats" aria-label="Dataset summary">
              <div className="App-stat">
                <span className="App-statValue">{totalRegions}</span>
                <span className="App-statLabel">regions indexed</span>
              </div>
              <div className="App-stat">
                <span className="App-statValue">{totalCodes}</span>
                <span className="App-statLabel">codes available</span>
              </div>
              <div className="App-stat">
                <span className="App-statValue">2</span>
                <span className="App-statLabel">countries covered</span>
              </div>
            </div>
          </section>

          <section className="LookupPanel" aria-label="License plate lookup">
            <div className="LookupPanel-topbar">
              <span className="LookupPanel-dot" />
              <span className="LookupPanel-dot" />
              <span className="LookupPanel-dot" />
            </div>

            <div className="LookupPanel-command">
              <div className="LookupPanel-commandMeta">
                <span className="LookupPanel-commandLabel">Search</span>
                <span className="LookupPanel-commandHint">Exact code match</span>
              </div>
              <Input onChange={this.handleInputChange} />
            </div>

            <div className="LookupPanel-summary">
              <span className="LookupPanel-summaryLabel">Available examples</span>
              <div className="LookupPanel-tags" aria-label="Example codes">
                <span>77</span>
                <span>92</span>
                <span>AA</span>
                <span>AK</span>
                <span>178</span>
              </div>
            </div>

            <List
              data={this.state.dataList}
              getCountryLabel={this.getCountryLabel}
              query={this.state.query}
            />
          </section>
        </main>
      </div>
    );
  }
}

export default App;
