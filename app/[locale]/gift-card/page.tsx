'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MessageCircle, Gift, ShoppingBag, Send } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function GiftCardPage() {
  const t = useTranslations('giftCard.page');
  const content = useTranslations('giftCard.page.content');
  const ctaSection = useTranslations('giftCard.page.ctaSection');

  const handleWhatsApp = () => {
    const message =
      'Hola, quiero regalar mi giftcard física y giftcard virtual. Consulta por bases y condiciones.';
    const whatsappUrl = `https://wa.me/5491161592591?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFisicaWhatsApp = () => {
    const message =
      'Hola, quiero regalar una Gift Card Física. ¿Pueden darme más información?';
    const whatsappUrl = `https://wa.me/5491161592591?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleVirtualWhatsApp = () => {
    const message =
      'Hola, quiero regalar una Gift Card Virtual. ¿Pueden darme más información?';
    const whatsappUrl = `https://wa.me/5491161592591?text=${encodeURIComponent(
      message
    )}`;
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

                {/* Contact Section */}
                <div className='bg-card p-6 rounded-lg border'>
                  <h4 className='text-lg font-primary font-bold text-foreground mb-4 flex items-center'>
                    <MessageCircle className='h-5 w-5 text-primary mr-2' />
                    Recepción de Servicios
                  </h4>
                  <div className='space-y-3'>
                    <button
                      onClick={handleWhatsApp}
                      className='flex items-center space-x-3 w-full text-left hover:bg-muted/50 py-2 px-3 rounded transition-colors'
                    >
                      <FaWhatsapp className='h-4 w-4 text-primary flex-shrink-0' />
                      <span className='font-secondary text-muted-foreground hover:text-primary transition-colors'>
                        WhatsApp: 11 6159-2591
                      </span>
                    </button>
                  </div>
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
                <div className='bg-card rounded-lg p-6 border mt-4'>
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
                      <FaWhatsapp className='h-4 w-4' />
                      {content('consultButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Physical & Virtual Gift Cards */}
      <section className='relative py-20 bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden'>
        {/* Sparkle Background */}
        <div className='absolute inset-0 pointer-events-none'>
          {/* Estrellas lado izquierdo - concentradas */}
          <div className='absolute top-[12%] left-[8%] w-3 h-3 bg-primary star-shape animate-twinkle' style={{animationDelay: '0s'}} />
          <div className='absolute top-[28%] left-[15%] w-2 h-2 bg-primary/70 star-shape animate-twinkle' style={{animationDelay: '0.4s'}} />
          <div className='absolute top-[45%] left-[5%] w-2.5 h-2.5 bg-primary/80 star-shape animate-twinkle' style={{animationDelay: '0.8s'}} />
          <div className='absolute top-[62%] left-[18%] w-2 h-2 bg-primary/60 star-shape animate-twinkle' style={{animationDelay: '1.2s'}} />
          <div className='absolute top-[78%] left-[10%] w-3 h-3 bg-primary/70 star-shape animate-twinkle' style={{animationDelay: '0.6s'}} />
          <div className='absolute top-[20%] left-[25%] w-2 h-2 bg-primary/80 star-shape animate-twinkle' style={{animationDelay: '1s'}} />
          <div className='absolute top-[55%] left-[22%] w-2.5 h-2.5 bg-primary star-shape animate-twinkle' style={{animationDelay: '0.3s'}} />

          {/* Estrellas distribuidas (centro y derecha) */}
          <div className='absolute top-[15%] right-[35%] w-3 h-3 bg-primary/80 star-shape animate-twinkle' style={{animationDelay: '0.6s'}} />
          <div className='absolute top-[25%] right-[20%] w-2 h-2 bg-primary/60 star-shape animate-twinkle' style={{animationDelay: '0.3s'}} />
          <div className='absolute top-[55%] right-[12%] w-2.5 h-2.5 bg-primary star-shape animate-twinkle' style={{animationDelay: '1.2s'}} />
          <div className='absolute bottom-[35%] right-[28%] w-2 h-2 bg-primary/60 star-shape animate-twinkle' style={{animationDelay: '0.7s'}} />
          <div className='absolute top-[70%] left-[45%] w-2.5 h-2.5 bg-primary/70 star-shape animate-twinkle' style={{animationDelay: '1s'}} />
          <div className='absolute bottom-[15%] right-[40%] w-2 h-2 bg-primary star-shape animate-twinkle' style={{animationDelay: '0.2s'}} />
          <div className='absolute top-[32%] left-[60%] w-2.5 h-2.5 bg-primary/80 star-shape animate-twinkle' style={{animationDelay: '0.8s'}} />
          <div className='absolute bottom-[25%] right-[15%] w-2 h-2 bg-primary/70 star-shape animate-twinkle' style={{animationDelay: '0.5s'}} />
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-primary font-bold text-foreground mb-4 text-center'>
              {ctaSection('title')}
            </h2>
            <p className='font-secondary text-muted-foreground mb-12 text-lg text-center max-w-2xl mx-auto'>
              {ctaSection('subtitle')}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Physical Gift Card */}
              <div className='bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col'>
                <div className='mb-6 flex justify-center'>
                  <div className='bg-primary/10 p-4 rounded-full'>
                    <ShoppingBag className='h-12 w-12 text-primary' />
                  </div>
                </div>
                <h3 className='text-2xl font-primary font-bold text-foreground mb-4 text-center'>
                  {ctaSection('physical.title')}
                </h3>
                <p className='font-secondary text-muted-foreground mb-6 text-center flex-grow'>
                  {ctaSection('physical.description')}
                </p>
                <div className='flex justify-center'>
                  <button
                    onClick={handleFisicaWhatsApp}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-lg w-full md:w-auto justify-center'
                  >
                    <FaWhatsapp className='h-5 w-5' />
                    {ctaSection('physical.button')}
                  </button>
                </div>
              </div>

              {/* Virtual Gift Card */}
              <div className='bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col'>
                <div className='mb-6 flex justify-center'>
                  <div className='bg-primary/10 p-4 rounded-full'>
                    <Send className='h-12 w-12 text-primary' />
                  </div>
                </div>
                <h3 className='text-2xl font-primary font-bold text-foreground mb-4 text-center'>
                  {ctaSection('virtual.title')}
                </h3>
                <p className='font-secondary text-muted-foreground mb-6 text-center flex-grow'>
                  {ctaSection('virtual.description')}
                </p>
                <div className='flex justify-center'>
                  <button
                    onClick={handleVirtualWhatsApp}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-lg w-full md:w-auto justify-center'
                  >
                    <FaWhatsapp className='h-5 w-5' />
                    {ctaSection('virtual.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
