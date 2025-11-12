import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Camouflage | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Camouflage',
};

export default function AftrecareCamouflageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
