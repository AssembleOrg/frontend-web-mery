'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

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

  useEffect(() => {
    console.log('[ProtectedRoute] auth state change', { isLoading, isAuthenticated, locale });

    // Defensive delay: avoid immediate redirect caused by a race between
    // page mount and useAuth background verification (especially on F5).
    // Wait a short time before redirecting; if auth becomes true in that
    // time, cancel the redirect.
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        console.log('[ProtectedRoute] redirecting to login after delay', `/${locale}/login`);
        router.push(`/${locale}/login`);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router, locale]);

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
