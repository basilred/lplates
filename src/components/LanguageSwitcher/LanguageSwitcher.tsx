import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Locale, LANGUAGE_CONFIG, LANGUAGES } from '../../locales';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGE_CONFIG[locale];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  // Закрытие dropdown при клике вне и по Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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
          {LANGUAGES.map(lang => (
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

export default React.memo(LanguageSwitcher);
