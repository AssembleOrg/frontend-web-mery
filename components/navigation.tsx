'use client';

import { Link } from '@/i18n/routing';
import { ModeToggle } from './mode-toggle';
import { LanguageToggle } from './language-toggle';
import { Button } from './ui/button';
import { SimpleLogo } from './simple-logo';
import { MobileMenu } from './mobile-menu';
import { UserMenu } from './user-menu';
import { CartIcon } from './cart-icon';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';

export function Navigation() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav className='sticky top-0 z-50 w-full bg-white dark:bg-background border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 md:h-20 items-center justify-between'>
          <Link
            href='/'
            className='flex items-center shrink-0'
          >
            <SimpleLogo />
          </Link>
          <div className='hidden xl:flex items-center space-x-4 2xl:space-x-6'>
            <Link
              href='/'
              className='text-sm font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300 whitespace-nowrap'
            >
              HOME
            </Link>
            <Link
              href='/about'
              className='text-sm font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300 whitespace-nowrap'
            >
              MERY GARCIA
            </Link>
            <Link
              href='/formaciones'
              className='text-sm font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300 whitespace-nowrap'
            >
              FORMACIONES
            </Link>
            <Link
              href='/ofertas-especiales'
              className='relative text-sm font-primary font-medium transition-colors text-gray-600 dark:text-gray-300 whitespace-nowrap group'
            >
              <span className='relative inline-flex items-center gap-1.5'>
                <span className='animate-pulse text-[#67111c] font-bold'>
                  OFERTAS ESPECIALES
                </span>
                <span className='relative flex h-2.5 w-2.5 shrink-0'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67111c] opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-[#67111c]'></span>
                </span>
              </span>
            </Link>
            <Link
              href='/gift-card'
              className='text-sm font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300 whitespace-nowrap'
            >
              GIFTCARD
            </Link>
            <Link
              href='/contact'
              className='text-sm font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300 whitespace-nowrap'
            >
              CONTACTO
            </Link>
          </div>

          {/* Right side controls */}
          <div className='flex items-center space-x-2'>
            <div className='hidden xl:flex items-center'>
              <Button
                size='sm'
                className='bg-primary hover:bg-primary/90 text-white text-xs xl:text-sm font-primary font-medium whitespace-nowrap px-3 xl:px-4'
                asChild
              >
                <a
                  href='https://merygarciabooking.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  RESERVA CITA
                </a>
              </Button>
            </div>

            {/* Cart Icon */}
            <div className='hidden xl:flex items-center ml-2'>
              <CartIcon />
            </div>

            {/* User Menu / Login Button */}
            <div className='hidden xl:flex items-center ml-2'>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className='border-primary text-primary hover:bg-primary hover:text-white text-sm font-primary font-medium whitespace-nowrap px-4'
                  onClick={() => router.push(`/${locale}/login`)}
                >
                  INICIAR SESIÓN
                </Button>
              )}
            </div>

            <div className='hidden lg:flex items-center space-x-1 ml-3 border-l pl-3'>
              <LanguageToggle />
              <ModeToggle />
            </div>
            <div className='xl:hidden'>
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
