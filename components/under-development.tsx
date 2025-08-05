import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UnderDevelopmentProps {
  pageTitle: string;
}

export function UnderDevelopment({ pageTitle }: UnderDevelopmentProps) {
  const t = useTranslations('underDevelopment');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <Construction className="h-24 w-24 text-primary mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {pageTitle}
              </h1>
              <h2 className="text-xl font-semibold text-muted-foreground mb-6">
                {t('title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('message')}
              </p>
            </div>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                {t('backHome')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}