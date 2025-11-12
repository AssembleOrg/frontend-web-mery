import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Nanoblading | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Nanoblading',
};

export default function AftercareNanobladingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
