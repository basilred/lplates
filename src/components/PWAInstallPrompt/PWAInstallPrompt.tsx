import React, { useState, useEffect, useRef } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [hiding, setHiding] = useState(false);
  const closedRef = useRef(false);

  const shouldBeVisible = visible && !isInstalled && !isDismissed;

  useEffect(() => {
    if (shouldBeVisible && !mounted) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    if (!shouldBeVisible) {
      setMounted(false);
      setHiding(false);
    }
  }, [shouldBeVisible, mounted]);

  useEffect(() => {
    closedRef.current = false;
  }, [visible]);

  const handleClose = () => {
    setHiding(true);
    dismiss();
  };

  const handleTransitionEnd = () => {
    if (hiding && !closedRef.current) {
      closedRef.current = true;
      onClose();
    }
  };

  if (!shouldBeVisible && !mounted) return null;

  let visibilityClass = '';
  if (hiding) {
    visibilityClass = 'PWAInstallPrompt_hiding';
  } else if (mounted) {
    visibilityClass = 'PWAInstallPrompt_visible';
  }

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
