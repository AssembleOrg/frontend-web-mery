'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { AlertCircle, Heart, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSectionDeepLink } from '@/lib/hooks/useSectionDeepLink';

export default function LipBlushPage() {
  const t = useTranslations('servicesPages.lipBlush');
  useSectionDeepLink();

  const handleWhatsApp = (message: string) => {
    const whatsappUrl = `https://wa.me/5491161592591?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, '_blank');
  };

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
          {/* Bloque 1: Introducción y Precios (Todo en una tarjeta) */}
          <section id='lip-blush' className='anchor-offset mb-12'>
            <div className='bg-card border rounded-xl p-8'>
              <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
                {t('introduction.heading')}
              </h2>

              {/* Botones de Reserva */}
              <div className='flex flex-col sm:flex-row gap-3 mb-6 pb-6 border-b'>
                <Button
                  size='lg'
                  className='flex-1 px-6 py-3 text-base'
                  onClick={() =>
                    handleWhatsApp(
                      `Hola! Me gustaría reservar una cita de consulta para Lip Blush.`,
                    )
                  }
                >
                  <Calendar className='h-5 w-5 mr-2' />
                  {t('cta.consultationButton')}
                </Button>
                <Button
                  size='lg'
                  className='flex-1 px-6 py-3 text-base'
                  onClick={() =>
                    handleWhatsApp(
                      `Hola! Me gustaría reservar mi primera sesión de Lip Blush.`,
                    )
                  }
                >
                  <Calendar className='h-5 w-5 mr-2' />
                  {t('cta.firstSessionButton')}
                </Button>
              </div>

              {/* Seña */}
              <div className='mb-6 pb-6 border-b'>
                <h3 className='text-xl font-semibold text-foreground mb-2'>
                  {t('pricing.depositTitle')}
                </h3>
                <p className='text-2xl font-bold text-primary'>
                  {t('pricing.depositAmount')}
                </p>
              </div>

              {/* Lista de precios */}
              <div className='pt-6'>
                <h3 className='text-xl font-bold text-foreground mb-6'>
                  {t('pricing.priceListTitle')}
                </h3>
                <div className='space-y-4 font-secondary text-base'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-foreground'>
                      {t('pricing.firstSessionLabel')}
                    </p>
                    <p className='text-muted-foreground'>
                      {t('pricing.session1')}
                    </p>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-foreground'>
                      {t('pricing.touchUpLabel')}
                    </p>
                    <p className='text-muted-foreground'>
                      {t('pricing.touchUp')}
                    </p>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-foreground'>
                      {t('pricing.maintenanceLabel')}
                    </p>
                    <p className='text-muted-foreground'>
                      {t('pricing.maintenance')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Textos promocionales y de disponibilidad */}
              <div className='mt-8 text-center bg-muted/40 p-4 rounded-lg'>
                <p className='font-bold text-primary mb-2'>
                  {t('introduction.availability')}
                </p>
                <p className='italic text-muted-foreground text-sm'>
                  {t('introduction.promoText')}
                </p>
              </div>
            </div>
          </section>

          {/* Bloque 2: Descripción del Servicio con Imagen */}
          <section className='mb-12'>
            <div className='relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden'>
              <Image
                src='/Img-home/Lip-blush-1.webp'
                alt='Lip Blush Service'
                fill
                className='object-cover'
              />
            </div>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-6'>
              {t('whatIsIt.heading')}
            </h2>
            <div className='text-muted-foreground font-secondary space-y-4 whitespace-pre-line'>
              <p>{t('whatIsIt.p1')}</p>
              <p>{t('whatIsIt.p2')}</p>
            </div>
          </section>

          {/* Bloque 3: Información Importante */}
          <section className='mb-12 space-y-6'>
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
          </section>

          {/* Camouflage Section */}
          <section id='lip-camouflage' className='anchor-offset mt-12 pt-8 border-t'>
            <h2 className='text-3xl font-bold font-primary text-foreground mb-4'>
              {t('camouflage.heading')}
            </h2>
            <div className='text-muted-foreground font-secondary mb-6 whitespace-pre-line'>
              <p>{t('camouflage.p1')}</p>
            </div>

            {/* Procedure */}
            <div className='bg-card p-6 rounded-lg mb-6 alert-high '>
              <h3 className='text-xl font-bold font-primary text-foreground mb-3'>
                {t('camouflage.procedure.heading')}
              </h3>
              <p className='text-muted-foreground font-secondary'>
                {t('camouflage.procedure.text')}
              </p>
            </div>

            {/* <div className='bg-muted/20 p-6 rounded-lg'>
              <h4 className='text-lg font-primary/10 font-bold text-primary mb-2'>
                {t('camouflage.pricing.camouflageSessionLabel')}
              </h4>
              <p className='text-lg font-primary/10 font-bold text-primary'>
                {t('camouflage.pricing.camouflageSession')}
              </p>
            </div> */}
          </section>

          {/* CTA Section */}
          <BookingCTA
            heading={t('cta.heading')}
            text={t('cta.text')}
            mainButtonText={t('cta.button')}
            showExpressButton={false}
            consultationButtonText={t('cta.consultationButton')}
            firstSessionButtonText={t('cta.firstSessionButton')}
            consultationWhatsAppMessage={`Hola! Me gustaría reservar una cita de consulta para Lip Blush.`}
            firstSessionWhatsAppMessage={`Hola! Me gustaría reservar mi primera sesión de Lip Blush.`}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
