'use client';

import { Link } from '@/i18n/routing';
import { MapPin, Clock, Mail, Instagram, Facebook } from 'lucide-react';
import { ThemeAwareLogo } from './theme-aware-logo';

export function Footer() {
  return (
    <footer className='bg-card border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand */}
          <div>
            <Link
              href='/'
              className='flex items-center'
            >
              <ThemeAwareLogo
                width={200}
                height={60}
                className='h-16 w-auto mb-6'
              />
            </Link>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              Especialista en tatuaje cosmético con más de 20 años de
              experiencia. Formaciones profesionales y servicios de alta
              calidad.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='font-semibold text-foreground mb-4'>Contacto</h3>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <MapPin className='h-4 w-4 text-primary mt-1 flex-shrink-0' />
                <div className='text-sm text-muted-foreground'>
                  <p>Av. Melián 3646 PB 1</p>
                  <p>CABA, Argentina</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Clock className='h-4 w-4 text-primary flex-shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  Martes a Sábado, 10hs a 18hs
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <Mail className='h-4 w-4 text-primary flex-shrink-0' />
                <a
                  href='mailto:info@merygarcia.com.ar'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  info@merygarcia.com.ar
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-foreground mb-4'>Enlaces</h3>
            <div className='space-y-2'>
              <Link
                href='/services'
                className='block text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Servicios
              </Link>
              <Link
                href='/trainings'
                className='block text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Formaciones
              </Link>
              <Link
                href='/gift-card'
                className='block text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Gift Card
              </Link>
              <Link
                href='/press'
                className='block text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Prensa
              </Link>
              <Link
                href='/contact'
                className='block text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Contacto
              </Link>
            </div>

            {/* Social Media */}
            <div className='flex space-x-4 mt-6'>
              <a
                href='https://instagram.com/merygarciaoficial'
                target='_blank'
                rel='noopener noreferrer'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Facebook className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground'>
          <p>© 2025 Mery García. Todos los derechos reservados.</p>
          <p className='mt-2 md:mt-0'>
            Desarrollado con ❤️ para la comunidad del tatuaje cosmético
          </p>
        </div>
      </div>
    </footer>
  );
}
