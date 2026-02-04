import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { dinLight, dinRegular, dinMedium, avantGardeAdmin } from '@/lib/fonts';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-secondary',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://merygarcia.com.ar'),
  title: 'Mery García - Tatuaje Cosmético',
  description:
    'Artista del tatuaje cosmético con más de 20 años de experiencia. Servicios de nanoblading, lip blush, styling de cejas & formaciones profesionales.',
  openGraph: {
    title: 'Mery García - Tatuaje Cosmético',
    description:
      'Artista del tatuaje cosmético con más de 20 años de experiencia. Servicios de nanoblading, lip blush, styling de cejas & formaciones profesionales.',
    url: 'https://merygarcia.com.ar',
    siteName: 'Mery García',
    type: 'website',
    locale: 'es_AR',
    images: [
      {
        url: '/og-image.png',
        width: 500,
        height: 500,
        alt: 'Mery García - Tatuaje Cosmético',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Mery García - Tatuaje Cosmético',
    description:
      'Artista del tatuaje cosmético con más de 20 años de experiencia. Servicios de nanoblading, lip blush, styling de cejas & formaciones profesionales.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='es'
      suppressHydrationWarning
      className={`${dinLight.variable} ${dinRegular.variable} ${dinMedium.variable} ${avantGardeAdmin.variable} ${poppins.variable}`}
    >
      <body
        className='antialiased'
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
