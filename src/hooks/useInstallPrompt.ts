'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Capture beforeinstallprompt as early as possible (before React mounts).
// Chrome fires this event during page load, often before useEffect runs.
let _earlyPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener(
    'beforeinstallprompt',
    (e: Event) => {
      e.preventDefault();
      _earlyPrompt = e as BeforeInstallPromptEvent;
    },
    { once: true }
  );
}

interface InstallPromptState {
  isInstallable: boolean;
  isIOS: boolean;
  isMobileOrTablet: boolean;
  isStandalone: boolean;
  isDismissed: boolean;
  isInstalling: boolean;
  installOutcome: 'accepted' | 'dismissed' | 'unavailable' | null;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_EXPIRY_DAYS = 30;

function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
    navigator.userAgent
  );
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function getDismissedState(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    const { timestamp } = JSON.parse(stored);
    const expiryMs = DISMISS_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < expiryMs;
  } catch {
    return false;
  }
}

function saveDismissed(): void {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ timestamp: Date.now() }));
  } catch {
    // localStorage unavailable
  }
}

export function useInstallPrompt(): InstallPromptState {
  // Initialize from early-captured prompt so we don't miss events that fired before mount
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => _earlyPrompt
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<'accepted' | 'dismissed' | 'unavailable' | null>(null);

  useEffect(() => {
    setIsDismissed(getDismissedState());
    setIsReady(true);

    // Pick up any prompt that arrives after mount (e.g. page revisit)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setDeferredPrompt(null));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      setInstallOutcome('unavailable');
      return;
    }
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      if (outcome === 'dismissed') {
        saveDismissed();
        setIsDismissed(true);
      }
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    saveDismissed();
    setIsDismissed(true);
  }, []);

  const isMobileOrTablet = isReady ? isMobileOrTabletDevice() : false;
  const isIOS = isReady ? isIOSDevice() : false;
  const isStandalone = isReady ? isRunningStandalone() : false;

  // Installable on Android/Chrome: native prompt available
  // Installable on iOS: manual but still worth showing instructions
  const isInstallable = isReady && isMobileOrTablet && !isStandalone && !isDismissed;

  return {
    isInstallable,
    isIOS,
    isMobileOrTablet,
    isStandalone,
    isDismissed,
    isInstalling,
    installOutcome,
    promptInstall,
    dismiss,
  };
}
