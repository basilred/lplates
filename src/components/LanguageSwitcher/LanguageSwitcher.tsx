import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Locale } from '../../locales';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Locale; flag: string; label: string }[] = [
    { code: 'en', flag: '🇺🇸', label: t('languages.en') },
    { code: 'ru', flag: '🇷🇺', label: t('languages.ru') },
    { code: 'ua', flag: '🇺🇦', label: t('languages.ua') },
    { code: 'cz', flag: '🇨🇿', label: t('languages.cz') },
    { code: 'by', flag: '🇧🇾', label: t('languages.by') },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="LanguageSwitcher" ref={dropdownRef}>
      <button
        className="LanguageSwitcher-Button"
        onClick={handleToggle}
        aria-label={t('app.selectLanguage')}
        aria-expanded={isOpen}
      >
        <span className="LanguageSwitcher-Flag">{currentLanguage.flag}</span>
        <span className="LanguageSwitcher-Code">{currentLanguage.code.toUpperCase()}</span>
        <span className="LanguageSwitcher-Arrow">▼</span>
      </button>
      {isOpen && (
        <div className="LanguageSwitcher-Dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`LanguageSwitcher-Option ${locale === lang.code ? 'LanguageSwitcher-Option_active' : ''}`}
              onClick={() => handleSelect(lang.code)}
              aria-label={`Switch to ${lang.label}`}
            >
              <span className="LanguageSwitcher-OptionFlag">{lang.flag}</span>
              <span className="LanguageSwitcher-OptionLabel">{lang.label}</span>
              <span className="LanguageSwitcher-OptionCode">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
