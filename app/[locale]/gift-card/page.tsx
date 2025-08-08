import { getTranslations } from 'next-intl/server';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Mail, Gift } from 'lucide-react';

export default async function GiftCardPage() {
  const t = await getTranslations('giftCard.page');
  const content = await getTranslations('giftCard.page.content');

  // Function to process strong tags with custom styling
  const processStrongTags = (text: string) => {
    return text.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="text-primary">$1</strong>'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Gift className="h-16 w-16 mx-auto text-primary mb-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-primary font-bold text-foreground mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-xl font-secondary text-muted-foreground">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section - 2 Column Layout */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Mobile-first: Stack vertically on mobile, 2-column on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              
              {/* Video Column */}
              <div className="order-1 lg:order-1">
                <div className="sticky top-8">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                    <video 
                      className="w-full h-auto"
                      controls
                      poster="/Img-home/Mery-logo-comestic-tattoo.png"
                      preload="metadata"
                    >
                      <source src="/giftcard.mp4" type="video/mp4" />
                      <p className="text-white p-8 text-center">
                        Tu navegador no soporta el elemento de video. 
                        <a href="/giftcard.mp4" className="text-primary underline ml-2">
                          Descargar video
                        </a>
                      </p>
                    </video>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="order-2 lg:order-2 space-y-12">
                
                {/* Intro */}
                <div>
                  <p 
                    className="text-xl text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('intro'))
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <p 
                    className="text-lg text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('description'))
                    }}
                  />
                </div>

                {/* Consultation */}
                <div className="bg-card rounded-lg p-6 border">
                  <p 
                    className="text-lg font-semibold text-foreground text-center"
                    dangerouslySetInnerHTML={{
                      __html: processStrongTags(content.raw('consultation'))
                    }}
                  />
                </div>

                {/* Occasions */}
                <div>
                  <h2 className="text-2xl font-primary font-bold text-foreground mb-6">
                    {content('occasions.title')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {content.raw('occasions.list').map((occasion: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
                        <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground font-medium">{occasion}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-primary font-bold text-foreground mb-6">
              {t('cta.title')}
            </h2>
            <p className="font-secondary text-muted-foreground mb-8 text-lg">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="px-8"
                asChild
              >
                <a href="mailto:info@merygarcia.com.ar?subject=Consulta Gift Card">
                  <Mail className="h-5 w-5 mr-2" />
                  {t('cta.contactButton')}
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('cta.emailText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}