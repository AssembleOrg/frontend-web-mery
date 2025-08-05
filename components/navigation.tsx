'use client';

import { Link } from '@/i18n/routing';
import { ModeToggle } from './mode-toggle';
import { LanguageToggle } from './language-toggle';
import { Button } from './ui/button';
import { ThemeAwareLogo } from './theme-aware-logo';
import { MobileMenu } from './mobile-menu';

export function Navigation() {
  return (
    <nav className='sticky top-0 z-50 w-full bg-white dark:bg-background border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 md:h-20 items-center justify-between'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center'
          >
            <ThemeAwareLogo
              width={200}
              height={60}
              className='h-12 md:h-16 w-auto'
              priority
            />
          </Link>

          {/* Navigation Links - Centro */}
          <div className='hidden lg:flex items-center space-x-8'>
            <Link
              href='/'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              HOME
            </Link>
            <Link
              href='/about'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              MERY GARCIA
            </Link>
            <Link
              href='/trainings'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              FORMACIONES
            </Link>
            <Link
              href='/gift-card'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              GIFTCARD
            </Link>
            <Link
              href='/press'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              PRENSA
            </Link>
            <Link
              href='/contact'
              className='text-sm font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
            >
              CONTACTO
            </Link>
          </div>

          {/* Desktop Right side buttons */}
          <div className='hidden lg:flex items-center space-x-3'>
            <Button
              className='bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium'
              asChild
            >
              <a
                href='https://merygarciabooking.com/'
                target='_blank'
                rel='noopener noreferrer'
              >
                RESERVA TU CITA MG
              </a>
            </Button>
            <Button
              variant='outline'
              className='border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 text-sm font-medium'
            >
              INGRESO DE ALUMNOS
            </Button>

            {/* Theme and Language toggles - smaller */}
            <div className='flex items-center space-x-1 ml-4 border-l pl-4'>
              <LanguageToggle />
              <ModeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
