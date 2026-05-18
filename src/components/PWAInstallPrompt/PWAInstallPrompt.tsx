import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTranslation } from '../../hooks/useTranslation';
import './PWAInstallPrompt.css';

interface PWAInstallPromptProps {
  visible: boolean;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ visible, onClose }) => {
  const { platform, isInstalled, isDismissed, promptInstall, dismiss } = usePWAInstall();
  const { t } = useTranslation();
  const [hiding, setHiding] = useState(false);

  const shouldShow = visible && !isInstalled && !isDismissed && !hiding;

  const handleClose = () => {
    setHiding(true);
    dismiss();
  };

  const handleTransitionEnd = () => {
    if (hiding) {
      onClose();
    }
  };

  if (!shouldShow && !hiding) return null;

  const visibilityClass = hiding
    ? 'PWAInstallPrompt_hiding'
    : visible
      ? 'PWAInstallPrompt_visible'
      : '';

  return (
    <div
      className={`PWAInstallPrompt ${visibilityClass}`}
      role="dialog"
      aria-label={t('app.install.title')}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="PWAInstallPrompt-Banner">
        <button
          className="PWAInstallPrompt-Close"
          onClick={handleClose}
          aria-label={t('app.install.dismiss')}
        >
          ×
        </button>

        <div className="PWAInstallPrompt-Content">
          {platform === 'ios' ? (
            <>
              <div className="PWAInstallPrompt-Title">
                {t('app.install.addToHomeScreen')}
              </div>
              <div className="PWAInstallPrompt-Description">
                {t('app.install.description')}
              </div>
              <div className="PWAInstallPrompt-Steps">
                <div className="PWAInstallPrompt-Step">
                  <span className="PWAInstallPrompt-StepNumber">1</span>
                  <span className="PWAInstallPrompt-StepText">
                    <span className="PWAInstallPrompt-ShareIcon">↑</span>
                    {' '}
                    {t('app.install.iosStep1')}
                  </span>
                </div>
                <div className="PWAInstallPrompt-Step">
                  <span className="PWAInstallPrompt-StepNumber">2</span>
                  <span className="PWAInstallPrompt-StepText">
                    <span className="PWAInstallPrompt-AddIcon">➕</span>
                    {' '}
                    {t('app.install.iosStep2')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="PWAInstallPrompt-Title">
                {t('app.install.title')}
              </div>
              <div className="PWAInstallPrompt-Description">
                {t('app.install.description')}
              </div>
              <button
                className="PWAInstallPrompt-InstallButton"
                onClick={promptInstall}
              >
                {t('app.install.installButton')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
