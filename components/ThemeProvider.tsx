'use client';

import { useEffect } from 'react';
import { applyAppTheme, type AppTheme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('theme') as AppTheme | null;
    if (savedTheme) {
      applyAppTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyAppTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;
