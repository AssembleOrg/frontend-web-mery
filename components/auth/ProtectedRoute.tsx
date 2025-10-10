'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useMemo } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';

  // Track previous state to avoid duplicate logs
  const prevStateRef = useRef({ isLoading, isAuthenticated });

  // Memoize shouldRedirect calculation
  const shouldRedirect = useMemo(() => {
    return !isLoading && !isAuthenticated;
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Only log if state actually changed
    const stateChanged =
      prevStateRef.current.isLoading !== isLoading ||
      prevStateRef.current.isAuthenticated !== isAuthenticated;

    if (stateChanged) {
      console.log('[ProtectedRoute] auth state change', { isLoading, isAuthenticated, locale });
      prevStateRef.current = { isLoading, isAuthenticated };
    }

    // Defensive delay: avoid immediate redirect caused by a race between
    // page mount and useAuth background verification (especially on F5).
    // Wait a short time before redirecting; if auth becomes true in that
    // time, cancel the redirect.
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        console.log('[ProtectedRoute] redirecting to login after delay', `/${locale}/login`);
        router.push(`/${locale}/login`);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, isLoading, isAuthenticated, router, locale]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
