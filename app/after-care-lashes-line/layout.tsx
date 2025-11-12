import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Lashes Line | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Lashes Line',
};

export default function AftrecareLashesLineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
