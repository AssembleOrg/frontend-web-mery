'use client';

// Importa el hook useTranslations
import { useTranslations } from 'next-intl';

// Las demás importaciones se mantienen igual
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

import {
  Shield,
  Clock,
  Star,
  Package,
  CreditCard,
  AlertTriangle,
  Baby,
} from 'lucide-react';
import Image from 'next/image';
import { BookingCTA } from '@/components/booking-cta';

export default function PecasLunaresPage() {
  const t = useTranslations('servicesPages.frecklesMoles');

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src='/Img-home/home-4.webp'
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

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          {/* Sección: ¿Qué es? */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <Star className='h-8 w-8 text-primary mr-3' />
              {t('whatIsIt.heading')}
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground font-secondary space-y-4'>
              <p className='text-lg leading-relaxed font-secondary'>{t('whatIsIt.p1')}</p>
              {/* Para texto con HTML (como <strong>), usamos t.rich */}
              <p
                className='text-lg leading-relaxed font-secondary'
                dangerouslySetInnerHTML={{ __html: t.raw('whatIsIt.p2') }}
              />
            </div>
          </section>

          {/* Sección: Proceso */}
          <section className='mb-12 bg-muted/30 rounded-lg p-8'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <Clock className='h-8 w-8 text-primary mr-3' />
              {t('process.heading')}
            </h2>
            <div className='text-muted-foreground font-secondary space-y-4'>
              <p className='font-secondary'>{t('process.p1')}</p>
              <p className='font-secondary'>{t('process.p2')}</p>
            </div>
          </section>

          {/* Sección: Bioseguridad */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <Shield className='h-8 w-8 text-primary mr-3' />
              {t('biosecurity.heading')}
            </h2>
            <div className='bg-card p-6 rounded-lg border'>
              <p className='mb-4 text-muted-foreground font-secondary'>
                {t('biosecurity.intro')}
              </p>
              <ul className='space-y-3 text-muted-foreground font-secondary'>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t.raw('biosecurity.li1'),
                    }}
                  />
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t.raw('biosecurity.li2'),
                    }}
                  />
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t.raw('biosecurity.li3'),
                    }}
                  />
                </li>
              </ul>
            </div>
          </section>

          {/* Sección: Precios */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
              {t('pricing.heading')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='font-bold text-xl font-primary text-foreground mb-4'>
                  {t('pricing.frecklesTitle')}
                </h3>
                <div className='space-y-3 text-muted-foreground font-secondary'>
                  <p className='font-secondary'>{t('pricing.session1')}</p>
                  <p className='font-secondary'>{t('pricing.touchUp')}</p>
                  <p className='font-secondary'>{t('pricing.maintenance')}</p>
                </div>
                <div className='mt-4 flex items-center text-sm text-primary'>
                  <CreditCard className='h-4 w-4 mr-2' />
                  <span className='font-secondary'>{t('pricing.creditCard')}</span>
                </div>
              </div>
              <div className='bg-card p-6 rounded-lg border'>
                <h3 className='font-bold text-xl font-primary text-foreground mb-4'>
                  {t('pricing.molesTitle')}
                </h3>
                <p className='text-muted-foreground font-secondary mb-4'>
                  {t('pricing.molesText')}
                </p>
                <div className='flex items-start space-x-3 bg-primary/10 p-4 rounded-md'>
                  <Package className='h-5 w-5 text-primary mt-1' />
                  <div>
                    <h4 className='font-semibold font-primary text-foreground'>
                      {t('pricing.kitTitle')}
                    </h4>
                    <p className='text-sm text-muted-foreground font-secondary'>
                      {t('pricing.kitText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className='text-xs text-center text-muted-foreground font-secondary mt-4'>
              {t('pricing.disclaimer')}
            </p>
          </section>

          {/* Sección: Consideraciones */}
          <section className='mb-12'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6 flex items-center'>
              <AlertTriangle className='h-8 w-8 text-amber-500 mr-3' />
              {t('importantInfo.heading')}
            </h2>
            <div className='bg-card p-6 rounded-lg border'>
              <div className='flex items-start space-x-4'>
                <Baby className='h-8 w-8 text-primary flex-shrink-0' />
                <div>
                  <h3 className='font-semibold font-primary text-foreground'>
                    {t('importantInfo.pregnancyTitle')}
                  </h3>
                  <p className='text-muted-foreground font-secondary'>
                    {t('importantInfo.pregnancyText')}
                  </p>
                </div>
              </div>
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
