'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function NanobladingCamouflagePage() {
  const t = useTranslations('servicesPages.nanobladingCamouflage');

  const camouflageCases = [{ key: '0' }, { key: '1' }, { key: '2' }];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/nanoblading.webp'
          alt={t('hero.title')}
          fill
          className='object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold mb-4'>
              {t('hero.title')}
            </h1>
            <p className='text-xl font-secondary text-white/90'>
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-7xl mx-auto'>
          {/* Deposit Info */}
          <section className='mb-12 text-center bg-muted/30 p-6 rounded-lg'>
            <p className='font-secondary text-muted-foreground mb-3'>
              {t('pricingInfo.depositText')}
            </p>
            <p className='text-xl font-primary font-bold text-primary'>
              {t('pricingInfo.depositAmount')}
            </p>
          </section>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
            {/* Nanoblading Column */}
            <article className='mb-12 lg:mb-0'>
              <h2 className='text-3xl font-primary font-bold text-foreground mb-6'>
                {t('nanoblading.heading')}
              </h2>
              <div className='prose prose-lg max-w-none font-secondary text-muted-foreground space-y-4'>
                <p>{t('nanoblading.p1')}</p>
                <p>{t('nanoblading.p2')}</p>
                <p>{t('nanoblading.p3')}</p>
              </div>

              <div className='mt-8 bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-primary font-bold text-foreground mb-4'>
                  {t('nanoblading.pricing.heading')}
                </h3>
                <div className='space-y-2 font-secondary text-muted-foreground'>
                  <p>{t('nanoblading.pricing.session1')}</p>
                  <p>{t('nanoblading.pricing.touchUp')}</p>
                  <p className='text-sm italic'>
                    {t('nanoblading.pricing.note')}
                  </p>
                </div>
                <div className='mt-4 flex items-center text-sm text-primary'>
                  <CreditCard className='h-4 w-4 mr-2' />
                  <span>{t('nanoblading.pricing.creditCardNote')}</span>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-foreground mt-8 mb-4'>
                {t('shared.procedureHeading')}
              </h3>
              <p className='text-muted-foreground'>
                {t('shared.procedureTextNano')}
              </p>
            </article>

            {/* Camouflage Column */}
            <article>
              <h2 className='text-3xl font-primary font-bold text-foreground mb-6'>
                {t('camouflage.heading')}
              </h2>
              <p className='text-muted-foreground mb-6'>{t('camouflage.p1')}</p>

              <div className='mt-8 bg-card p-6 rounded-lg border'>
                <h3 className='text-xl font-primary font-bold text-foreground mb-4'>
                  {t('camouflage.pricing.heading')}
                </h3>
                <div className='space-y-2 font-secondary text-muted-foreground'>
                  <p>{t('camouflage.pricing.technique')}</p>
                  <p className='text-sm italic'>
                    {t('camouflage.pricing.kitNote')}
                  </p>
                  <p className='text-sm italic'>
                    {t('camouflage.pricing.additionalCostNote')}
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-foreground mt-8 mb-4'>
                {t('camouflage.casesHeading')}
              </h3>
              <div className='space-y-4'>
                {camouflageCases.map((caseItem) => (
                  <div
                    key={caseItem.key}
                    className='bg-muted/30 p-4 rounded-lg'
                  >
                    <h4 className='font-bold text-foreground text-sm uppercase'>
                      {t(`camouflage.cases.${caseItem.key}.title`)}
                    </h4>
                    <p className='text-sm text-muted-foreground mt-2'>
                      {t(`camouflage.cases.${caseItem.key}.description`)}
                    </p>
                  </div>
                ))}
              </div>
              <h3 className='text-2xl font-bold text-foreground mt-8 mb-4'>
                {t('shared.procedureHeading')}
              </h3>
              <p className='text-muted-foreground'>
                {t('shared.procedureTextCamu')}
              </p>
            </article>
          </div>

          {/* Shared Information Section */}
          <section className='mt-16 pt-12 border-t'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
                  <Shield className='h-7 w-7 text-primary mr-3' />
                  {t('shared.biosecurityHeading')}
                </h2>
                <p className='text-muted-foreground'>
                  {t('shared.biosecurityText')}
                </p>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center'>
                  <AlertTriangle className='h-7 w-7 burgundy-text mr-3' />
                  {t('shared.pregnantWomenHeading')}
                </h2>
                <p className='text-muted-foreground'>
                  {t('shared.pregnantWomenText')}
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <BookingCTA
            heading={t('shared.cta.heading')}
            text={t('shared.cta.text')}
            mainButtonText={t('shared.cta.button')}
            showExpressButton={false}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
