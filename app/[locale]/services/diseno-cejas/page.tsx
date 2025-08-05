'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { BookingCTA } from '@/components/booking-cta';

export default function EyebrowStylingPage() {
  const t = useTranslations('servicesPages.eyebrowStyling');

  const services = [
    { key: '0' },
    { key: '1' },
    { key: '2' },
    { key: '3' },
    { key: '4' },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/img-home/home-1.webp'
          alt={t('hero.title')}
          fill
          className='object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              {t('hero.title')}
            </h1>
            <p className='text-xl text-white/90'>{t('hero.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          {/* Services List Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-8 text-center'>
              {t('intro.heading')}
            </h2>
            <div className='space-y-8'>
              {services.map((service) => (
                <div
                  key={service.key}
                  className='bg-card p-6 rounded-lg border'
                >
                  <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-2'>
                    <h3 className='text-xl font-bold text-foreground'>
                      {t(`services.${service.key}.title`)}
                    </h3>
                    <p className='text-lg font-semibold text-primary mt-2 sm:mt-0'>
                      {t(`services.${service.key}.price`)}
                    </p>
                  </div>
                  <p className='text-muted-foreground'>
                    {t(`services.${service.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <BookingCTA
            heading={t('cta.heading')}
            text={t('cta.text')}
            mainButtonText={t('cta.button')}
            showExpressButton={false}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
