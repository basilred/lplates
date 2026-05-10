import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const getTitle = () => {
    if (theme === 'light') return t('app.theme.switchToDark');
    if (theme === 'dark') return t('app.theme.switchToSystem');
    return t('app.theme.switchToLight');
  };

  const getIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '🌓';
  };

  return (
    <button
      className="ThemeToggle"
      onClick={toggleTheme}
      aria-label={t('app.theme.toggle')}
      title={getTitle()}
    >
      <span className="ThemeToggle-Icon">
        {getIcon()}
      </span>
    </button>
  );
};



export default ThemeToggle;
