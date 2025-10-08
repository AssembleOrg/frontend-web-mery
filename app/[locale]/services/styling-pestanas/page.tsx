'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Sparkles, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function LashesLinePage() {
  const t = useTranslations('servicesPages.lashesLine');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/home-8.webp'
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
          {/* Intro Section */}
          <section className='mb-12 text-center'>
            <div className='inline-block bg-gradient-to-r from-primary/20 to-primary/5 p-4 rounded-full mb-6'>
              <Sparkles className='h-10 w-10 text-primary' />
            </div>
            <p className='text-xl text-muted-foreground font-secondary leading-relaxed italic max-w-3xl mx-auto'>
              {t('intro.text')}
            </p>
          </section>

          {/* Pricing Section */}
          <section className='mb-12'>
            <div className='bg-card border rounded-xl p-8'>
              {/* Deposit Info */}
              <div className='pb-6 border-b'>
                <h3 className='text-xl font-bold font-primary text-foreground mb-3'>
                  {t('pricing.depositTitle')}
                </h3>
                <p className='text-muted-foreground font-secondary mb-4'>
                  {t('pricing.depositText')}
                </p>
                <p className='text-sm mt-4 flex items-center font-primary/10 font-bold text-primary'>
                  {t('pricing.depositAmount')}
                </p>
              </div>

              <div className='pt-6'>
                <h3 className='text-xl font-bold text-foreground mb-4'>
                  {t('pricing.priceListTitle')}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
                  <div className='bg-muted/40 p-4 rounded-lg'>
                    <p className='font-semibold font-primary text-foreground'>
                      Primera Sesión
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.session1').split(': ')[1]}
                    </p>
                  </div>
                  <div className='bg-muted/40 p-4 rounded-lg'>
                    <p className='font-semibold font-primary text-foreground'>
                      Retoque
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.touchUp').split(': ')[1]}
                    </p>
                  </div>
                  <div className='bg-muted/40 p-4 rounded-lg'>
                    <p className='font-semibold font-primary text-foreground'>
                      Mantenimiento
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.maintenance').split(': ')[1]}
                    </p>
                  </div>
                </div>
                <div className='mt-6 alert-low border flex items-center justify-center text-sm p-3 rounded-lg'>
                  <CreditCard className='h-4 w-4 mr-2 flex-shrink-0' />
                  <span className='flex items-center text-sm font-primary/10 font-bold'>
                    {t('pricing.creditCardNote')}
                  </span>
                </div>
              </div>
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
