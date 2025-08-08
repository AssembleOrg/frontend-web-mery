import { getTranslations } from 'next-intl/server';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PressGallery } from '@/components/press-gallery';

export default async function PressPage() {
  const t = await getTranslations('press.page');

  // Array of all available press images
  const pressImages = [
    '1-1.webp',
    '2-1.webp',
    '3-1.webp',
    '5-1.webp',
    '6-1.webp',
    '7-1.webp',
    '8-1.webp',
    '9-1.webp',
    '10.webp',
    '11.webp',
    '12.webp',
    '13.webp',
    '14.webp',
    '15.webp',
    '16.webp',
    '17.webp',
    '18.webp',
    '19.webp',
    'beauty-file-1.webp',
    'beauty-file-2.webp',
    'beauty-file-3.webp',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-primary font-bold text-foreground mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-xl font-secondary text-muted-foreground mb-6">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg font-secondary text-muted-foreground max-w-3xl mx-auto">
              {t('content.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Press Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <PressGallery images={pressImages} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}