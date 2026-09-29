'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const DIN = { fontFamily: 'var(--font-din-condensed)' } as const;

// Collage escalonado al costado (2 cols x 3 filas) en todos los tamaños.
const COLLAGE = [
  { src: '/Img-home/handcraft.webp', area: 'col-start-1 row-start-1 row-span-2', pos: 'object-center' },
  { src: '/Img-home/home-5.webp', area: 'col-start-2 row-start-1', pos: 'object-center' },
  { src: '/Img-home/nanoblading.webp', area: 'col-start-2 row-start-2 row-span-2', pos: 'object-[30%_center]' },
  { src: '/Img-home/Lip-blush-1.webp', area: 'col-start-1 row-start-3', pos: 'object-center' },
];

const TIPS = [
  'Repasá los videos prácticos del curso.',
  'Al realizar tus prácticas, considerá las líneas A y B (paralelas) y las proporciones de caja y densidad del capítulo "Estructura".',
  'Presentá tus prácticas tal cual indica el tutorial "Cómo presento y cómo preparo mis prácticas".',
  'Traé 3 diseños de cejas que SÍ te gusten y 3 que NO, que no sean trabajos de M.G.',
];

/**
 * Popup previo a reservar la mentoría (mismo lenguaje visual que el flyer de la
 * landing). Solo deja continuar tras confirmar la lectura.
 */
export function MentorshipTipsModal({
  onAccept,
  onClose,
}: Readonly<{ onAccept: () => void; onClose: () => void }>) {
  const [read, setRead] = useState(false);

  // Bloquear scroll de fondo, esconder el bot externo y cerrar con Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('hide-rag-widget');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-labelledby='mentorship-tips-title'
    >
      <style>{`
        @keyframes tips-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tips-rise { opacity: 0; animation: tips-rise 0.6s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .tips-rise { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      <div className='relative z-[70] w-full max-w-[700px] animate-in zoom-in-95 duration-300'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        <div className='relative flex max-h-[88dvh] overflow-hidden rounded-[20px] bg-black shadow-2xl'>
          {/* Collage */}
          <div className='grid w-[36%] flex-shrink-0 grid-cols-2 grid-rows-3 gap-1 p-1 sm:w-[40%] sm:gap-1.5 sm:p-1.5'>
            {COLLAGE.map((img, i) => (
              <div
                key={img.src}
                className={`tips-rise relative overflow-hidden rounded-[8px] sm:rounded-[10px] ${img.area}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <Image
                  src={img.src}
                  alt=''
                  fill
                  sizes='(min-width: 640px) 140px, 18vw'
                  className={`object-cover grayscale ${img.pos}`}
                />
              </div>
            ))}
          </div>

          {/* Marco fino blanco sobre todo el popup (collage incluido) */}
          <div
            aria-hidden
            className='tips-rise pointer-events-none absolute inset-2.5 z-30 border border-white/45 sm:inset-4'
            style={{ animationDelay: '0.4s' }}
          />

          {/* Flag rosa "Antes de reservar" — sale del borde derecho, como el flyer */}
          <span
            className='tips-rise absolute right-0 top-6 z-40 whitespace-nowrap bg-[#F9BBC4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black sm:top-9sm:px-4 sm:py-1.5 sm:text-[12px]'
            style={{ ...DIN, animationDelay: '0.3s' }}
          >
            Antes de reservar
          </span>

          {/* Contenido */}
          <div className='relative z-40 flex min-w-0 flex-1 flex-col overflow-y-auto pb-6 pl-4 pr-5 pt-12 text-white sm:px-10 sm:pb-10 sm:pt-16'>
            <h2
              id='mentorship-tips-title'
              className='tips-rise text-[24px] font-semibold uppercase leading-[0.9] sm:text-[38px]'
              style={{ ...DIN, animationDelay: '0.22s' }}
            >
              Prepárate para
              <br />
              tu mentoría
            </h2>

            <span
              aria-hidden
              className='tips-rise mt-4 block h-px w-10 bg-[#F9BBC4] sm:mt-5 sm:w-12'
              style={{ animationDelay: '0.36s' }}
            />

            <ul
              className='tips-rise mt-4 space-y-1.5 text-[12px] leading-snug text-white/90 sm:mt-6 sm:space-y-2.5 sm:text-[14px]'
              style={{ animationDelay: '0.44s' }}
            >
              {TIPS.map((tip) => (
                <li key={tip} className='flex gap-2'>
                  <span aria-hidden className='mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[#F9BBC4]' />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <label
              className='tips-rise mt-5 flex cursor-pointer items-start gap-2 border-t border-white/15 pt-4 text-[11px] text-white/75 transition-colors hover:text-white sm:mt-7 sm:gap-2.5 sm:pt-5 sm:text-[13px]'
              style={{ animationDelay: '0.58s' }}
            >
              <input
                type='checkbox'
                checked={read}
                onChange={(e) => setRead(e.target.checked)}
                className='mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#F9BBC4]'
              />
              Leí y entendí las recomendaciones.
            </label>

            <button
              type='button'
              onClick={onAccept}
              disabled={!read}
              className='tips-rise mt-4 self-start bg-white px-5 py-2.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#F9BBC4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BBC4] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 sm:mt-5 sm:px-7 sm:py-3 sm:text-[14px] sm:tracking-[0.2em]'
              style={{ ...DIN, animationDelay: '0.72s' }}
            >
              Aceptar y elegir horario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
