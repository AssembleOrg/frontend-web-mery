import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mery García - Tatuaje Cosmético',
  description:
    'Especialista en tatuaje cosmético con más de 20 años de experiencia. Servicios de nanoblading, lip blush, styling de cejas y formaciones profesionales.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Don't render html/body here - let the locale layout handle it
  return children;
}
