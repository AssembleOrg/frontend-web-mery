import { extraPageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return extraPageMetadata('terminos', locale);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
