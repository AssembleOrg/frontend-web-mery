'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { AuthGate } from '@/components/auth/AuthGate';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Extract locale from pathname
    const locale = pathname.split('/')[1] || 'es';

    console.log('[AdminLayout] auth check', {
      pathname,
      isLoading,
      isAuthenticated,
      user: user?.id,
    });

    // Wait for auth to load
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    // Redirect to home if not admin (defensive: only if user exists AND is not admin)
    if (user && user.role !== 'ADMIN') {
      router.push(`/${locale}`);
      return;
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]'></div>
          <p className='mt-4 text-gray-600'>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin (defensive: check user exists)
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <AuthGate>
      <div className='min-h-screen bg-gray-50'>
        {/* Navbar Normal */}
        <Navigation />

        {/* Admin Header */}
        <header className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-lg font-medium text-gray-900'>
                  Hola, {user?.name || 'Admin'}
                </span>
              </div>
              <div>
                <button
                  onClick={() => {
                    const locale = pathname.split('/')[1] || 'es';
                    router.push(`/${locale}`);
                  }}
                  className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md'
                >
                  Volver al Sitio
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
