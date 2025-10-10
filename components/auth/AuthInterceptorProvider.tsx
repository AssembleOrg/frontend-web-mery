'use client';

/**
 * Auth Interceptor Provider
 * 
 * Wraps the application with authentication error handling
 * Automatically redirects to login on 401/403 responses
 */

import { useAuthInterceptor } from '@/hooks/useAuthInterceptor';

export function AuthInterceptorProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth interceptor
  useAuthInterceptor();

  return <>{children}</>;
}

