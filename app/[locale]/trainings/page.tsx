import { Navigation } from '@/components/navigation';
import { UnderDevelopment } from '@/components/under-development';
import { Footer } from '@/components/footer';
import { getTranslations } from 'next-intl/server';

export default async function TrainingsPage() {
  const t = await getTranslations('trainings.page');

  return (
    <>
      <Navigation />
      <UnderDevelopment pageTitle={t('title')} />
      <Footer />
    </>
  );
}