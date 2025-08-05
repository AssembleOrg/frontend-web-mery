'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, Clock, Star } from 'lucide-react';
import Image from 'next/image';

export default function ScalpPage() {
  const t = useTranslations('servicesPages.scalp');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/img-home/home-3.webp'
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
          {/* What is it Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-6 flex items-center'>
              <Star className='h-8 w-8 text-primary mr-3' />
              {t('whatIsIt.heading')}
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground'>
              <p>{t('whatIsIt.p1')}</p>
            </div>
          </section>

          {/* Procedure Section */}
          <section className='mb-12 bg-muted/30 rounded-lg p-8'>
            <h2 className='text-3xl font-bold text-foreground mb-6 flex items-center'>
              <Clock className='h-8 w-8 text-primary mr-3' />
              {t('procedure.heading')}
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground space-y-4'>
              <p>{t('procedure.p1')}</p>
              <p>{t('procedure.p2')}</p>
              <p>{t('procedure.p3')}</p>
              <p>{t('procedure.p4')}</p>
            </div>
          </section>

          {/* Biosecurity Section */}
          <section className='mb-12'>
            <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
              <Shield className='h-7 w-7 text-primary mr-3' />
              {t('biosecurity.heading')}
            </h2>
            <p className='text-muted-foreground'>{t('biosecurity.text')}</p>
          </section>

          {/* Important Info Section */}
          <section className='mb-12'>
            <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
              <AlertTriangle className='h-7 w-7 text-amber-500 mr-3' />
              {t('importantInfo.heading')}
            </h2>
            <p className='text-muted-foreground'>{t('importantInfo.text')}</p>
          </section>

          {/* CTA Section */}
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
