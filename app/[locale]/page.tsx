import { Navigation } from '@/components/navigation';
import { ExpandableServiceGallery } from '@/components/expandable-service-gallery';
import { BookingCTA } from '@/components/booking-cta';
import { LearnMoreSection } from '@/components/learn-more-section';
import { Footer } from '@/components/footer';

export default function HomePage() {
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
    {
      key: 'scalp',
      href: '/services/scalp',
      image: '/Img-home/home-3.webp',
    },
    {
      key: 'freckles',
      href: '/services/pecas-lunares',
      image: '/Img-home/home-4.webp',
    },
    {
      key: 'nanoscalp',
      href: '/services/nano-scalp',
      image: '/Img-home/home-6.webp',
    },
    {
      key: 'lashesLine',
      href: '/services/styling-pestanas',
      image: '/Img-home/home-8.webp',
    },
    {
      key: 'paramedical',
      href: '/services/tatuaje-paramedico',
      image: '/Img-home/handcraft.webp',
    },
    {
      key: 'autostyling',
      href: '/formaciones',
      image: '/Img-home/autostyling-gris.svg',
      hoverImage: '/Img-home/autostyling-color.svg',
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section with Quote */}
      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-primary font-bold text-foreground tracking-wide mt-6'>
              I DIDN&apos;T CHOOSE THE BROW LIFE. THE BROW LIFE{' '}
              <span className='text-primary'>CHOSE ME</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Expandable Services Gallery */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <ExpandableServiceGallery services={services} />
        </div>
      </section>

      {/* Combined Section: Booking CTA + Learn More */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            {/* Mobile: Stack vertically, Desktop: 2 columns */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
              {/* Booking CTA Column */}
              <div className='order-1'>
                <BookingCTA showExpressButton={true} />
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
