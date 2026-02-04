'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  Calendar,
  Scissors,
  Brush,
  Palette,
  Eye,
  Star,
  Sparkles,
  Heart,
  RefreshCw,
  CreditCard,
  Activity,
  Circle,
  Layers,
} from 'lucide-react';

// Service card component for ARS services
function ServiceCardARS({
  servicio,
  pricing,
  badges,
}: {
  servicio: any;
  pricing: any;
  badges: any;
}) {
  const serviceTranslations = useTranslations(
    `expressConsultation.services.${servicio.titleKey}`,
  );
  const IconComponent = servicio.icon;

  return (
    <div className='bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <IconComponent className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h3 className='font-primary font-semibold text-foreground'>
              {serviceTranslations('title')}
            </h3>
            {servicio.isNew && (
              <span className='inline-block bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full mt-1'>
                {badges('new')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='mb-4'>
        <div className='text-2xl font-primary font-bold text-foreground mb-1'>
          {servicio.price}
        </div>
        <div className='text-sm font-secondary text-primary font-medium'>
          {pricing('discount')}
        </div>
      </div>

      <p className='font-secondary text-muted-foreground text-sm leading-relaxed mb-3'>
        {serviceTranslations('description')}
      </p>

      {servicio.hasRecommendation && (
        <p className='font-secondary text-xs text-primary italic'>
          {serviceTranslations('recommendation')}
        </p>
      )}
    </div>
  );
}

// Service card component for USD services
function ServiceCardUSD({
  servicio,
  pricing,
  badges,
}: {
  servicio: any;
  pricing: any;
  badges: any;
}) {
  const serviceTranslations = useTranslations(
    `expressConsultation.services.${servicio.titleKey}`,
  );
  const IconComponent = servicio.icon;

  return (
    <div className='bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <IconComponent className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h3 className='font-primary font-semibold text-foreground text-lg'>
              {serviceTranslations('title')}
            </h3>
            {servicio.isNew && (
              <span className='inline-block bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full mt-1'>
                {badges('new')}
              </span>
            )}
            {servicio.isComingSoon && (
              <span className='inline-block bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full mt-1 ml-2'>
                {badges('comingSoon')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-3 mb-4'>
        {servicio.prices.firstSession && (
          <div className='flex justify-between items-center'>
            <span className='font-secondary text-sm text-muted-foreground'>
              {pricing('firstSession')}
            </span>
            <div className='text-right'>
              <div className='font-primary font-bold text-foreground'>
                {servicio.prices.firstSession.regular}
              </div>
              <div className='font-secondary text-sm text-primary'>
                {pricing('cash')} {servicio.prices.firstSession.cash}
              </div>
            </div>
          </div>
        )}

        {servicio.prices.retouch && (
          <div className='flex justify-between items-center'>
            <span className='font-secondary text-sm text-muted-foreground'>
              {pricing('retouch')}
            </span>
            <div className='text-right'>
              <div className='font-primary font-bold text-foreground'>
                {servicio.prices.retouch.regular}
              </div>
              <div className='font-secondary text-sm text-primary'>
                {pricing('cash')} {servicio.prices.retouch.cash}
              </div>
            </div>
          </div>
        )}

        {servicio.prices.maintenance && (
          <div className='flex justify-between items-center'>
            <span className='font-secondary text-sm text-muted-foreground'>
              {pricing('maintenance')}
            </span>
            <div className='text-right'>
              <div className='font-primary font-bold text-foreground'>
                {servicio.prices.maintenance.regular}
              </div>
              <div className='font-secondary text-sm text-primary'>
                {pricing('cash')} {servicio.prices.maintenance.cash}
              </div>
            </div>
          </div>
        )}

        {servicio.prices.mixed && (
          <div className='flex justify-between items-center'>
            <span className='font-secondary text-sm text-muted-foreground'>
              {pricing('mixedService')}
            </span>
            <div className='text-right'>
              <div className='font-primary font-bold text-foreground'>
                {servicio.prices.mixed.regular}
              </div>
              <div className='font-secondary text-sm text-primary'>
                {pricing('cash')} {servicio.prices.mixed.cash}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className='font-secondary text-muted-foreground text-sm leading-relaxed mb-3'>
        {serviceTranslations('description')}
      </p>

      {servicio.hasNote && (
        <p className='font-secondary text-xs alert-low p-2 rounded'>
          {serviceTranslations('note')}
        </p>
      )}
    </div>
  );
}

export default function AsesoramientoExpressPage() {
  const t = useTranslations('expressConsultation');
  const pricing = useTranslations('expressConsultation.pricing');
  const badges = useTranslations('expressConsultation.badges');
  const serviciosARS = [
    {
      id: 1,
      icon: Scissors,
      titleKey: 'eyebrowModeling',
      price: 'AR$ 39,000',
      hasRecommendation: true,
    },
    {
      id: 2,
      icon: Brush,
      titleKey: 'eyebrowLamination',
      price: 'AR$ 39,000',
    },
    {
      id: 3,
      icon: RefreshCw,
      titleKey: 'browRefill',
      price: 'AR$ 39,000',
    },
    {
      id: 4,
      icon: Palette,
      titleKey: 'eyebrowTint',
      price: 'AR$ 32,000',
    },
    {
      id: 5,
      icon: RefreshCw,
      titleKey: 'lashRefill',
      price: 'AR$ 32,000',
    },
    {
      id: 6,
      icon: Eye,
      titleKey: 'eyelashTint',
      price: 'AR$ 32,000',
    },
  ];

  const serviciosUSD = [
    {
      id: 7,
      icon: Star,
      titleKey: 'nanoblading',
      prices: {
        firstSession: { regular: 'U$S 610', cash: 'U$S 450' },
        retouch: { regular: 'U$S 317', cash: 'U$S 180' },
        maintenance: { regular: 'U$S 610', cash: 'U$S 450' },
      },
    },
    {
      id: 8,
      icon: Sparkles,
      titleKey: 'freckles',
      prices: {
        firstSession: { regular: 'U$S 650', cash: 'U$S 475' },
        retouch: { regular: 'U$S 317', cash: 'U$S 180' },
      },
    },
    {
      id: 9,
      icon: Eye,
      titleKey: 'lashesLines',
      prices: {
        firstSession: { regular: 'U$S 480', cash: 'U$S 320' },
        retouch: { regular: 'U$S 317', cash: 'U$S 180' },
      },
      isNew: true,
    },
    {
      id: 10,
      icon: Heart,
      titleKey: 'lipBlush',
      prices: {
        firstSession: { regular: 'U$S 650', cash: 'U$S 475' },
        retouch: { regular: 'U$S 317', cash: 'U$S 180' },
      },
    },
  ];

  const serviciosParamedical = [
    {
      id: 11,
      icon: Activity,
      titleKey: 'nanoScalp',
      prices: {
        firstSession: { regular: 'U$S 520', cash: 'U$S 450' },
        maintenance: { regular: 'U$S 520', cash: 'U$S 450' },
      },
    },
    {
      id: 12,
      icon: Circle,
      titleKey: 'nippleAreola',
      prices: {
        firstSession: { regular: 'U$S 520', cash: 'U$S 450' },
        retouch: { regular: 'U$S 240', cash: 'U$S 180' },
      },
    },
    {
      id: 13,
      icon: Layers,
      titleKey: 'scarCamouflage',
      prices: {
        firstSession: { regular: 'U$S 480', cash: 'U$S 420' },
        retouch: { regular: 'U$S 240', cash: 'U$S 180' },
      },
      isComingSoon: true,
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              {t('title')}
            </h1>
            <p className='text-xl font-secondary text-muted-foreground mb-4'>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Beauty Services */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-8 text-center'>
              {t('beautyServicesTitle')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
              {serviciosARS.map((servicio) => (
                <ServiceCardARS
                  key={servicio.id}
                  servicio={servicio}
                  pricing={pricing}
                  badges={badges}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cosmetic Tattoo Services */}
      <section className='py-16 bg-muted/30'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-8 text-center'>
              {t('cosmeticTattooTitle')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {serviciosUSD.map((servicio) => (
                <ServiceCardUSD
                  key={servicio.id}
                  servicio={servicio}
                  pricing={pricing}
                  badges={badges}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Paramedical Tattoo Services */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-8 text-center'>
              {t('paramedicalTattooTitle')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {serviciosParamedical.map((servicio) => (
                <ServiceCardUSD
                  key={servicio.id}
                  servicio={servicio}
                  pricing={pricing}
                  badges={badges}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg'>
              <p className='font-secondary font-bold text-foreground'>
                {t('paymentNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
