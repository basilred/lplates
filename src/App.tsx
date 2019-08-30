import React from 'react';
import './App.css';

import Input from './Input/Input';
import List from './List/List';

interface IData {
  [countryIndex: string]: {
    [regionIndex: string]: (string | number)[]
  }
}

interface IDataList {
  name: string;
  codes: string[];
}

class App extends React.Component<{data: IData}, {dataList: IDataList[]}> {

  private originalList = this.getPlainData(this.props.data);

  constructor(props: {data: IData}) {
    super(props);

    this.state = {
      dataList: this.originalList,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  private getPlainData(data: IData): IDataList[] {
    const result = [];

    for (const country in data) {

      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const region in currentCountry) {

          if (currentCountry.hasOwnProperty(region)) {
            const regionCodes = currentCountry[region];
            const stringCodes = regionCodes.map(code => code.toString());

            result.push({ name: region, codes: stringCodes });
          }
        }
      }
    }

    return result;
  }

  private handleInputChange(value: string) {
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
          newDataList.push({ name, codes });
        }
      }
    }
    this.setState({ dataList: newDataList });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Enter license plate code
        </p>
          <Input onChange={this.handleInputChange} />
          <List data={this.state.dataList} />
        </header>
      </div>
    );
  }
}

export default App;
