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
    }
  }, [shouldBeVisible]);

  useEffect(() => {
    closedRef.current = false;
  }, [visible]);

  const handleClose = () => {
    setHiding(true);
  };

  const handleTransitionEnd = () => {
    if (hiding && !closedRef.current) {
      closedRef.current = true;
      dismiss();
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
                    <svg className="PWAInstallPrompt-StepIcon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                      <rect x="4" y="8" width="16" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" />
                      <polyline points="8,5 12,1 16,5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('app.install.iosStep1')}
                  </span>
                </div>
                <div className="PWAInstallPrompt-Step">
                  <span className="PWAInstallPrompt-StepNumber">2</span>
                  <span className="PWAInstallPrompt-StepText">
                    <svg className="PWAInstallPrompt-StepIcon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
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
