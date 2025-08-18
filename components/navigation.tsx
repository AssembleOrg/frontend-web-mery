'use client';

import { Link } from '@/i18n/routing';
import { ModeToggle } from './mode-toggle';
import { LanguageToggle } from './language-toggle';
import { Button } from './ui/button';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';

export function Navigation() {
  return (
    <nav className='sticky top-0 z-50 w-full bg-white dark:bg-background border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 md:h-20 items-center justify-between'>
          <Link
            href='/'
            className='flex items-center flex-shrink-0'
          >
            <Logo
              className='h-8 w-40 sm:h-10 sm:w-auto md:h-12 lg:h-14'
              priority
            />
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

            <div className='hidden 2xl:flex items-center ml-2'>
              <Button
                variant='outline'
                size='sm'
                className='border-primary text-primary hover:bg-primary hover:text-white text-sm font-primary font-medium whitespace-nowrap px-4'
                asChild
              >
                <Link href='/mi-cuenta'>
                  INGRESO DE ALUMNOS
                </Link>
              </Button>
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
