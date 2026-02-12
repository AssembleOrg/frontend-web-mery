'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Shield, AlertTriangle, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import { useSectionDeepLink } from '@/lib/hooks/useSectionDeepLink';

export default function ParamedicalTattooPage() {
  const t = useTranslations('servicesPages.paramedicalTattoo');
  useSectionDeepLink();

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
        <div className='max-w-7xl mx-auto'>
          {/* Areola Harmonization Section */}
          <section id='areola-harmonization' className='anchor-offset mb-16'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Columna Imagen*/}
              <div className='lg:col-span-1 order-2 lg:order-1'>
                <div className='relative w-full h-96 lg:h-[600px] rounded-lg overflow-hidden'>
                  <Image
                    src='/aereola-1024x1536.jpg'
                    alt='Areola Harmonization Service'
                    fill
                    className='object-cover'
                  />
                </div>
              </div>

              {/* Columna Contenido*/}
              <div className='lg:col-span-2 order-1 lg:order-2'>
                <article>
                  <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                    {t('areola.heading')}
                  </h2>
                  <p className='text-muted-foreground font-secondary mb-6 whitespace-pre-line'>
                    {t('areola.p1')}
                  </p>

                  <div className='bg-card p-6 rounded-lg border mb-8'>
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
                  </div>

                  {/* Areola Procedure & Biosecurity Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                    {/* Procedimiento */}
                    <div className='alert-low border rounded-lg p-6'>
                      <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                        <Clock className='h-6 w-6 mr-3' />
                        {t('areola.procedure.heading')}
                      </h3>
                      <p className='font-secondary text-sm whitespace-pre-line'>
                        {t('areola.procedure.text')}
                      </p>
                    </div>

                    {/* Bioseguridad */}
                    <div className='alert-low border rounded-lg p-6'>
                      <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                        <Shield className='h-6 w-6 mr-3' />
                        {t('areola.biosecurity.heading')}
                      </h3>
                      <p className='font-secondary text-sm whitespace-pre-line'>
                        {t('areola.biosecurity.text')}
                      </p>
                    </div>
                  </div>

                  {/* Areola Important Info */}
                  <div className='alert-high border rounded-lg p-6'>
                    <h3 className='text-xl font-bold font-primary text-primary mb-4 flex items-center'>
                      <AlertTriangle className='h-6 w-6 mr-3' />
                      {t('areola.importantInfo.heading')}
                    </h3>
                    <p className='font-secondary text-primary whitespace-pre-line'>
                      {t('areola.importantInfo.text')}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Nipple Reconstruction Section */}
          <section id='nipple-reconstruction' className='anchor-offset mb-16'>
            <article>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('nipple.heading')}
              </h2>
              <p className='text-muted-foreground font-secondary mb-6 whitespace-pre-line'>
                {t('nipple.p1')}
              </p>

              <div className='bg-card p-6 rounded-lg border mb-8'>
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
              </div>

              {/* Nipple Procedure & Biosecurity Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                {/* Procedimiento */}
                <div className='alert-low border rounded-lg p-6'>
                  <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                    <Clock className='h-6 w-6 mr-3' />
                    {t('nipple.procedure.heading')}
                  </h3>
                  <p className='font-secondary text-sm whitespace-pre-line'>
                    {t('nipple.procedure.text')}
                  </p>
                </div>

                {/* Bioseguridad */}
                <div className='alert-low border rounded-lg p-6'>
                  <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                    <Shield className='h-6 w-6 mr-3' />
                    {t('nipple.biosecurity.heading')}
                  </h3>
                  <p className='font-secondary text-sm whitespace-pre-line'>
                    {t('nipple.biosecurity.text')}
                  </p>
                </div>
              </div>

              {/* Nipple Important Info */}
              <div className='alert-high border rounded-lg p-6'>
                <h3 className='text-xl font-bold font-primary text-primary mb-4 flex items-center'>
                  <AlertTriangle className='h-6 w-6 mr-3' />
                  {t('nipple.importantInfo.heading')}
                </h3>
                <p className='font-secondary text-primary whitespace-pre-line'>
                  {t('nipple.importantInfo.text')}
                </p>
              </div>
            </article>
          </section>

          {/* Nano Scalp Section */}
          <section id='nano-scalp' className='anchor-offset mt-16 pt-12 border-t'>
            <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
              {/* Nano Scalp Image Column */}
              <div className='mb-8 lg:mb-0 lg:h-full'>
                <div className='relative h-96 lg:h-full overflow-hidden rounded-lg'>
                  <Image
                    src='/cuerocabelludo.jpg'
                    alt={t('nanoscalp.heading')}
                    fill
                    className='object-cover'
                  />
                </div>
              </div>

              {/* Nano Scalp Content Column */}
              <article>
                <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
                  <Star className='h-8 w-8 text-primary mr-3' />
                  {t('nanoscalp.heading')}
                </h2>
                <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4 mb-8'>
                  <p className='font-secondary whitespace-pre-line'>
                    {t('nanoscalp.p1')}
                  </p>
                </div>

                {/* Nano Scalp Pricing */}
                <div className='bg-card p-6 rounded-lg border mb-8'>
                  <h3 className='text-xl font-bold font-primary text-foreground mb-4'>
                    {t('nanoscalp.pricing.heading')}
                  </h3>
                  <div className='space-y-3 text-muted-foreground font-secondary'>
                    <p className='font-secondary'>
                      {t('nanoscalp.pricing.deposit')}
                    </p>
                    <p className='font-secondary'>
                      {t('nanoscalp.pricing.session1')}
                    </p>
                    <p className='font-secondary'>
                      {t('nanoscalp.pricing.session2')}
                    </p>
                  </div>
                  <p className='text-sm italic text-muted-foreground font-secondary mt-4'>
                    {t('nanoscalp.pricing.note')}
                  </p>
                </div>

                {/* Nano Scalp Procedure & Biosecurity Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                  {/* Procedimiento */}
                  <div className='alert-low border rounded-lg p-6'>
                    <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                      <Clock className='h-6 w-6 mr-3' />
                      {t('nanoscalp.procedure.heading')}
                    </h3>
                    <p className='font-secondary text-sm whitespace-pre-line'>
                      {t('nanoscalp.procedure.text')}
                    </p>
                  </div>

                  {/* Bioseguridad */}
                  <div className='alert-low border rounded-lg p-6'>
                    <h3 className='text-xl font-bold font-primary mb-4 flex items-center'>
                      <Shield className='h-6 w-6 mr-3' />
                      {t('nanoscalp.biosecurity.heading')}
                    </h3>
                    <p className='font-secondary text-sm whitespace-pre-line'>
                      {t('nanoscalp.biosecurity.text')}
                    </p>
                  </div>
                </div>

                {/* Nano Scalp Important Info */}
                <div className='alert-high border rounded-lg p-6'>
                  <h3 className='text-xl font-bold font-primary text-primary mb-4 flex items-center'>
                    <AlertTriangle className='h-6 w-6 mr-3' />
                    {t('nanoscalp.importantInfo.heading')}
                  </h3>
                  <p className='font-secondary text-primary whitespace-pre-line'>
                    {t('nanoscalp.importantInfo.text')}
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* CTA Section */}
          <section className='mt-16 pt-12 border-t'>
            <BookingCTA
              heading={t('shared.cta.heading')}
              text={t('shared.cta.text')}
              mainButtonText={t('shared.cta.button')}
              showExpressButton={false}
            />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
