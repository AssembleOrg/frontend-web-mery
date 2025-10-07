'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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

    // Wait for auth to load
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    // Redirect to home if not admin (defensive: only if user exists AND is not admin)
    if (user && user.role !== 'admin') {
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
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Admin Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-2xl font-primary font-bold text-[#660e1b]'>
                Panel de Administrador
              </h1>
              <span className='px-3 py-1 bg-[#f9bbc4]/20 text-[#660e1b] text-sm font-medium rounded-full'>
                ADMIN
              </span>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                {user?.name || 'Admin User'}
              </span>
              <button
                onClick={() => {
                  const locale = pathname.split('/')[1] || 'es';
                  router.push(`/${locale}`);
                }}
                className='px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
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
  );
}
