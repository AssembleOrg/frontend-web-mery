'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { LanguageToggle } from './language-toggle';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Show on mobile and tablet */}
      <Button
        variant='ghost'
        size='icon'
        className='xl:hidden flex-shrink-0'
        onClick={toggleMenu}
        aria-label='Toggle menu'
      >
        {isOpen ? (
          <X className='h-5 w-5 sm:h-6 sm:w-6' />
        ) : (
          <Menu className='h-5 w-5 sm:h-6 sm:w-6' />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 xl:hidden'
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-background 
        border-l shadow-xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <div className='p-6'>
          {/* Close Button */}
          <div className='flex justify-end mb-8'>
            <Button
              variant='ghost'
              size='icon'
              onClick={closeMenu}
              aria-label='Close menu'
            >
              <X className='h-6 w-6' />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-6'>
            <Link
              href='/'
              className='block text-lg font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
              onClick={closeMenu}
            >
              HOME
            </Link>
            <Link
              href='/about'
              className='block text-lg font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
              onClick={closeMenu}
            >
              MERY GARCIA
            </Link>
            <Link
              href='/formaciones'
              className='block text-lg font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
              onClick={closeMenu}
            >
              FORMACIONES
            </Link>
            <Link
              href='/gift-card'
              className='block text-lg font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
              onClick={closeMenu}
            >
              GIFTCARD
            </Link>
            <Link
              href='/contact'
              className='block text-lg font-primary font-medium transition-colors hover:text-primary text-gray-600 dark:text-gray-300'
              onClick={closeMenu}
            >
              CONTACTO
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className='mt-8 space-y-4'>
            <Button
              className='w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium'
              asChild
            >
              <a
                href='https://merygarciabooking.com/'
                target='_blank'
                rel='noopener noreferrer'
                onClick={closeMenu}
              >
                RESERVA TU CITA MG
              </a>
            </Button>
            <Button
              variant='outline'
              className='w-full border-primary text-primary hover:bg-primary hover:text-white text-sm font-medium'
              onClick={closeMenu}
            >
              INGRESO DE ALUMNOS
            </Button>
          </div>

          {/* Theme and Language toggles */}
          <div className='mt-8 pt-6 border-t flex justify-center space-x-4'>
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
