'use client';

import { useEffect } from 'react';
import { usePwaStore, type BeforeInstallPromptEvent } from '@/stores/pwa-store';

/**
 * Registra el service worker (PWA instalable + push) y captura el prompt de
 * instalación para ofrecerlo desde la campana / menú cuando el usuario quiera.
 */
export function PwaProvider() {
  const setDeferredPrompt = usePwaStore((s) => s.setDeferredPrompt);
  const setStandalone = usePwaStore((s) => s.setStandalone);
  const setRegistration = usePwaStore((s) => s.setRegistration);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setStandalone(standalone);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => setRegistration(reg))
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [setDeferredPrompt, setStandalone, setRegistration]);

  return null;
}
