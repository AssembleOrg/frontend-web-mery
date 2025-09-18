'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { BookingCTA } from '@/components/booking-cta';

export default function MicrobladingCamouflagePage() {
  const t = useTranslations('servicesPages.microbladingCamouflage');
  const tShared = useTranslations(
    'servicesPages.microbladingCamouflage.shared'
  );

  const camouflageCases = [{ key: '0' }, { key: '1' }, { key: '2' }];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/img-home/home-2.webp'
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
            <p className='text-xl text-white/90 font-secondary'>{t('hero.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-7xl mx-auto'>
          {/* Main sections for Microblading and Camouflage */}
          <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
            {/* Microblading Column */}
            <article className='mb-12 lg:mb-0'>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('microblading.heading')}
              </h2>
              <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
                <p>{t('microblading.p1')}</p>
                <p>{t('microblading.p2')}</p>
                <p>{t('microblading.p3')}</p>
              </div>
              <h3 className='text-2xl font-bold font-primary text-foreground mt-8 mb-4'>
                {tShared('procedureHeading')}
              </h3>
              <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
                <p>{tShared('procedureConsultation')}</p>
                <p>{tShared('procedureMicroblading')}</p>
              </div>
            </article>

            {/* Camouflage Column */}
            <article>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('camouflage.heading')}
              </h2>
              <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
                <p>{t('camouflage.p1')}</p>
                <p>{t('camouflage.p2')}</p>
              </div>
              <div className='space-y-6 mt-6'>
                {camouflageCases.map((caseItem) => (
                  <div
                    key={caseItem.key}
                    className='bg-muted/30 p-4 rounded-lg'
                  >
                    <h4 className='font-bold font-primary text-foreground'>
                      {t(`camouflage.cases.${caseItem.key}.title`)}
                    </h4>
                    <p className='text-sm text-muted-foreground font-secondary mt-2'>
                      {t(`camouflage.cases.${caseItem.key}.description`)}
                    </p>
                  </div>
                ))}
              </div>
              <h3 className='text-2xl font-bold font-primary text-foreground mt-8 mb-4'>
                {tShared('procedureHeading')}
              </h3>
              <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
                <p>{tShared('procedureConsultation')}</p>
                <p>{tShared('procedureCamouflage')}</p>
              </div>
            </article>
          </div>

          {/* Shared Information Section */}
          <section className='mt-16 pt-12 border-t'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              <div>
                <h2 className='text-2xl font-bold font-primary text-foreground mb-4 flex items-center'>
                  <Shield className='h-7 w-7 text-primary mr-3' />
                  {tShared('biosecurityHeading')}
                </h2>
                <p className='text-muted-foreground font-secondary'>
                  {tShared('biosecurityText')}
                </p>
              </div>
              <div>
                <h2 className='text-2xl font-bold font-primary text-foreground mb-4 flex items-center'>
                  <AlertTriangle className='h-7 w-7 burgundy-text mr-3' />
                  {tShared('pregnantWomenHeading')}
                </h2>
                <p className='text-muted-foreground font-secondary'>
                  {tShared('pregnantWomenText')}
                </p>
              </div>
            </div>
          </section>

          <BookingCTA
            heading={tShared('ctaHeading')}
            text={tShared('ctaText')}
            mainButtonText={tShared('ctaButton')}
            showExpressButton={false}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
