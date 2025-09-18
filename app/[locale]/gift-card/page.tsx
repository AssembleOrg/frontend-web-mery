'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Gift } from 'lucide-react';

export default function GiftCardPage() {
  const t = useTranslations('giftCard.page');
  const content = useTranslations('giftCard.page.content');

  const handleWhatsApp = () => {
    const message = "Hola, quiero regalar mi giftcard física y giftcard virtual. Consulta por bases y condiciones.";
    const whatsappUrl = `https://wa.me/5491153336627?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Function to process strong tags with custom styling
  const processStrongTags = (text: string) => {
    return text.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="text-primary">$1</strong>'
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-b from-primary/10 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <div className='mb-6'>
              <Gift className='h-16 w-16 mx-auto text-primary mb-4' />
            </div>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              {t('hero.title')}
            </h1>
            <p className='text-xl font-secondary text-muted-foreground'>
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section - 2 Column Layout */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            {/* Mobile-first: Stack vertically on mobile, 2-column on lg+ */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start'>
              {/* Video Column */}
              <div className='order-1 lg:order-1'>
                <div className='sticky top-8'>
                  <div className='relative rounded-2xl overflow-hidden shadow-2xl bg-black'>
                    <video
                      className='w-full h-auto'
                      controls
                      preload='metadata'
                    >
                      <source
                        src='/giftcard.mp4'
                        type='video/mp4'
                      />
                      <p className='text-white p-8 text-center'>
                        Tu navegador no soporta el elemento de video.
                        <a
                          href='/giftcard.mp4'
                          className='text-primary underline ml-2'
                        >
                          Descargar video
                        </a>
                      </p>
                    </video>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className='order-2 lg:order-2 space-y-12'>
                {/* Intro */}
                <div>
                  <p
                    className='text-xl text-muted-foreground leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('intro')),
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <p
                    className='text-lg text-muted-foreground leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('description')),
                    }}
                  />
                </div>

                {/* Occasions */}
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-6'>
                    {content('occasions.title')}
                  </h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {content
                      .raw('occasions.list')
                      .map((occasion: string, index: number) => (
                        <div
                          key={index}
                          className='flex items-center space-x-3 p-3 bg-card rounded-lg border'
                        >
                          <Gift className='h-5 w-5 text-primary flex-shrink-0' />
                          <span className='text-muted-foreground font-medium'>
                            {occasion}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Consultation */}
                <div className='bg-card rounded-lg p-6 border'>
                  <p
                    className='text-lg font-semibold text-foreground text-center mb-4'
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('consultation')),
                    }}
                  />
                  <div className='flex justify-center'>
                    <button
                      onClick={handleWhatsApp}
                      className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-2 px-6 rounded-full font-primary font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2'
                    >
                      <MessageCircle className='h-4 w-4' />
                      Consultar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-primary/10 to-primary/5'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-6'>
              {t('cta.title')}
            </h2>
            <p className='font-secondary text-muted-foreground mb-8 text-lg'>
              {t('cta.description')}
            </p>
            <div className='flex justify-center'>
              <button
                onClick={handleWhatsApp}
                className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 text-lg'
              >
                <MessageCircle className='h-5 w-5' />
                {t('cta.contactButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
