'use client';

// Importa el hook useTranslations
import { useTranslations } from 'next-intl';

// Las demás importaciones se mantienen igual
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

import { Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { BookingCTA } from '@/components/booking-cta';
import { ServiceClosingMessage } from '@/components/service-closing-message';

export default function PecasLunaresPage() {
  const t = useTranslations('servicesPages.frecklesMoles');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/home-4.webp'
          alt={t('hero.title')}
          fill
          className='object-cover sm:object-[50%_65%]'
        />
        <div className='absolute inset-0 bg-black/50' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='text-4xl md:text-5xl font-bold font-primary mb-4'>
              {t('hero.title')}
            </h1>
            <p className='text-xl text-white/90 font-secondary'>
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          {/* Sección: ¿Qué es? */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
              {t('whatIsIt.heading')}
            </h2>
            <p className='text-muted-foreground font-secondary whitespace-pre-line'>
              {t('whatIsIt.p1')}
            </p>
          </section>

          {/* Imagen del servicio */}
          <div className='relative w-full h-96 md:h-[500px] my-12 rounded-lg overflow-hidden'>
            <Image
              src='/Img-home/home-4.webp'
              alt='Freckles & Moles Service'
              fill
              className='object-cover'
            />
          </div>
          {/* 
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
              {t('procedure.heading')}
            </h2>
            <p className='text-muted-foreground font-secondary whitespace-pre-line'>
              {t('procedure.text')}
            </p>
          </section> */}

          {/* Sección: Bioseguridad */}
          <section className='mb-12'>
            <div className='alert-low border rounded-lg p-6'>
              <div className='burgundy-text'>
                <h2 className='text-3xl font-bold font-primary mb-6 flex items-center'>
                  <Shield className='h-8 w-8 mr-3' />
                  {t('biosecurity.heading')}
                </h2>
                <p className='font-secondary whitespace-pre-line'>
                  {t('biosecurity.text')}
                </p>
              </div>
            </div>
          </section>

          {/* Sección: Precios */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
              {t('pricing.heading')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='font-bold text-xl font-primary text-foreground mb-4'>
                  {t('pricing.frecklesTitle')}
                </h3>
                <div className='space-y-3 text-muted-foreground font-secondary'>
                  <p>{t('pricing.session1')}</p>
                  <p>{t('pricing.touchUp')}</p>
                  <p>{t('pricing.maintenance')}</p>
                </div>
              </div>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='font-bold text-xl font-primary text-foreground mb-4'>
                  {t('pricing.molesTitle')}
                </h3>
                <p className='text-muted-foreground font-secondary mb-6'>
                  {t('pricing.molesText')}
                </p>
                <p className='text-muted-foreground font-secondary text-sm'>
                  {t('pricing.kitText')}
                </p>
              </div>
            </div>
            <p className='text-xs text-center text-muted-foreground font-secondary mt-6'>
              {t('pricing.disclaimer')}
            </p>
          </section>

          {/* Sección: Embarazadas */}
          <section className='mb-12'>
            <div className='alert-high border rounded-lg p-6'>
              <h2 className='text-3xl font-bold font-primary text-primary mb-6 flex items-center'>
                <AlertTriangle className='h-8 w-8 text-primary mr-3' />
                {t('importantInfo.heading')}
              </h2>
              <p className='font-secondary text-primary'>
                {t('importantInfo.pregnancyText')}
              </p>
            </div>
          </section>

          <BookingCTA
            heading={t('cta.heading')}
            text={t('cta.text')}
            mainButtonText={t('cta.button')}
            showExpressButton={false}
          />

          <ServiceClosingMessage className='mt-12' />
        </div>
      </div>

      <Footer />
    </div>
  );
}
