'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Sparkles, AlertCircle, Heart } from 'lucide-react';
import Image from 'next/image';

export default function LipBlushPage() {
  const t = useTranslations('servicesPages.lipBlush');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/Lip-blush-1.webp'
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
              <Heart className='h-10 w-10 text-primary' />
            </div>
            <p className='text-xl text-muted-foreground font-secondary leading-relaxed italic max-w-3xl mx-auto'>
              {t('intro.text')}
            </p>
          </section>

          {/* What is it Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <Sparkles className='h-8 w-8 text-primary mr-3' />
              {t('whatIsIt.heading')}
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
              <p className='font-secondary'>{t('whatIsIt.p1')}</p>
              <p className='font-secondary'>{t('whatIsIt.p2')}</p>
              <p className='font-secondary'>{t('whatIsIt.p3')}</p>
            </div>
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
                <p className='text-2xl mt-4 flex items-center font-primary/10 font-bold text-primary'>
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
                      {t('pricing.firstSessionLabel')}
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.session1')}
                    </p>
                  </div>
                  <div className='bg-muted/40 p-4 rounded-lg'>
                    <p className='font-semibold font-primary text-foreground'>
                      {t('pricing.touchUpLabel')}
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.touchUp')}
                    </p>
                  </div>
                  <div className='bg-muted/40 p-4 rounded-lg'>
                    <p className='font-semibold font-primary text-foreground'>
                      {t('pricing.maintenanceLabel')}
                    </p>
                    <p className='text-muted-foreground font-secondary'>
                      {t('pricing.maintenance')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Important Info Section */}
          <section className='mb-12'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Herpes Warning */}
              <div className='alert-high border rounded-lg p-6'>
                <div className='flex items-start space-x-3 text-primary'>
                  <AlertCircle className='h-6 w-6 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-lg font-bold font-primary mb-2'>
                      {t('importantInfo.herpesTitle')}
                    </h3>
                    <p className='font-secondary text-sm'>
                      {t('importantInfo.herpesText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preparation */}
              <div className='alert-low border rounded-lg p-6'>
                <div className='flex items-start space-x-3'>
                  <Heart className='h-6 w-6 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-lg font-bold font-primary mb-2'>
                      {t('importantInfo.preparationTitle')}
                    </h3>
                    <p className='font-secondary text-sm'>
                      {t('importantInfo.preparationText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Notice */}
            <div className='mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center'>
              <p className='text-lg font-bold font-secondary text-primary'>
                {t('importantInfo.availability')}
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
