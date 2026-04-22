'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Gift,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { AuthGate } from '@/components/auth/AuthGate';
import { useChatStore } from '@/stores/chat-store';

const navItems = [
  { href: 'admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: 'admin/cursos', label: 'Cursos', icon: GraduationCap },
  { href: 'admin/usuarios', label: 'Usuarios', icon: Users },
  { href: 'admin/cupones', label: 'Cupones', icon: Gift },
  { href: 'admin/chats', label: 'Chats', icon: MessageCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const locale = (params.locale as string) || 'es';
  const mobileFullScreen = useChatStore((s) => s.mobileFullScreen);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user && user.role !== 'ADMIN' && user.role !== 'SUBADMIN') {
      router.push(`/${locale}`);
    }
  }, [isLoading, isAuthenticated, user, router, locale]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]' />
          <p className='mt-4 text-gray-500 text-sm'>Verificando acceso…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (user.role !== 'ADMIN' && user.role !== 'SUBADMIN')) {
    return null;
  }

  const isActive = (href: string) => {
    const full = `/${locale}/${href}`;
    if (href === 'admin') return pathname === full;
    return pathname.startsWith(full);
  };

  return (
    <AuthGate>
      <div className='min-h-screen bg-gray-50 font-admin'>
        <Navigation />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className={`flex gap-6 py-6 md:pb-6 ${mobileFullScreen ? 'pb-0' : 'pb-24'}`}>

            {/* Sidebar — desktop only */}
            <aside className='hidden md:flex flex-col w-52 flex-shrink-0'>
              <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6'>
                <div className='px-4 py-4 border-b border-gray-100'>
                  <p className='text-[11px] font-semibold text-[#EBA2A8] uppercase tracking-widest'>
                    Panel Admin
                  </p>
                  <p className='text-sm font-medium text-gray-700 mt-0.5 truncate'>
                    {user.name || user.email}
                  </p>
                </div>
                <nav className='p-2'>
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={`/${locale}/${href}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                          active
                            ? 'bg-[#FBE8EA] text-[#EBA2A8]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#EBA2A8]' : 'text-gray-400'}`} />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className='flex-1 min-w-0'>
              {children}
            </main>
          </div>
        </div>

        {/* Bottom tab bar — mobile only */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] transition-transform duration-200 ${mobileFullScreen ? 'translate-y-full' : 'translate-y-0'}`}>
          <div className='flex items-stretch'>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={`/${locale}/${href}`}
                  className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors active:bg-[#FBE8EA]/60 ${
                    active ? 'text-[#EBA2A8]' : 'text-gray-400'
                  }`}
                >
                  {active && (
                    <span className='absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#EBA2A8] rounded-full' />
                  )}
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#EBA2A8]' : 'text-gray-400'}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGate>
  );
}
