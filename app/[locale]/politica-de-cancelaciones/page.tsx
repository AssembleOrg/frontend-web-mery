'use client';

import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AlertTriangle, Clock, Star } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function PoliticaCancelacionesPage() {
  const t = useTranslations('cancellationPolicy');
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              {t('title')}
            </h1>
            <p className='text-xl font-secondary text-muted-foreground'>
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto space-y-8'>
            <div className='bg-card p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <Clock className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('commitmentTitle')}
                  </h2>
                  <div className='space-y-3 font-secondary text-muted-foreground'>
                    <p>{t('commitmentText1')}</p>
                    <p className='text-primary font-bold'>
                      {t('commitmentText2')}
                    </p>
                    <p>{t('commitmentText3')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='alert-high p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <AlertTriangle className='h-6 w-6 mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl text-primary font-bold mb-4'>
                    {t('consequencesTitle')}
                  </h2>
                  <div className='space-y-3 '>
                    <p className='text-primary font-bold '>
                      {t('consequencesText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-card p-6 rounded-lg border shadow-sm'>
              <div className='flex items-start space-x-4'>
                <Star className='h-6 w-6 text-primary mt-1 flex-shrink-0' />
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-4'>
                    {t('cosmeticRulesTitle')}
                  </h2>
                  <ul className='list-disc list-inside space-y-3 font-secondary text-muted-foreground'>
                    <li>{t('cosmeticRule1')}</li>
                    <li>{t('cosmeticRule2')}</li>
                    <li>{t('cosmeticRule3')}</li>
                    <li>{t('cosmeticRule4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='bg-primary/5 p-6 rounded-lg border border-primary/20'>
              <h2 className='text-2xl font-primary bg font-bold text-foreground mb-4'>
                {t('exceptionalTitle')}
              </h2>
              <div className='space-y-3 font-secondary text-muted-foreground'>
                <p>{t('exceptionalText1')}</p>
                <p>{t('exceptionalText2')}</p>
                <a
                  href='https://wa.me/5491161592591'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium'
                >
                  <FaWhatsapp className='h-4 w-4 mr-2' />
                  11 6159-2591
                </a>
                <p className='text-sm'>{t('exceptionalNote')}</p>
              </div>
            </div>

            <div className='text-center alert-low p-8 rounded-lg'>
              <h3 className='text-xl font-primary font-bold mb-3'>
                {t('closingTitle')}
              </h3>
              <p className='font-secondary leading-relaxed'>
                {t('closingText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
