'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, CreditCard, Star, Clock } from 'lucide-react';
import Image from 'next/image';

export default function ParamedicalTattooPage() {
  const t = useTranslations('servicesPages.paramedicalTattoo');
  const tShared = useTranslations('servicesPages.paramedicalTattoo.shared');
  const tNanoScalp = useTranslations('servicesPages.nanoscalp');

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
        <div className='max-w-7xl mx-auto'>
          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
            {/* Areola Harmonization Column */}
            <article className='mb-12 lg:mb-0'>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('areola.heading')}
              </h2>
              <p className='text-muted-foreground font-secondary mb-6'>
                {t('areola.p1')}
              </p>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-bold font-primary text-foreground mb-4'>
                  {t('areola.pricing.heading')}
                </h3>
                <div className='space-y-2 text-muted-foreground font-secondary'>
                  <p className='font-secondary'>
                    {t('areola.pricing.deposit')}
                  </p>
                  <p className='font-secondary'>
                    {t('areola.pricing.session1')}
                  </p>
                  <p className='font-secondary'>
                    {t('areola.pricing.touchUp')}
                  </p>
                </div>
                <p className='text-sm italic text-muted-foreground font-secondary mt-4'>
                  {t('areola.pricing.note')}
                </p>
                <div className='mt-4 alert-low border rounded-lg p-3 flex items-center text-sm font-primary/10 font-bold'>
                  <CreditCard className='h-6 w-6 mr-2' />
                  <span>{tShared('creditCardNote')}</span>
                </div>
              </div>
            </article>

            {/* Nipple Reconstruction Column */}
            <article>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('nipple.heading')}
              </h2>
              <p className='text-muted-foreground font-secondary mb-6'>
                {t('nipple.p1')}
              </p>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-bold font-primary text-foreground mb-4'>
                  {t('nipple.pricing.heading')}
                </h3>
                <div className='space-y-2 text-muted-foreground font-secondary'>
                  <p className='font-secondary'>
                    {t('nipple.pricing.deposit')}
                  </p>
                  <p className='font-secondary'>
                    {t('nipple.pricing.session1')}
                  </p>
                  <p className='font-secondary'>
                    {t('nipple.pricing.touchUp')}
                  </p>
                </div>
                <p className='text-sm italic text-muted-foreground font-secondary mt-4'>
                  {t('nipple.pricing.note')}
                </p>
                <div className='mt-4 alert-low border rounded-lg p-3 flex items-center text-sm font-primary/10 font-bold'>
                  <CreditCard className='h-6 w-6 mr-2' />
                  <span>{tShared('creditCardNote')}</span>
                </div>
              </div>
            </article>
          </div>

          {/* Nano Scalp Section */}
          <section className='mt-16 pt-12 border-t'>
            <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
              {/* Nano Scalp Image Column */}
              <div className='mb-8 lg:mb-0 lg:h-full'>
                <div className='relative h-96 lg:h-full overflow-hidden rounded-lg'>
                  <Image
                    src='/Img-home/home-6.webp'
                    alt={tNanoScalp('hero.title')}
                    fill
                    className='object-cover'
                  />
                </div>
              </div>

              {/* Nano Scalp Content Column */}
              <article>
                <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
                  <Star className='h-8 w-8 text-primary mr-3' />
                  {tNanoScalp('whatIsIt.heading')}
                </h2>
                <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4 mb-8'>
                  <p className='font-secondary'>{tNanoScalp('whatIsIt.p1')}</p>
                  <p className='font-secondary'>{tNanoScalp('whatIsIt.p2')}</p>
                </div>

                {/* Nano Scalp Pricing */}
                <div className='bg-card p-6 rounded-lg border mb-8'>
                  <h3 className='text-xl font-bold font-primary text-foreground mb-4'>
                    {tNanoScalp('pricing.heading')}
                  </h3>
                  <div className='space-y-3 text-muted-foreground font-secondary'>
                    <p className='font-secondary'>{tNanoScalp('pricing.deposit')}</p>
                    <p className='font-secondary'>{tNanoScalp('pricing.session1')}</p>
                    <p className='font-secondary'>{tNanoScalp('pricing.session2')}</p>
                  </div>
                  <p className='text-sm italic text-muted-foreground font-secondary mt-4'>
                    {tNanoScalp('pricing.note')}
                  </p>
                  <div className='mt-4 alert-low border rounded-lg p-3 flex items-center text-sm font-primary/10 font-bold'>
                    <CreditCard className='h-6 w-6 mr-2' />
                    <span>{tShared('creditCardNote')}</span>
                  </div>
                </div>

                {/* Nano Scalp Important Info */}
                <div className='alert-high border rounded-lg p-6 mb-8'>
                  <div className='flex items-start space-x-3 text-primary'>
                    <AlertTriangle className='h-6 w-6 mt-1 flex-shrink-0' />
                    <div>
                      <h3 className='text-xl font-bold font-primary mb-2'>
                        {tNanoScalp('importantInfo.heading')}
                      </h3>
                      <p className='font-secondary mb-4'>
                        {tNanoScalp('importantInfo.text')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nano Scalp Procedure & Biosecurity Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {/* Procedimiento */}
                  <div className='alert-low border rounded-lg p-6'>
                    <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                      <Clock className='h-6 w-6 mr-3' />
                      {tNanoScalp('procedure.heading')}
                    </h3>
                    <p className='font-secondary text-sm'>{tNanoScalp('procedure.text')}</p>
                  </div>

                  {/* Bioseguridad */}
                  <div className='alert-low border rounded-lg p-6'>
                    <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                      <Shield className='h-6 w-6 mr-3' />
                      {tNanoScalp('biosecurity.heading')}
                    </h3>
                    <p className='font-secondary text-sm'>{tNanoScalp('biosecurity.text')}</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Shared Information Section */}
          <section className='mt-16 pt-12 border-t space-y-12'>
            <div className='alert-high border rounded-lg p-6 text-center max-w-4xl mx-auto'>
              <div className='flex flex-col items-center'>
                <AlertTriangle className='h-8 w-8 text-primary mb-3' />
                <h3 className='text-xl font-bold font-primary text-primary mb-2'>
                  {tShared('importantInfoHeading')}
                </h3>
                <p className='font-secondary text-primary'>
                  {tShared('importantInfoText')}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              <div>
                <h2 className='text-2xl font-bold font-primary text-foreground mb-4 flex items-center'>
                  {tShared('procedureHeading')}
                </h2>
                <p className='text-muted-foreground font-secondary'>
                  {tShared('procedureText')}
                </p>
              </div>

              <div className='alert-low border rounded-lg p-6'>
                <h2 className='text-2xl font-bold font-primary  mb-4 flex items-center'>
                  <Shield className='h-7 w-7  mr-3' />
                  {tShared('biosecurityHeading')}
                </h2>
                <p className='font-secondary '>{tShared('biosecurityText')}</p>
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
