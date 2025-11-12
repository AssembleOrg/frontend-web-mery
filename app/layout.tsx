import type { Metadata } from 'next';
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
  title: 'Mery García - Tatuaje Cosmético',
  description:
    'Especialista en tatuaje cosmético con más de 20 años de experiencia. Servicios de nanoblading, lip blush, styling de cejas & formaciones profesionales.',
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
