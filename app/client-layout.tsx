'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';
import { PWAServiceWorker } from '@/components/PWAServiceWorker';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceStore } from '@/store/financeStore';

const publicRoutes = ['/login', '/auth/callback', '/auth/reset-password'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { loadFromSupabase, isLoaded } = useFinanceStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const showNavigation = !isPublicRoute && Boolean(user);

  useEffect(() => {
    const loadData = async () => {
      if (user && !isLoaded) await loadFromSupabase(3);
      setInitialLoading(false);
    };
    if (!authLoading) void loadData();
  }, [user, authLoading, isLoaded, loadFromSupabase]);

  const showPageSkeleton = !isPublicRoute && (authLoading || (Boolean(user) && initialLoading));

  return (
    <ThemeProvider>
      <PWAServiceWorker />
      {showNavigation && <Navigation />}
      {showPageSkeleton ? <PageSkeleton pathname={pathname} /> : children}
    </ThemeProvider>
  );
}
