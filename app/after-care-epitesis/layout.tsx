import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aftercare Epítesis | Mery García',
  description: 'Información y cuidados de tu epítesis de complejo areola–pezón',
};

export default function AftercareEpitesisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
