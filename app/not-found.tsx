'use client';

import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4'>
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
          Página No Encontrada
        </h2>

        {/* Mensaje */}
        <p
          className='text-lg mb-8'
          style={{
            fontFamily: 'var(--font-secondary), sans-serif',
            color: 'var(--mg-gray)',
          }}
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Botón CTA */}
        <Link
          href='/es'
          className='inline-block px-8 py-3 rounded text-white font-bold transition-all hover:opacity-90'
          style={{
            backgroundColor: 'var(--mg-pink)',
          }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
