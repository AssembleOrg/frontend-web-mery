// TODO: Remove mock auth when backend ready - Add real JWT verification
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // MOCK AUTH: Simulating admin authentication
    // TODO: Replace with real JWT verification from backend
    const mockIsAdmin = true; // Change to false to test redirect

    if (!mockIsAdmin) {
      // Extract locale from pathname
      const locale = pathname.split('/')[1] || 'es';
      router.push(`/${locale}/login`);
      return;
    }

    setIsAuthorized(true);

    /*
    // Real implementation when backend is ready:
    const token = localStorage.getItem('auth_token');

    if (!token) {
      const locale = pathname.split('/')[1] || 'es';
      router.push(`/${locale}/login`);
      return;
    }

    // Verify token with backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      if (data.user.role !== 'admin') {
        const locale = pathname.split('/')[1] || 'es';
        router.push(`/${locale}`);
        return;
      }
      setIsAuthorized(true);
    })
    .catch(() => {
      localStorage.removeItem('auth_token');
      const locale = pathname.split('/')[1] || 'es';
      router.push(`/${locale}/login`);
    });
    */
  }, [router, pathname]);

  if (!isAuthorized) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]'></div>
          <p className='mt-4 text-gray-600'>Verificando acceso...</p>
        </div>
      </div>
    );
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
                Admin User {/* TODO: Show real user name from JWT */}
              </span>
              <button
                onClick={() => {
                  // TODO: Implement real logout
                  // localStorage.removeItem('auth_token');
                  const locale = pathname.split('/')[1] || 'es';
                  router.push(`/${locale}`);
                }}
                className='px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
              >
                Salir
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
