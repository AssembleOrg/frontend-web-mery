'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, Star, Clock } from 'lucide-react';
import Image from 'next/image';

export default function NanoScalpPage() {
  const t = useTranslations('servicesPages.nanoscalp');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/home-6.webp'
          alt={t('hero.title')}
          fill
          className='object-cover'
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

      {/* Content */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          {/* What is it Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <Star className='h-8 w-8 text-primary mr-3' />
              {t('whatIsIt.heading')}
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
              <p className='font-secondary'>{t('whatIsIt.p1')}</p>
              <p className='font-secondary'>{t('whatIsIt.p2')}</p>
            </div>
          </section>

          {/* Pricing & Important Info Grid */}
          <section className='mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
            {/* Pricing */}
            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-xl font-bold font-primary text-foreground mb-4'>
                {t('pricing.heading')}
              </h3>
              <div className='space-y-3 text-muted-foreground font-secondary'>
                <p className='font-secondary'>{t('pricing.deposit')}</p>
                <p className='font-secondary'>{t('pricing.session1')}</p>
                <p className='font-secondary'>{t('pricing.session2')}</p>
              </div>
              <p className='text-sm italic text-muted-foreground font-secondary mt-4'>
                {t('pricing.note')}
              </p>
            </div>

            {/* Important Info */}
            <div className='alert-low border rounded-lg p-6'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='h-6 w-6 burgundy-text mt-1 flex-shrink-0' />
                <div>
                  <h3 className='text-xl font-bold font-primary mb-2'>
                    {t('importantInfo.heading')}
                  </h3>
                  <p className='font-secondary mb-4'>
                    {t('importantInfo.text')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Procedure & Biosecurity Grid */}
          <section className='mb-12 grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-2xl font-bold font-primary text-foreground mb-4 flex items-center'>
                <Clock className='h-7 w-7 text-primary mr-3' />
                {t('procedure.heading')}
              </h2>
              <p className='text-muted-foreground font-secondary'>
                {t('procedure.text')}
              </p>
            </div>
            <div>
              <h2 className='text-2xl font-bold font-primary text-foreground mb-4 flex items-center'>
                <Shield className='h-7 w-7 text-primary mr-3' />
                {t('biosecurity.heading')}
              </h2>
              <p className='text-muted-foreground font-secondary'>
                {t('biosecurity.text')}
              </p>
            </div>
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
