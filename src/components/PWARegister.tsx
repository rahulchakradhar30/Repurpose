'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Repurpose PWA ServiceWorker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA registration failed:', err);
        });
    }

    // 2. Immediate & Event-Driven Offline Redirection
    const redirectToOfflineIfDisconnected = () => {
      if (typeof window !== 'undefined') {
        const isOfflineNow = !navigator.onLine;
        setIsOffline(isOfflineNow);
        if (isOfflineNow && window.location.pathname !== '/offline.html') {
          window.location.replace('/offline.html');
        }
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      redirectToOfflineIfDisconnected();
    };

    // Check immediately on load/mount
    redirectToOfflineIfDisconnected();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. PWA install prompt handler
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {isOffline && (
        <div 
          role="status" 
          aria-live="polite"
          className="bg-amber-100 text-amber-900 border-b border-amber-300 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between sticky top-0 z-50 shadow-xs"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>
              <strong>Offline Mode:</strong> Live biomedical evidence cannot be fetched. Offline clinical results are not cached as current to prevent stale research data.
            </span>
          </div>
        </div>
      )}

      {canInstall && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-40">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 shadow-md hover:bg-slate-800 transition-colors"
            title="Install Repurpose as PWA"
            aria-label="Install Repurpose as PWA"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Install App</span>
          </button>
        </div>
      )}
    </>
  );
}
