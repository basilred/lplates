import React from 'react';
import './Header.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Header: React.FC = () => {
  return (
    <header className="Header">
      <div className="Header-Container">
        <div className="Header-Brand">
          <span className="Header-Logo">🚗</span>
          <span className="Header-Name">LPlates</span>
        </div>
        <div className="Header-Actions">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
