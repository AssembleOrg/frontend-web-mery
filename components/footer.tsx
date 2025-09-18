'use client';

import { Link } from '@/i18n/routing';
import { MapPin, Clock, Mail, Instagram } from 'lucide-react';
import { Logo } from './logo';

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
              <Logo
                size='xl'
                className='mb-6'
              />
            </Link>
            <p className='font-secondary text-muted-foreground text-sm leading-relaxed'>
              Especialista en tatuaje cosmético con más de 20 años de
              experiencia. Formaciones profesionales y servicios de alta
              calidad.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='font-primary font-semibold text-foreground mb-4'>
              Contacto
            </h3>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <MapPin className='h-4 w-4 text-primary mt-1 flex-shrink-0' />
                <div className='text-sm text-muted-foreground'>
                  <p className='font-secondary'>Av. Melián 3646 PB 1</p>
                  <p className='font-secondary'>CABA, Argentina</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Clock className='h-4 w-4 text-primary flex-shrink-0' />
                <p className='font-secondary text-sm text-muted-foreground'>
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
              <div className='flex items-center space-x-3'>
                <Instagram className='h-4 w-4 text-primary flex-shrink-0' />
                <a
                  href='https://instagram.com/merygarciaoficial'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  @merygarciaoficial
                </a>
              </div>
            </div>
            <div className='mt-4'>
              <Link
                href='/contact'
                className='inline-flex items-center px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-primary font-medium rounded-full transition-all duration-300'
              >
                Quiero saber más
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-primary font-semibold text-foreground mb-4'>
              Enlaces
            </h3>
            <div className='space-y-2'>
              <Link
                href='/services'
                className='block font-secondary text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Servicios
              </Link>
              <Link
                href='/formaciones'
                className='block font-secondary text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Formaciones
              </Link>
              <Link
                href='/gift-card'
                className='block font-secondary text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Gift Card
              </Link>
              <Link
                href='/contact'
                className='block font-secondary text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Contacto
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground'>
          <p className='font-secondary'>
            © 2025 Mery García. Todos los derechos reservados.
          </p>
          <div className='flex items-center mt-2 md:mt-0'>
            <p className='font-secondary mr-2'>Desarrollado by</p>
            <a
              href='https://wa.me/5491138207230?text=Hola%20Pistech,%20me%20comunico%20a%20través%20de%20merygarcia%20web.%20Me%20gustaría%20saber%20más%20sobre%20sus%20servicios%20digitales%20que%20ofrecen.'
              target='_blank'
              rel='noopener noreferrer'
              className='font-secondary font-semibold whatsapp-button'
              title='Contactar a Pistech por WhatsApp'
            >
              Pistech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
