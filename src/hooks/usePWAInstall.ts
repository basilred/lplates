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
