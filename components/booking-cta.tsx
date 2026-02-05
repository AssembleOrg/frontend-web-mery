'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface BookingCTAProps {
  heading?: string;
  text?: string;
  text2?: string;
  mainButtonText?: string;
  showExpressButton?: boolean;
  consultationButtonText?: string;
  firstSessionButtonText?: string;
  consultationWhatsAppMessage?: string;
  firstSessionWhatsAppMessage?: string;
  embedded?: boolean;
}

// 2. Aplicamos las props al componente
export function BookingCTA({
  heading,
  text,
  text2,
  mainButtonText,
  showExpressButton = true,
  consultationButtonText,
  firstSessionButtonText,
  consultationWhatsAppMessage,
  firstSessionWhatsAppMessage,
  embedded = false,
}: BookingCTAProps) {
  const t = useTranslations('booking');

  // WhatsApp handler
  const handleWhatsApp = (message: string) => {
    const whatsappUrl = `https://wa.me/5491161592591?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const content = (
    <div className='max-w-4xl mx-auto text-center'>
          {/* Title with icon */}
          <div className='flex items-center justify-center mb-6'>
            <Calendar className='h-8 w-8 text-primary mr-3' />
            <h2 className='text-3xl font-primary font-bold text-foreground'>
              {heading || t('title')}
            </h2>
          </div>

          {/* Description */}
          <p className='text-lg font-secondary text-muted-foreground mb-6 max-w-2xl mx-auto'>
            {text || t('description')}
          </p>

          {/* Policy Link and Optional Text2 */}
          <div className='mb-8'>
            <Link
              href='/politica-de-cancelaciones'
              className='font-secondary text-sm text-primary hover:text-primary/80 transition-colors underline'
            >
              {t('policyLink')}
            </Link>

          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
            {/* Show dual buttons if both consultation and first session are provided */}
            {consultationButtonText && firstSessionButtonText ? (
              <>
                <Button
                  size='lg'
                  className='px-8 py-3 text-lg'
                  onClick={() => handleWhatsApp(consultationWhatsAppMessage || 'Hola! Me gustaría reservar una cita de consulta.')}
                >
                  <Calendar className='h-5 w-5 mr-2' />
                  {consultationButtonText}
                </Button>
                <Button
                  size='lg'
                  className='px-8 py-3 text-lg'
                  onClick={() => handleWhatsApp(firstSessionWhatsAppMessage || 'Hola! Me gustaría reservar mi primera sesión.')}
                >
                  <Calendar className='h-5 w-5 mr-2' />
                  {firstSessionButtonText}
                </Button>
              </>
            ) : (
              <>
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

                {showExpressButton && (
                  <Button
                    variant='outline'
                    size='lg'
                    className='px-8 py-3 text-lg hover:bg-transparent hover:text-primary'
                    asChild
                  >
                    <Link href='/asesoramiento-express'>
                      <Clock className='h-5 w-5 mr-2' />
                      {t('express')}
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {text2 && (
            <p className='text-xs font-secondary text-muted-foreground mt-3'>
              {text2}
            </p>
          )}

          {/* Additional info */}
          {showExpressButton && (
            <p className='text-sm font-secondary text-muted-foreground'>
              {t('info')}
            </p>
          )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>{content}</div>
    </section>
  );
}
