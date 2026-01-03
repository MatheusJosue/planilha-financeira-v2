'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceStore } from '@/store/financeStore';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

// Routes that don't need the navigation bar
const publicRoutes = ['/login', '/auth/callback', '/auth/reset-password'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { loadFromSupabase, isLoaded } = useFinanceStore();
  const [initialLoading, setInitialLoading] = useState(true);

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const showNavigation = !isPublicRoute && user;

  // Load data when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (user && !isLoaded) {
        await loadFromSupabase(3); // Load 3 months of data
      }
      setInitialLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, isLoaded, loadFromSupabase]);

  // Show loading state while checking auth or loading data
  if (authLoading || (user && initialLoading && !isPublicRoute)) {
    return (
      <ThemeProvider>
        <div
          className="min-h-screen flex items-center justify-content-center"
          style={{ background: 'var(--bg-gradient)' }}
        >
          <div className="text-center">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center animate-pulse"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'var(--gradient-primary)',
                fontSize: '40px',
              }}
            >
              💰
            </div>
            <h2
              className="h5 fw-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Carregando...
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Preparando sua planilha financeira
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {showNavigation && <Navigation />}
      {children}
    </ThemeProvider>
  );
}
