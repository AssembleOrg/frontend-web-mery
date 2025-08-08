'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface BookingCTAProps {
  heading?: string;
  text?: string;
  mainButtonText?: string;
  showExpressButton?: boolean;
}

// 2. Aplicamos las props al componente
export function BookingCTA({
  heading,
  text,
  mainButtonText,
  showExpressButton = true,
}: BookingCTAProps) {
  // Siempre obtenemos las traducciones por defecto como fallback
  const t = useTranslations('booking');

  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Title with icon */}
          <div className='flex items-center justify-center mb-6'>
            <Calendar className='h-8 w-8 text-primary mr-3' />
            <h2 className='text-3xl font-primary font-bold text-foreground'>
              {/* 3. Usamos la prop si existe, si no, usamos la traducción por defecto */}
              {heading || t('title')}
            </h2>
          </div>

          {/* Description */}
          <p className='text-lg font-secondary text-muted-foreground mb-8 max-w-2xl mx-auto'>
            {text || t('description')}
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
            <Button
              size='lg'
              className='px-8 py-3 text-lg'
              asChild
            >
              <a
                href='https://merygarciabooking.com/'
                target='_blank'
                rel='noopener noreferrer'
              >
                <Calendar className='h-5 w-5 mr-2' />
                {mainButtonText || t('reserve')}
              </a>
            </Button>

            {/* 4. Mostramos el segundo botón solo si showExpressButton es true */}
            {showExpressButton && (
              <Button
                variant='outline'
                size='lg'
                className='px-8 py-3 text-lg'
              >
                <Clock className='h-5 w-5 mr-2' />
                {t('express')}
              </Button>
            )}
          </div>

          {/* Additional info */}
          {showExpressButton && (
            <p className='text-sm font-secondary text-muted-foreground'>{t('info')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
