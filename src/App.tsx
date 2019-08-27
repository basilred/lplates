import React from 'react';
import './App.css';

import Input from './Input/Input';
import List from './List/List';


class App extends React.Component<{data: any}, {dataList: {name: string; codes: any}[]}> {
  
  private originalList = this.getPlainData(this.props.data).result;
  
  constructor(props: {data: any}) {
    super(props);

    this.originalList = this.getPlainData(props.data).result;
    this.state = {
      dataList: this.originalList,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  private getPlainData(data: any) {
    const result: { name: string; codes: any; }[] = [];
    const resultTree: string[] = [];

    for (const country in data) {

      if (data.hasOwnProperty(country)) {
        const currentCountry = data[country];

        for (const region in currentCountry) {

          if (currentCountry.hasOwnProperty(region)) {
            const regionCodes = currentCountry[region];
            const stringCodes = regionCodes.map((region: { toString: () => void; }) => region.toString());

            result.push({ name: region, codes: stringCodes });
          }
        }
      }
    }

    return { result, resultTree };
  }

  private handleInputChange(value: string) {
    const list = this.originalList;
    let newDataList: {name: string; codes: any[]}[] = [];
    
    for (const region in list) {
      if (list.hasOwnProperty(region)) {
        const {name, codes} = list[region];
        let codeExists: boolean = false;

        codes.forEach((code: string[]) => {
          if (code.indexOf(value) !== -1) {
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
