import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Lash Line & Lash Camouflage | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Lash Line & Lash Camouflage',
};

export default function AftrecareLashesLineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
