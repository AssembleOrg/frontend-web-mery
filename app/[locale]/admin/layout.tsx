'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Gift,
  Sparkles,
  MessageCircle,
  CalendarClock,
  Settings,
  FileText,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { AuthGate } from '@/components/auth/AuthGate';
import { useChatStore } from '@/stores/chat-store';
import { MentorshipNotificationBell } from '@/components/mentorship/mentorship-notification-bell';

const navItems = [
  { href: 'admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: 'admin/cursos', label: 'Cursos', icon: GraduationCap },
  { href: 'admin/usuarios', label: 'Usuarios', icon: Users },
  { href: 'admin/cupones', label: 'Cupones', icon: Gift },
  { href: 'admin/promos', label: 'Promos', icon: Sparkles },
  { href: 'admin/chats', label: 'Chats', icon: MessageCircle },
  { href: 'admin/mentorias', label: 'Mentorías', icon: CalendarClock },
  { href: 'admin/formularios', label: 'Formularios', icon: FileText },
  { href: 'admin/configuracion', label: 'Config', icon: Settings },
];

// Mobile: 4 accesos fijos en el bottom bar; el resto va al sheet "Más".
const PRIMARY_HREFS = ['admin', 'admin/cursos', 'admin/chats', 'admin/mentorias'];

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
  const [moreOpen, setMoreOpen] = useState(false);

  // Esconder el bot RAG mientras el sheet "Más" está abierto (no tapar opciones).
  useEffect(() => {
    document.body.classList.toggle('hide-rag-widget', moreOpen);
    return () => document.body.classList.remove('hide-rag-widget');
  }, [moreOpen]);

  useEffect(() => {
    // Esperamos a que termine de resolverse la sesión.
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
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EBA2A8]' />
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
                  <div className='flex items-center justify-between'>
                    <p className='text-[11px] font-semibold text-[#EBA2A8] uppercase tracking-widest'>
                      Panel Admin
                    </p>
                    <MentorshipNotificationBell />
                  </div>
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

            {/* Campana de mentorías — mobile (el sidebar la tiene en desktop) */}
            <div className='md:hidden fixed top-3 right-3 z-50 bg-white/90 dark:bg-card/90 backdrop-blur rounded-full shadow-sm border border-gray-100'>
              <MentorshipNotificationBell />
            </div>

            {/* Main content */}
            <main className='flex-1 min-w-0'>
              {children}
            </main>
          </div>
        </div>

        {/* Bottom tab bar — mobile: 4 fijos + Más */}
        {(() => {
          const primary = navItems.filter((n) => PRIMARY_HREFS.includes(n.href));
          const secondary = navItems.filter((n) => !PRIMARY_HREFS.includes(n.href));
          const moreActive = secondary.some((n) => isActive(n.href));
          return (
            <>
              <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ${mobileFullScreen ? 'translate-y-full' : 'translate-y-0'}`}>
                <div className='flex items-stretch'>
                  {primary.map(({ href, label, icon: Icon }) => {
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
                        <Icon className={`w-5 h-5 ${active ? 'text-[#EBA2A8]' : 'text-gray-400'}`} />
                        {label}
                      </Link>
                    );
                  })}
                  <button
                    type='button'
                    onClick={() => setMoreOpen(true)}
                    className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors active:bg-[#FBE8EA]/60 ${
                      moreActive ? 'text-[#EBA2A8]' : 'text-gray-400'
                    }`}
                  >
                    {moreActive && (
                      <span className='absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#EBA2A8] rounded-full' />
                    )}
                    <MoreHorizontal className={`w-5 h-5 ${moreActive ? 'text-[#EBA2A8]' : 'text-gray-400'}`} />
                    Más
                  </button>
                </div>
              </nav>

              {/* Sheet "Más" */}
              {moreOpen && (
                <div className='md:hidden fixed inset-0 z-50 flex items-end'>
                  <button
                    type='button'
                    aria-label='Cerrar'
                    onClick={() => setMoreOpen(false)}
                    className='absolute inset-0 bg-black/40'
                  />
                  <div className='relative w-full bg-white rounded-t-2xl shadow-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-semibold text-gray-900'>Más opciones</span>
                      <button
                        type='button'
                        onClick={() => setMoreOpen(false)}
                        className='p-1.5 rounded-full text-gray-400 hover:bg-gray-100'
                      >
                        <X className='w-5 h-5' />
                      </button>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                      {secondary.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={`/${locale}/${href}`}
                            onClick={() => setMoreOpen(false)}
                            className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl text-xs font-medium transition-colors ${
                              active ? 'bg-[#FBE8EA] text-[#EBA2A8]' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${active ? 'text-[#EBA2A8]' : 'text-gray-400'}`} />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </AuthGate>
  );
}
