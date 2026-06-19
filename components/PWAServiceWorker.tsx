'use client';

import { useEffect } from 'react';

export function PWAServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
