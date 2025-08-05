import { Navigation } from '@/components/navigation';
import { UnderDevelopment } from '@/components/under-development';
import { Footer } from '@/components/footer';
import { getTranslations } from 'next-intl/server';

export default async function ContactPage() {
  const t = await getTranslations('contact.page');

  return (
    <>
      <Navigation />
      <UnderDevelopment pageTitle={t('title')} />
      <Footer />
    </>
  );
}