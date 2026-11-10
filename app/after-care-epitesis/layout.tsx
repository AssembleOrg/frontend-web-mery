import { aftercareMetadata } from '@/lib/seo';

export const metadata = aftercareMetadata('after-care-epitesis');

export default function AftercareEpitesisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
