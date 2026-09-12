import { create } from 'zustand';

/** Evento `beforeinstallprompt` (Chrome/Edge/Android). */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaState {
  /** Hay prompt de instalación disponible (no instalada aún). */
  canInstall: boolean;
  /** Corriendo como app instalada (standalone). */
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  swRegistration: ServiceWorkerRegistration | null;
  setDeferredPrompt: (e: BeforeInstallPromptEvent | null) => void;
  setStandalone: (v: boolean) => void;
  setRegistration: (r: ServiceWorkerRegistration | null) => void;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export const usePwaStore = create<PwaState>((set, get) => ({
  canInstall: false,
  isStandalone: false,
  deferredPrompt: null,
  swRegistration: null,
  setDeferredPrompt: (e) => set({ deferredPrompt: e, canInstall: !!e }),
  setStandalone: (v) => set({ isStandalone: v }),
  setRegistration: (r) => set({ swRegistration: r }),
  promptInstall: async () => {
    const e = get().deferredPrompt;
    if (!e) return 'unavailable';
    await e.prompt();
    const { outcome } = await e.userChoice;
    set({ deferredPrompt: null, canInstall: false });
    return outcome;
  },
}));
