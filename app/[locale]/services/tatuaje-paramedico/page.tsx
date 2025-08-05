'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function ParamedicalTattooPage() {
  const t = useTranslations('servicesPages.paramedicalTattoo');
  const tShared = useTranslations('servicesPages.paramedicalTattoo.shared');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/handcraft.webp'
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
        <div className='max-w-7xl mx-auto'>
          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
            {/* Areola Harmonization Column */}
            <article className='mb-12 lg:mb-0'>
              <h2 className='text-3xl font-bold text-foreground mb-6'>
                {t('areola.heading')}
              </h2>
              <p className='text-muted-foreground mb-6'>{t('areola.p1')}</p>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-bold text-foreground mb-4'>
                  {t('areola.pricing.heading')}
                </h3>
                <div className='space-y-2 text-muted-foreground'>
                  <p>{t('areola.pricing.deposit')}</p>
                  <p>{t('areola.pricing.session1')}</p>
                  <p>{t('areola.pricing.touchUp')}</p>
                </div>
                <p className='text-sm italic text-muted-foreground mt-4'>
                  {t('areola.pricing.note')}
                </p>
              </div>
            </article>

            {/* Nipple Reconstruction Column */}
            <article>
              <h2 className='text-3xl font-bold text-foreground mb-6'>
                {t('nipple.heading')}
              </h2>
              <p className='text-muted-foreground mb-6'>{t('nipple.p1')}</p>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-bold text-foreground mb-4'>
                  {t('nipple.pricing.heading')}
                </h3>
                <div className='space-y-2 text-muted-foreground'>
                  <p>{t('nipple.pricing.deposit')}</p>
                  <p>{t('nipple.pricing.session1')}</p>
                  <p>{t('nipple.pricing.touchUp')}</p>
                </div>
                <p className='text-sm italic text-muted-foreground mt-4'>
                  {t('nipple.pricing.note')}
                </p>
              </div>
            </article>
          </div>

          {/* Shared Information Section */}
          <section className='mt-16 pt-12 border-t space-y-12'>
            <div className='bg-amber-100 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-lg p-6 text-center max-w-4xl mx-auto'>
              <div className='flex flex-col items-center'>
                <AlertTriangle className='h-8 w-8 text-amber-600 dark:text-amber-400 mb-3' />
                <h3 className='text-xl font-bold text-amber-800 dark:text-amber-200 mb-2'>
                  {tShared('importantInfoHeading')}
                </h3>
                <p className='text-amber-700 dark:text-amber-300'>
                  {tShared('importantInfoText')}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
                  {tShared('procedureHeading')}
                </h2>
                <p className='text-muted-foreground'>
                  {tShared('procedureText')}
                </p>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
                  <Shield className='h-7 w-7 text-primary mr-3' />
                  {tShared('biosecurityHeading')}
                </h2>
                <p className='text-muted-foreground'>
                  {tShared('biosecurityText')}
                </p>
              </div>
            </div>

            <div className='text-center pt-6 mb-6'>
              <div className='mt-4 flex items-center justify-center text-sm text-primary bg-primary/10 p-3 rounded-lg max-w-md mx-auto'>
                <CreditCard className='h-4 w-4 mr-2 flex-shrink-0' />
                <span>{tShared('creditCardNote')}</span>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <BookingCTA
            heading={tShared('cta.heading')}
            text={tShared('cta.text')}
            mainButtonText={tShared('cta.button')}
            showExpressButton={false}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
