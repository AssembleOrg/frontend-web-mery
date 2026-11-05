import { seoMetadata, serviceJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return seoMetadata('nanoblading', locale);
}

export default async function Layout({
  children,
  params,
}: Params & { children: React.ReactNode }) {
  const { locale } = await params;
  const jsonLd = serviceJsonLd('nanoblading', locale);
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      {children}
    </>
  );
}
