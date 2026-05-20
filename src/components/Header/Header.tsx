import React from 'react';
import './Header.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTranslation } from '../../hooks/useTranslation';

const Header: React.FC = () => {
  const { isInstalled, isInstallable, promptInstall } = usePWAInstall();
  const { t } = useTranslation();

  const showInstallButton = isInstallable && !isInstalled;

  return (
    <header className="Header">
      <div className="Header-Container">
        <div className="Header-Brand">
          <span className="Header-Logo">🚗</span>
          <span className="Header-Name">LPlates</span>
        </div>
        <div className="Header-Actions">
          {showInstallButton && (
            <button
              className="Header-InstallButton"
              onClick={promptInstall}
              aria-label={t('app.install.installApp')}
              title={t('app.install.installApp')}
            >
              <span className="Header-InstallButtonIcon">⬇️</span>
              <span className="Header-InstallButtonLabel">
                {t('app.install.installApp')}
              </span>
            </button>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
