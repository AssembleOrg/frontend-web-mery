'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';

interface UserMenuProps {
  onNavigate?: () => void;
}

export function UserMenu({ onNavigate }: UserMenuProps = {}) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  // Get user initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user.name || user.email;
  const initials = getInitials(displayName);
  const isAdmin = user.role === 'ADMIN';

  const handleLogout = async () => {
    console.log('[UserMenu] 🔴 Iniciando logout...');
    try {
      await logout();
      console.log('[UserMenu] ✅ Logout completado');
      setIsOpen(false);
      onNavigate?.();
      // ⭐ Forzar recarga completa para limpiar todo el estado
      console.log('[UserMenu] 🔄 Forzando recarga completa...');
      window.location.href = `/${locale}`;
    } catch (error) {
      console.error('[UserMenu] ❌ Error en logout:', error);
      // Forzar limpieza local y redirección incluso si hay error
      setIsOpen(false);
      onNavigate?.();
      window.location.href = `/${locale}`;
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const handleAvatarClick = () => {
    if (isAdmin) {
      router.push(`/${locale}/admin/cursos`);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className='relative'
      ref={menuRef}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
      >
        {/* Avatar - clickeable para admin */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleAvatarClick();
          }}
          className={`w-8 h-8 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-sm font-semibold ${
            isAdmin ? 'cursor-pointer hover:bg-[#eba2a8] transition-colors' : ''
          }`}
        >
          {initials}
        </div>

        {/* Name (hidden on mobile) */}
        <div className='hidden md:flex flex-col items-start'>
          <span className='text-sm font-medium text-foreground'>
            {displayName}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-[#EBA2A8]/20 text-[#660e1b] dark:bg-[#EBA2A8]/30 dark:text-[#EBA2A8]'
                : 'bg-[#FBE8EA] text-[#660e1b] dark:bg-[#F7CBCB]/30 dark:text-[#F7CBCB]'
            }`}
          >
            {isAdmin ? 'Administrador' : 'Estudiante'}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-full sm:w-72 bg-card border border-border rounded-lg shadow-lg py-2 z-50'>
          {/* User Info (visible on mobile) */}
          <div className='md:hidden px-4 py-3 border-b border-border'>
            <p className='text-sm font-medium text-foreground'>{displayName}</p>
            <p className='text-xs text-muted-foreground mt-1'>{user.email}</p>
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                isAdmin
                  ? 'bg-[#EBA2A8]/20 text-[#660e1b] dark:bg-[#EBA2A8]/30 dark:text-[#EBA2A8]'
                  : 'bg-[#FBE8EA] text-[#660e1b] dark:bg-[#F7CBCB]/30 dark:text-[#F7CBCB]'
              }`}
            >
              {isAdmin ? 'Administrador' : 'Estudiante'}
            </span>
          </div>

          {/* Menu Items */}
          <div className='py-1'>
            {/* Admin: Panel Admin primero */}
            {isAdmin && (
              <Link
                href={`/${locale}/admin/cursos`}
                onClick={handleMenuItemClick}
                className='flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors active:bg-muted/80'
              >
                <Settings className='w-5 h-5' />
                <span className='font-medium'>Panel Admin</span>
              </Link>
            )}

            <Link
              href={`/${locale}/mi-cuenta`}
              onClick={handleMenuItemClick}
              className='flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors active:bg-muted/80'
            >
              <UserIcon className='w-5 h-5' />
              <span className='font-medium'>Mi Cuenta</span>
            </Link>
          </div>

          {/* Separator */}
          <div className='my-1 border-t border-border' />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors active:bg-muted/80'
          >
            <LogOut className='w-5 h-5' />
            <span className='font-medium'>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
