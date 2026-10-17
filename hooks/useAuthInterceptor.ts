/**
 * Auth Interceptor Hook
 *
 * Listens for global authentication errors (401/403)
 * and automatically redirects to login page
 *
 * This provides a centralized error handling mechanism
 * for all API calls across the application
 */

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthInterceptor() {
  const router = useRouter();
  const params = useParams();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const locale = (params?.locale as string) || 'es';

  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      // Un 401 de un pedido que salió con otra sesión (ej. lanzado antes de
      // iniciar sesión y respondido después) es viejo: se ignora.
      const detail = (event as CustomEvent).detail as { tokenAlEnviar?: string | null } | undefined;
      if (detail && 'tokenAlEnviar' in detail && (detail.tokenAlEnviar ?? null) !== (Cookies.get('auth_token') ?? null)) {
        return;
      }

      // Clear auth state
      clearAuth();

      // Redirect to login
      // Use replace to prevent back button from returning to protected page
      router.replace(`/${locale}/login`);
    };

    // Listen for auth errors from api-client
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [router, locale, clearAuth]);
}
