import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function LearnMoreSection() {
  const t = useTranslations('home.learnMore');

  return (
    <div className="bg-gradient-to-r from-primary/5 to-background p-8 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Image Column */}
        <div className="order-2 md:order-1">
          <div className="relative">
            <Image
              src="/Img-home/about-mery.webp"
              alt="Mery García"
              width={400}
              height={400}
              className="rounded-2xl shadow-lg w-full h-auto"
              priority
            />
          </div>
        </div>
        
        {/* Content Column */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-primary font-bold text-foreground mb-4">
            {t('title')}{' '}
            <span className="text-primary">{t('titleHighlight')}</span>
          </h2>
          <p className="font-secondary text-muted-foreground leading-relaxed mb-6">
            {t('description')}
          </p>
          <Button 
            asChild
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 font-primary font-medium group"
          >
            <Link href="/about">
              {t('button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}