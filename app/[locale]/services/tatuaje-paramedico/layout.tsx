import { seoMetadata, serviceJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return seoMetadata('paramedical', locale);
}

export default async function Layout({
  children,
  params,
}: Params & { children: React.ReactNode }) {
  const { locale } = await params;
  const jsonLd = serviceJsonLd('paramedical', locale);
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      {children}
    </>
  );
}
