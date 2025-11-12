'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Navigation />

      <div className='flex-1 flex items-center justify-center px-4 py-20'>
        <div className='text-center max-w-2xl'>
          {/* 404 gigante */}
          <h1
            className='text-9xl font-bold mb-4'
            style={{
              fontFamily: 'var(--font-din-medium), sans-serif',
              color: 'var(--mg-pink)',
            }}
          >
            404
          </h1>

          {/* Título descriptivo */}
          <h2
            className='text-3xl font-bold mb-6'
            style={{
              fontFamily: 'var(--font-din-medium), sans-serif',
              color: 'var(--mg-dark)',
            }}
          >
            {t('notFound.heading')}
          </h2>

          {/* Mensaje */}
          <p
            className='text-lg mb-8'
            style={{
              fontFamily: 'var(--font-secondary), sans-serif',
              color: 'var(--mg-gray)',
            }}
          >
            {t('notFound.message')}
          </p>

          {/* Botón CTA */}
          <Link
            href={`/${locale}`}
            className='inline-block px-8 py-3 rounded text-white font-bold transition-all hover:opacity-90'
            style={{
              backgroundColor: 'var(--mg-pink)',
            }}
          >
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
