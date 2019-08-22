import React from 'react';
import './App.css';

import Input from './Input/Input';
import List from './List/List';
import data from './data.json';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Input />
        <List data={data} />
      </header>
    </div>
  );
}

export default App;
