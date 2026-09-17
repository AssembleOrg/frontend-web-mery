'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import type { ComponentProps } from 'react';
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';

interface UserMenuProps {
  onNavigate?: () => void;
  /** Render the items as a flat list (used inside the mobile panel, no floating dropdown). */
  inline?: boolean;
}

interface MenuItem {
  href: ComponentProps<typeof Link>['href'];
  label: string;
  icon: LucideIcon;
  /** Highlight with brand color (new/featured items). */
  highlight?: boolean;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/admin', label: 'Panel Admin', icon: Settings, adminOnly: true },
  { href: '/mi-cuenta', label: 'Mi Cuenta', icon: UserIcon },
  { href: '/presencialidad', label: 'Presencialidad', icon: MapPin, highlight: true },
];

export function UserMenu({ onNavigate, inline = false }: UserMenuProps = {}) {
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
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
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
      router.push(`/${locale}/admin`);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const items = MENU_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const roleBadge = (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        isAdmin
          ? 'bg-[#EBA2A8]/20 text-[#660e1b] dark:bg-[#EBA2A8]/30 dark:text-[#EBA2A8]'
          : 'bg-[#FBE8EA] text-[#660e1b] dark:bg-[#F7CBCB]/30 dark:text-[#F7CBCB]'
      }`}
    >
      {isAdmin ? 'Administrador' : 'Estudiante'}
    </span>
  );

  const menuItems = (
    <>
      <div className='py-1'>
        {items.map(({ href, label, icon: Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            onClick={handleMenuItemClick}
            className='flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors active:bg-muted/80'
          >
            <Icon className='w-5 h-5 shrink-0' />
            <span className='font-medium'>{label}</span>
            {highlight && (
              <span className='ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2B2B2B] text-[#F9BBC4]'>
                ¡Nuevo!
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className='my-1 border-t border-border' />

      <button
        onClick={handleLogout}
        className='w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors active:bg-muted/80'
      >
        <LogOut className='w-5 h-5 shrink-0' />
        <span className='font-medium'>Cerrar Sesión</span>
      </button>
    </>
  );

  // Inline mode: flat list rendered directly in the mobile panel (no floating dropdown).
  if (inline) {
    return (
      <div className='w-full rounded-lg border border-border overflow-hidden'>
        <div className='flex items-center gap-3 px-4 py-3 border-b border-border'>
          <div className='w-9 h-9 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-sm font-semibold shrink-0'>
            {initials}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-foreground truncate'>
              {displayName}
            </p>
            <div className='mt-0.5'>{roleBadge}</div>
          </div>
        </div>
        {menuItems}
      </div>
    );
  }

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
          {roleBadge}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-2 z-50'>
          {menuItems}
        </div>
      )}
    </div>
  );
}
