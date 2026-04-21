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
        <div className="App-Backdrop" />
        <main className="App-Shell">
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
                <span className="App-StatValue">2</span>
                <span className="App-StatLabel">countries covered</span>
              </div>
            </div>
          </section>

          <section className="LookupPanel" aria-label="License plate lookup">
            <div className="LookupPanel-Topbar">
              <span className="LookupPanel-Dot" />
              <span className="LookupPanel-Dot" />
              <span className="LookupPanel-Dot" />
            </div>

            <div className="LookupPanel-Command">
              <div className="LookupPanel-CommandMeta">
                <span className="LookupPanel-CommandLabel">Search</span>
                <span className="LookupPanel-CommandHint">Exact code match</span>
              </div>
              <Input onChange={this.handleInputChange} />
            </div>

            <div className="LookupPanel-Summary">
              <span className="LookupPanel-SummaryLabel">Available examples</span>
              <div className="LookupPanel-Tags" aria-label="Example codes">
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
