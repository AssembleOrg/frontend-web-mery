import { aftercareMetadata } from '@/lib/seo';

export const metadata = aftercareMetadata('after-care-nanoblading');

export default function AftercareNanobladingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
