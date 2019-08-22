import React from 'react';
import './App.css';

import Input from './Input/Input';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Input />
      </header>
    </div>
  );
}

export default App;
