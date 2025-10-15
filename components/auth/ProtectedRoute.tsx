'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';

//*Aca tendria que usar el skeleton loader para global jeje

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[ProtectedRoute] No autenticado. Redirigiendo a login...');

      router.push(`/${locale}/login?redirect=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, locale]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
