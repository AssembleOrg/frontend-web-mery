import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Microblading | Mery García',
  description: 'Cuidados posteriores para tu procedimiento de Microblading',
};

export default function AftercareMicrobladingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
