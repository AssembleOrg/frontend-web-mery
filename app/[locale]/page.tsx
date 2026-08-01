import { Navigation } from '@/components/navigation';
import PromoFlyer from '@/components/promo-flyer';
import AbhPromoModal from '@/components/abh-promo-modal';
import { ExpandableServiceGallery } from '@/components/expandable-service-gallery';
import { BookingCTA } from '@/components/booking-cta';
import { LearnMoreSection } from '@/components/learn-more-section';
import { VideoShowcase } from '@/components/video-showcase';
import { Footer } from '@/components/footer';
import { getTranslations } from 'next-intl/server';

const HOME_VIDEO_ID =
  process.env.NEXT_PUBLIC_HOME_VIDEO_ID || '1214844591';

export default async function HomePage() {
  const t = await getTranslations('home.videoShowcase');
  const services = [
    {
      key: 'eyebrowStyling',
      href: '/services/diseno-cejas',
      image: '/Img-home/home-1.webp',
    },
    {
      key: 'nanoblading',
      href: '/services/nanoblading',
      image: '/Img-home/nanoblading.webp',
    },
    // {
    //   key: 'scalp',
    //   href: '/services/scalp',
    //   image: '/Img-home/home-3.webp',
    // },
    {
      key: 'freckles',
      href: '/services/pecas-lunares',
      image: '/Img-home/home-4.webp',
    },
    {
      key: 'lashesLine',
      href: '/services/styling-pestanas',
      image: '/Img-home/home-8.webp',
    },
    {
      key: 'lipBlush',
      href: '/services/lip-blush',
      image: '/Img-home/Lip-blush-1.webp',
    },
    {
      key: 'paramedical',
      href: '/services/tatuaje-paramedico',
      image: '/Img-home/home-6.webp',
    },
  ];

  return (
    <div className='min-h-screen-dvh bg-background'>
      {/* <PromoFlyer /> */}
      <AbhPromoModal />
      <Navigation />

      {/* Hero Section: Video (left) + Quote (right) */}
      <section className='relative py-14 md:py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden'>
        <div
          aria-hidden
          className='absolute -top-32 right-0 w-[420px] h-[420px] rounded-full bg-[#EBA2A8]/10 blur-[100px] -z-0'
        />
        <div
          aria-hidden
          className='absolute -bottom-32 left-0 w-[360px] h-[360px] rounded-full bg-[#F7CBCB]/20 blur-[80px] -z-0'
        />

        <div className='container mx-auto px-4 max-w-7xl relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center'>
            {/* Video — LEFT */}
            <div className='lg:col-span-5 order-1 flex justify-center lg:justify-start'>
              <div className='w-full max-w-[320px] sm:max-w-[360px]'>
                <VideoShowcase
                  vimeoId={HOME_VIDEO_ID}
                  title="I didn't choose the brow life. The brow life chose me."
                  durationLabel={t('duration')}
                  playLabel={t('playLabel')}
                />
              </div>
            </div>

            {/* Quote — RIGHT */}
            <div className="lg:col-span-7 order-2 text-center lg:text-left">
              <h1 className='text-2xl md:text-3xl lg:text-4xl font-primary font-bold text-foreground tracking-tight mt-6 max-w-4xl'>
                I DIDN&apos;T CHOOSE THE BROW LIFE. THE BROW LIFE{' '}
                <span className='text-primary'>CHOSE ME</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Services Gallery */}
      <section className='py-10 md:py-16'>
        <div className='container mx-auto px-4'>
          <ExpandableServiceGallery services={services} />
        </div>
      </section>

      {/* Combined Section: Booking CTA + Learn More */}
      <section className='py-10 md:py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            {/* Mobile: Stack vertically, Desktop: 2 columns */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
              {/* Booking CTA Column */}
              <div className='order-1'>
                <BookingCTA embedded showExpressButton={true} />
              </div>

              {/* Learn More Column */}
              <div className='order-2'>
                <LearnMoreSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
