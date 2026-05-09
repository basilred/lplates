import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App/App';
import data from './data.json';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <App data={data} />
        </LanguageProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
