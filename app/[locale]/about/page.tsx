import { getTranslations } from 'next-intl/server';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import Image from 'next/image';

export default async function AboutPage() {
  const t = await getTranslations('about.page');
  const content = await getTranslations('about.page.content');

  const processStrongTags = (text: string) => {
    return text.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="text-primary">$1</strong>',
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              {t('hero.title')}
            </h1>
            <p className='text-xl font-secondary text-muted-foreground'>
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              {/* Image */}
              <div className='relative'>
                <div className='aspect-square bg-muted rounded-lg overflow-hidden shadow-lg relative'>
                  <Image
                    src='/Img-home/about-mery.webp'
                    alt='Mery García - Artista del Tatuaje Cosmético'
                    fill
                    className='object-cover'
                  />
                </div>
              </div>

              {/* Content */}
              <div className='space-y-6'>
                <div>
                  <p
                    className='text-lg font-secondary text-muted-foreground leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('paragraph1')),
                    }}
                  />
                </div>

                <div>
                  <p
                    className='font-secondary text-muted-foreground leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('paragraph2')),
                    }}
                  />
                </div>

                <div>
                  <p className='font-secondary text-muted-foreground leading-relaxed'>
                    {content('paragraph3')}{' '}
                  </p>
                </div>

                <div>
                  <p className='font-secondary text-muted-foreground leading-relaxed'>
                    {content('paragraph4')}{' '}
                  </p>
                </div>

                <div className='pt-4'>
                  <p className='font-secondary text-muted-foreground mb-2'>
                    {content('signature.invitation')}
                  </p>
                  <p className='font-secondary font-semibold text-foreground mb-1'>
                    {content('signature.closing')}
                  </p>
                  <p className='text-primary font-custom font-medium'>
                    {content('signature.name')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <BookingCTA
        heading={t('cta.title')}
        text={t('cta.description')}
        mainButtonText={t('cta.bookButton')}
        showExpressButton={false}
      />

      <Footer />
    </div>
  );
}
