# PWA Install Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive PWA installation prompt (Android/iOS) with glassmorphism UI, triggered after first user action, with a persistent install button in the header.

**Architecture:** Hook-centric — `usePWAInstall` hook consumed directly by `PWAInstallPrompt` and `Header`. No context provider needed. `App.tsx` tracks `firstActionDone` state and passes it as `visible` prop.

**Tech Stack:** React 19, TypeScript, CSS (BEM with project variables), `beforeinstallprompt` API, Playwright for E2E tests.

---

### File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/locales/en.json` | Add `app.install.*` keys |
| Modify | `src/locales/ru.json` | Same keys, Russian translations |
| Modify | `src/locales/ua.json` | Same keys, Ukrainian translations |
| Modify | `src/locales/cz.json` | Same keys, Czech translations |
| Modify | `src/locales/by.json` | Same keys, Belarusian translations |
| Modify | `src/locales/crh.json` | Same keys, Crimean Tatar translations |
| Modify | `src/locales/es.json` | Same keys, Spanish translations |
| Create | `src/hooks/usePWAInstall.ts` | Hook: platform detection, beforeinstallprompt, dismiss |
| Create | `src/components/PWAInstallPrompt/PWAInstallPrompt.tsx` | Bottom banner: Android button / iOS instructions |
| Create | `src/components/PWAInstallPrompt/PWAInstallPrompt.css` | Glassmorphism styles, animations |
| Modify | `src/components/Header/Header.tsx` | Add install button in Header-Actions |
| Modify | `src/components/Header/Header.css` | Header-InstallButton styles |
| Modify | `src/App/App.tsx` | Track firstActionDone, render PWAInstallPrompt, pass onMatchFound |
| Modify | `src/components/LookupPanel/LookupPanel.tsx` | Add onMatchFound prop, call once on first result |
| Create | `e2e/pwa/install-prompt.spec.ts` | Playwright E2E tests |

---

### Task 1: Add i18n translation keys

**Files:**
- Modify: `src/locales/en.json`, `src/locales/ru.json`, `src/locales/ua.json`, `src/locales/cz.json`, `src/locales/by.json`, `src/locales/crh.json`, `src/locales/es.json`

Add to each file inside the `"app"` object, after the `"recent"` key.

- [ ] **Step 1: Add translations to en.json**

```json
// After "recent": "Recent", insert:
    "install": {
      "installApp": "Install App",
      "addToHomeScreen": "Add to Home Screen",
      "title": "Install LPlates",
      "description": "Get quick access without a browser",
      "installButton": "Install",
      "dismiss": "Close",
      "iosStep1": "Tap the Share button in Safari",
      "iosStep2": "Choose «Add to Home Screen»"
    },
```

- [ ] **Step 2: Add translations to ru.json**

```json
    "install": {
      "installApp": "Установить приложение",
      "addToHomeScreen": "На экран Домой",
      "title": "Установите LPlates",
      "description": "Быстрый доступ без браузера",
      "installButton": "Установить",
      "dismiss": "Закрыть",
      "iosStep1": "Нажмите кнопку «Поделиться» в Safari",
      "iosStep2": "Выберите «На экран Домой»"
    },
```

- [ ] **Step 3: Add translations to ua.json**

```json
    "install": {
      "installApp": "Встановити додаток",
      "addToHomeScreen": "На екран Додому",
      "title": "Встановіть LPlates",
      "description": "Швидкий доступ без браузера",
      "installButton": "Встановити",
      "dismiss": "Закрити",
      "iosStep1": "Натисніть кнопку «Поділитися» в Safari",
      "iosStep2": "Оберіть «На екран Додому»"
    },
```

- [ ] **Step 4: Add translations to cz.json**

```json
    "install": {
      "installApp": "Nainstalovat aplikaci",
      "addToHomeScreen": "Na domovskou obrazovku",
      "title": "Nainstalujte LPlates",
      "description": "Rychlý přístup bez prohlížeče",
      "installButton": "Nainstalovat",
      "dismiss": "Zavřít",
      "iosStep1": "Klepněte na tlačítko Sdílet v Safari",
      "iosStep2": "Vyberte «Na plochu»"
    },
```

- [ ] **Step 5: Add translations to by.json**

```json
    "install": {
      "installApp": "Усталяваць дадатак",
      "addToHomeScreen": "На галоўны экран",
      "title": "Усталюйце LPlates",
      "description": "Хуткі доступ без браўзера",
      "installButton": "Усталяваць",
      "dismiss": "Зачыніць",
      "iosStep1": "Націсніце кнопку «Падзяліцца» у Safari",
      "iosStep2": "Выберыце «На галоўны экран»"
    },
```

- [ ] **Step 6: Add translations to crh.json**

```json
    "install": {
      "installApp": "Къурулым",
      "addToHomeScreen": "Баш экрангъа",
      "title": "LPlates-ни къурунъыз",
      "description": "Браузерсиз тез эришим",
      "installButton": "Къур",
      "dismiss": "Яб",
      "iosStep1": "Safari-де «Пае этинъиз» дюгмесине басынъыз",
      "iosStep2": "«Баш экрангъа» сайланъыз"
    },
```

- [ ] **Step 7: Add translations to es.json**

```json
    "install": {
      "installApp": "Instalar aplicación",
      "addToHomeScreen": "A la pantalla de inicio",
      "title": "Instalar LPlates",
      "description": "Acceso rápido sin navegador",
      "installButton": "Instalar",
      "dismiss": "Cerrar",
      "iosStep1": "Toca el botón Compartir en Safari",
      "iosStep2": "Elige «A la pantalla de inicio»"
    },
```

- [ ] **Step 8: Commit translations**

```bash
git add src/locales/*.json
git commit -m "feat: add PWA install i18n keys for 7 languages"
```

---

### Task 2: Create usePWAInstall hook

**Files:**
- Create: `src/hooks/usePWAInstall.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'pwa_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

export interface UsePWAInstallResult {
  isInstalled: boolean;
  isInstallable: boolean;
  platform: Platform;
  isDismissed: boolean;
  promptInstall: () => void;
  dismiss: () => void;
}

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/(iPhone|iPad|iPod)/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/(Windows|Macintosh|Linux)/i.test(ua)) return 'desktop';
  return 'unknown';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export const usePWAInstall = (): UsePWAInstallResult => {
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandalone());
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [platform] = useState<Platform>(() => detectPlatform());
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const dismissedRef = useRef<boolean>(isDismissed);

  useEffect(() => {
    dismissedRef.current = isDismissed;
  }, [isDismissed]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    deferredPromptRef.current.userChoice.then(() => {
      deferredPromptRef.current = null;
    });
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage not available — silently ignore
    }
  }, []);

  return {
    isInstalled,
    isInstallable,
    platform,
    isDismissed,
    promptInstall,
    dismiss,
  };
};
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors in the new file)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePWAInstall.ts
git commit -m "feat: add usePWAInstall hook with platform detection"
```

---

### Task 3: Create PWAInstallPrompt component

**Files:**
- Create: `src/components/PWAInstallPrompt/PWAInstallPrompt.tsx`
- Create: `src/components/PWAInstallPrompt/PWAInstallPrompt.css`

- [ ] **Step 1: Create the CSS file**

```css
.PWAInstallPrompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding: 1rem;
  padding-top: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.PWAInstallPrompt_visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.PWAInstallPrompt_hiding {
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}

.PWAInstallPrompt-Banner {
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  border-radius: 16px 16px 0 0;
  padding: 1.25rem;
  position: relative;
  box-shadow: 0 -4px 24px var(--color-shadow);
  max-width: 600px;
  margin: 0 auto;
}

.PWAInstallPrompt-Close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-surface-hover);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 16px;
  transition: background 0.2s ease;
}

.PWAInstallPrompt-Close:hover {
  background: var(--color-surface-active);
}

.PWAInstallPrompt-Content {
  padding-right: 2rem;
}

.PWAInstallPrompt-Title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.PWAInstallPrompt-Description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.PWAInstallPrompt-InstallButton {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.PWAInstallPrompt-InstallButton:hover {
  transform: translateY(-1px);
}

.PWAInstallPrompt-InstallButton:active {
  transform: translateY(0);
}

.PWAInstallPrompt-Steps {
  background: var(--color-surface-hover);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.PWAInstallPrompt-Step {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.PWAInstallPrompt-Step + .PWAInstallPrompt-Step {
  margin-top: 0.5rem;
}

.PWAInstallPrompt-StepNumber {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.12);
  color: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.PWAInstallPrompt-StepText {
  font-size: 0.8125rem;
  color: var(--color-text);
  line-height: 1.4;
}

.PWAInstallPrompt-ShareIcon {
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  border: 1.5px solid #007AFF;
  border-radius: 5px;
  text-align: center;
  line-height: 16px;
  font-size: 11px;
  color: #007AFF;
  margin: 0 2px;
}

.PWAInstallPrompt-AddIcon {
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  background: rgba(0, 122, 255, 0.12);
  border-radius: 4px;
  line-height: 18px;
  font-size: 11px;
  margin-left: 2px;
}
```

- [ ] **Step 2: Create the TSX component**

```tsx
import React, { useState, useEffect } from 'react';
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
                    {t('app.install.iosStep1').replace('Share', '')}
                    <span className="PWAInstallPrompt-ShareIcon">↑</span>
                  </span>
                </div>
                <div className="PWAInstallPrompt-Step">
                  <span className="PWAInstallPrompt-StepNumber">2</span>
                  <span className="PWAInstallPrompt-StepText">
                    {t('app.install.iosStep2').replace('Add to Home Screen', '')}
                    <span className="PWAInstallPrompt-AddIcon">➕</span>
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
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/components/PWAInstallPrompt/
git commit -m "feat: add PWAInstallPrompt component with glassmorphism UI"
```

---

### Task 4: Add install button to Header

**Files:**
- Modify: `src/components/Header/Header.tsx`
- Modify: `src/components/Header/Header.css`

- [ ] **Step 1: Modify Header.tsx**

Add import and conditional install button. Replace the entire file:

```tsx
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
```

- [ ] **Step 2: Add CSS rules to Header.css**

Insert before the `@media` block at the end:

```css
.Header-InstallButton {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface-soft);
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.Header-InstallButton:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.Header-InstallButton:active {
  transform: translateY(0);
}

.Header-InstallButtonIcon {
  font-size: 0.9rem;
  line-height: 1;
}

.Header-InstallButtonLabel {
  font-size: 0.8125rem;
}

@media (max-width: 720px) {
  .Header-InstallButtonLabel {
    display: none;
  }
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/components/Header/
git commit -m "feat: add PWA install button to header actions"
```

---

### Task 5: Add onMatchFound callback to LookupPanel

**Files:**
- Modify: `src/components/LookupPanel/LookupPanel.tsx`

The callback fires once when the first search result is found.

- [ ] **Step 1: Modify LookupPanel**

Add `onMatchFound` prop and call it with a ref guard (once only).

In `LookupPanelProps` interface, add the new prop:

```ts
interface LookupPanelProps {
  data: IData;
  showFlags: boolean;
  onToggleFlags: () => void;
  onActiveChange?: (isActive: boolean) => void;
  externalQuery?: string;
  onScanClick?: () => void;
  onMatchFound?: () => void;
}
```

In the component destructuring, add `onMatchFound`:

```ts
const LookupPanel: React.FC<LookupPanelProps> = React.memo(({ 
  data, 
  showFlags, 
  onToggleFlags, 
  onActiveChange, 
  externalQuery,
  onScanClick,
  onMatchFound
}) => {
```

Add a ref to guard single fire, right after the `useState` hooks:

```ts
  const matchFiredRef = React.useRef(false);
```

In the useEffect that saves history (line 88-99), add the callback call:

```ts
  // side-effect: save to history (rerender-derived-state-no-effect)
  React.useEffect(() => {
    if (deferredDataList.length > 0 && deferredQuery.length >= 2) {
      const trimmed = deferredQuery.trim().toUpperCase();
      
      if (!matchFiredRef.current && onMatchFound) {
        matchFiredRef.current = true;
        onMatchFound();
      }
      
      setHistory(prev => {
        if (prev.includes(trimmed)) return prev;
        const newHistory = [trimmed, ...prev].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [deferredDataList, deferredQuery, onMatchFound]);
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/LookupPanel/LookupPanel.tsx
git commit -m "feat: add onMatchFound callback to LookupPanel for install prompt trigger"
```

---

### Task 6: Integrate into App.tsx

**Files:**
- Modify: `src/App/App.tsx`

- [ ] **Step 1: Modify App.tsx**

Add `firstActionDone` state, `PWAInstallPrompt` rendering, `onMatchFound` to LookupPanel, and watch `scannedPlate` for camera scan trigger.

```tsx
import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import './App.css';

import Header from '../components/Header/Header';
import LookupPanel from '../components/LookupPanel/LookupPanel';
import CameraScanner from '../components/CameraScanner/CameraScanner';
import PWAInstallPrompt from '../components/PWAInstallPrompt/PWAInstallPrompt';

import { IData } from '../interfaces';
import LanguageContext from '../contexts/LanguageContext';
import { getCountryFlag, getCountryLabel } from '../utils/countryUtils';
import { useRegionData } from '../hooks/useRegionData';
import { ensureHapticContext } from '../utils/haptic';

interface AppProps {
  data: IData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || { t: (key: string) => key };

  const [isActive, setIsActive] = useState(false);
  const [showFlags, setShowFlags] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedPlate, setScannedPlate] = useState('');
  const [firstActionDone, setFirstActionDone] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);

  const prevScannedPlateRef = useRef('');

  const { originalList } = useRegionData(data);

  const countryFlagGetter = useCallback((country: string) => getCountryFlag(country), []);
  const countryLabelGetter = useCallback((country: string) => getCountryLabel(country, t), [t]);

  const totalRegions = originalList.length;
  const totalCodes = originalList.reduce((sum, region) => sum + region.codes.length, 0);
  const totalCountries = Object.keys(data).length;

  const handleToggleFlags = useCallback(() => {
    setShowFlags(prev => !prev);
  }, []);

  const handleScanClick = useCallback(() => {
    ensureHapticContext();
    setScannedPlate('');
    setIsScannerOpen(true);
  }, []);

  const handleCapture = useCallback((plate: string) => {
    setScannedPlate(plate);
    setIsScannerOpen(false);
  }, []);

  const handleFirstAction = useCallback(() => {
    if (!firstActionDone) {
      setFirstActionDone(true);
    }
  }, [firstActionDone]);

  // Show prompt when first action completes (small delay so user sees results first)
  useEffect(() => {
    if (firstActionDone && !promptVisible) {
      const timer = setTimeout(() => setPromptVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [firstActionDone, promptVisible]);

  // Trigger on camera scan success
  useEffect(() => {
    if (scannedPlate && scannedPlate !== prevScannedPlateRef.current) {
      prevScannedPlateRef.current = scannedPlate;
      handleFirstAction();
    }
  }, [scannedPlate, handleFirstAction]);

  const handlePromptClose = useCallback(() => {
    setPromptVisible(false);
  }, []);

  return (
    <div className={`App ${isActive ? 'App_active' : ''}`}>
      <div className="App-Backdrop" />
      <Header />
      <main className="App-Shell">
        <section className="App-Intro">
          <p className="App-Eyebrow">{t('app.eyebrow')}</p>
          <h1 className="App-Title">{t('app.title')}</h1>
          <p className="App-Description">
            {t('app.description')}
          </p>

          <div className="App-Stats" aria-label={t('app.datasetSummary')}>
            <div className="App-Stat">
              <span className="App-StatValue">{totalRegions}</span>
              <span className="App-StatLabel">{t('app.stats.regionsIndexed')}</span>
            </div>
            <div className="App-Stat">
              <span className="App-StatValue">{totalCodes}</span>
              <span className="App-StatLabel">{t('app.stats.codesAvailable')}</span>
            </div>
            <div className="App-Stat">
              <span className="App-StatValue">
                {totalCountries}
                {showFlags && (
                  <div className="App-StatFlags">
                    {Object.keys(data).map(country => (
                      <span key={country} title={countryLabelGetter(country)}>
                        {countryFlagGetter(country)}
                      </span>
                    ))}
                  </div>
                )}
              </span>
              <span className="App-StatLabel">{t('app.stats.countriesCovered')}</span>
            </div>
          </div>

        </section>

        <LookupPanel 
          data={data} 
          showFlags={showFlags}
          onToggleFlags={handleToggleFlags}
          onActiveChange={setIsActive}
          externalQuery={scannedPlate}
          onScanClick={handleScanClick}
          onMatchFound={handleFirstAction}
        />
      </main>

      {isScannerOpen && (
        <CameraScanner 
          onClose={() => setIsScannerOpen(false)}
          onCapture={handleCapture}
        />
      )}

      <PWAInstallPrompt
        visible={promptVisible}
        onClose={handlePromptClose}
      />
    </div>
  );
};

export default App;
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors)

- [ ] **Step 3: Build check**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App/App.tsx
git commit -m "feat: integrate PWA install prompt with first-action trigger in App"
```

---

### Task 7: Add Playwright E2E tests

**Files:**
- Create: `e2e/pwa/install-prompt.spec.ts`

- [ ] **Step 1: Create test file**

```ts
import { expect, test } from '@playwright/test';

test.describe('PWA Install Prompt', () => {
  test('prompt is hidden before any user action', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();
  });

  test('prompt appears after successful search', async ({ page }) => {
    await page.goto('./');
    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    // Wait for results to appear
    await expect(page.locator('.Results')).toBeVisible();

    // Prompt should appear after 1s delay
    await expect(page.locator('.PWAInstallPrompt')).toBeVisible({ timeout: 5000 });
  });

  test('close button hides prompt and saves dismissed flag', async ({ page }) => {
    await page.goto('./');
    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    await expect(page.locator('.Results')).toBeVisible();
    await expect(page.locator('.PWAInstallPrompt')).toBeVisible({ timeout: 5000 });

    await page.locator('.PWAInstallPrompt-Close').click();
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();

    const dismissed = await page.evaluate(() =>
      localStorage.getItem('pwa_install_dismissed')
    );
    expect(dismissed).toBe('true');
  });

  test('prompt does not reappear after dismissal on reload', async ({ page }) => {
    await page.goto('./');
    // Pre-set dismissed flag
    await page.evaluate(() =>
      localStorage.setItem('pwa_install_dismissed', 'true')
    );
    await page.reload();

    const input = page.getByRole('textbox');
    await input.fill('77');
    await input.press('Enter');

    await expect(page.locator('.Results')).toBeVisible();

    // Prompt should NOT appear
    await page.waitForTimeout(3000);
    await expect(page.locator('.PWAInstallPrompt')).not.toBeVisible();
  });

  test('install button in header exists when beforeinstallprompt is available', async ({ page }) => {
    // Expose beforeinstallprompt mock
    await page.addInitScript(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (window as any).__deferredPrompt = e;
      });
    });

    await page.goto('./');
    // Dispatch beforeinstallprompt
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    await expect(page.locator('.Header-InstallButton')).toBeVisible();
  });

  test('install button in header is hidden when app is already installed', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });

    await page.goto('./');
    await expect(page.locator('.Header-InstallButton')).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Run PWA tests**

```bash
npx playwright test --config playwright.pwa.config.ts e2e/pwa/install-prompt.spec.ts
```
Expected: All 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/pwa/install-prompt.spec.ts
git commit -m "test: add PWA install prompt E2E tests"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```
Expected: PASS, no errors.

- [ ] **Step 2: Run vitest unit tests**

```bash
npm test
```
Expected: All existing tests pass.

- [ ] **Step 3: Run all E2E tests**

```bash
npx playwright test --config playwright.pwa.config.ts
```
Expected: All tests pass (including new install prompt tests).

- [ ] **Step 4: Run build**

```bash
npm run build
```
Expected: Build succeeds without warnings.

- [ ] **Step 5: Commit if any lint/format changes**

```bash
git status
```
If there are modified files from lint/format fixes:
```bash
git add -A
git commit -m "chore: final verification fixes"
```

---

### Self-Review Checklist

- [x] Spec coverage: all sections mapped to tasks
  - Hook → Task 2
  - PWAInstallPrompt + CSS → Task 3
  - Header button + CSS → Task 4
  - App.tsx integration → Task 6
  - LookupPanel callback → Task 5
  - Locales → Task 1
  - E2E tests → Task 7
- [x] No placeholders (TBD, TODO, "add error handling", "similar to...")
- [x] Type consistency: `usePWAInstall` interface matches usage in Header, PWAInstallPrompt, App
- [x] Translations key `app.install.installApp` matches usage across all components
