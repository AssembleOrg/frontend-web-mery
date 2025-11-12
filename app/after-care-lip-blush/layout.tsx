import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Lip Blush | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Lip Blush',
};

export default function AftercareLipBlushLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
