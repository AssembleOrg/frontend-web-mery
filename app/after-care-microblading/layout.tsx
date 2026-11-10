import { aftercareMetadata } from '@/lib/seo';

export const metadata = aftercareMetadata('after-care-microblading');

export default function AftercareMicrobladingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
