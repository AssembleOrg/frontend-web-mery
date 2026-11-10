import { aftercareMetadata } from '@/lib/seo';

export const metadata = aftercareMetadata('after-care-lip-blush');

export default function AftercareLipBlushLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
