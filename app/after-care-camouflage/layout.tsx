import { aftercareMetadata } from '@/lib/seo';

export const metadata = aftercareMetadata('after-care-camouflage');

export default function AftrecareCamouflageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
