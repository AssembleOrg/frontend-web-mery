'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AlertTriangle, Clock, CreditCard, Mail } from 'lucide-react';

export default function PoliticaCancelacionesPage() {
  const t = useTranslations('cancellationPolicy');
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              {t('title')}
            </h1>
            <p className='text-xl font-secondary text-muted-foreground'>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto space-y-8'>
            
            {/* Compromiso de Reserva */}
            <div className='bg-card p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <Clock className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('commitmentTitle')}
                  </h2>
                  <div className='space-y-3 font-secondary text-muted-foreground'>
                    <p>
                      {t('commitmentText1')}
                    </p>
                    <p>
                      {t('commitmentText2')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consecuencias de No-Show */}
            <div className='bg-card p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <AlertTriangle className='h-6 w-6 burgundy-text mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('consequencesTitle')}
                  </h2>
                  <div className='space-y-3 font-secondary text-muted-foreground'>
                    <p>
                      {t('consequencesText')}
                    </p>
                    <ul className='list-disc list-inside space-y-2 ml-4'>
                      <li>
                        <strong className='text-amber-600'>{t('consequence1')}</strong>
                      </li>
                      <li>
                        <strong className='text-amber-600'>{t('consequence2')}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Reglas Específicas Tatuaje Cosmético */}
            <div className='bg-card p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <CreditCard className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('cosmeticRulesTitle')}
                  </h2>
                  <div className='space-y-3 font-secondary text-muted-foreground'>
                    <p>
                      {t('cosmeticRulesText')}
                    </p>
                    <ul className='list-disc list-inside space-y-2 ml-4'>
                      <li>
                        <strong className='text-primary'>{t('cosmeticRule1')}</strong>
                      </li>
                      <li>
                        <strong className='text-foreground'>{t('cosmeticRule2')}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Circunstancias Excepcionales */}
            <div className='bg-primary/5 p-6 rounded-lg border border-primary/20'>
              <div className='flex items-start space-x-4'>
                <Mail className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('exceptionalTitle')}
                  </h2>
                  <div className='space-y-3 font-secondary text-muted-foreground'>
                    <p>
                      {t('exceptionalText1')}
                    </p>
                    <p>
                      {t('exceptionalText2')}
                    </p>
                    <a
                      href='mailto:info@merygarcia.com.ar'
                      className='inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium'
                    >
                      <Mail className='h-4 w-4 mr-2' />
                      info@merygarcia.com.ar
                    </a>
                    <p className='text-sm'>
                      {t('exceptionalNote')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Cierre */}
            <div className='text-center bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg'>
              <h3 className='text-xl font-primary font-semibold text-foreground mb-3'>
                {t('closingTitle')}
              </h3>
              <p className='font-secondary text-muted-foreground leading-relaxed'>
                {t('closingText')}
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}