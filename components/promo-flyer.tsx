'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const STORAGE_KEY = 'formaciones-40off-2026';
const OPEN_DELAY_MS = 800;
const FORMACIONES_URL = '/formaciones';

export default function PromoFlyer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setIsOpen(true);
      }
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-label='40% OFF en todas las formaciones, tiempo limitado del 1 al 5 de septiembre'
      style={{ fontFamily: 'var(--font-din-condensed)' }}
    >
      {/* Animaciones del flyer */}
      <style>{`
        @keyframes flyer-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flyer-pop {
          0%   { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          70%  { opacity: 1; transform: scale(1.12) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes flyer-draw {
          from { stroke-dashoffset: 120; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes flyer-sway {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(2px, 2px); }
        }
        .flyer-rise { opacity: 0; animation: flyer-rise 0.6s cubic-bezier(.22,1,.36,1) both; }
        .flyer-face { opacity: 0; animation: flyer-pop 0.7s cubic-bezier(.34,1.56,.64,1) 0.36s both; }
        .flyer-arrow path {
          stroke-dasharray: 120;
          animation: flyer-draw 0.7s ease-out 0.64s both;
        }
        .flyer-arrow { animation: flyer-sway 3.2s ease-in-out 1.6s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .flyer-rise, .flyer-face { animation: none !important; opacity: 1 !important; }
          .flyer-arrow, .flyer-arrow path { animation: none !important; }
          .flyer-arrow path { stroke-dashoffset: 0 !important; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={handleClose}
        aria-hidden='true'
      />

      {/* Contenedor del flyer */}
      <div className='relative z-[70] w-full max-w-[92vw] md:max-w-[500px] lg:max-w-[540px] animate-in zoom-in-95 duration-300'>
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2B2B2B] shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        {/* Flyer vertical 4:5 — imagen a la izquierda, contenido a la derecha */}
        <div
          className='relative flex aspect-[4/5] max-h-[85dvh] overflow-hidden rounded-[20px] bg-[#545454] shadow-2xl'
          style={{ containerType: 'inline-size' }}
        >
          {/* Columna de imagen */}
          <div className='relative h-full w-[42%] flex-shrink-0 overflow-hidden'>
            <Image
              src='/mirando-frente-flyer.jpg'
              alt=''
              fill
              priority
              sizes='(min-width: 768px) 185px, 40vw'
              className='object-cover'
            />
          </div>

          {/* Marco fino que ocupa TODO el flyer (foto incluida) */}
          <div
            aria-hidden
            className='flyer-rise pointer-events-none absolute z-30 border border-white/55'
            style={{
              animationDelay: '0.15s',
              inset: 'clamp(0.7rem, 3cqw, 1.25rem)',
            }}
          />

          {/* Columna de contenido */}
          <div
            className='relative z-10 flex flex-1 flex-col items-center justify-between text-center text-white'
            style={{ padding: 'clamp(1.5rem, 6cqw, 2.75rem) clamp(1.1rem, 5cqw, 2rem)' }}
          >
            {/* Flag rosa "Tiempo limitado" — entra desde el borde derecho del flyer */}
            <span
              className='flyer-rise absolute right-0 z-40 whitespace-nowrap bg-[#F9BBC4] font-semibold uppercase text-[#2B2B2B]'
              style={{
                animationDelay: '0.5s',
                top: '62%',
                fontSize: 'clamp(8px, 2.6cqw, 11px)',
                letterSpacing: 'clamp(0.06em, 0.5cqw, 0.14em)',
                paddingBlock: 'clamp(0.25rem, 1cqw, 0.4rem)',
                paddingInline: 'clamp(0.5rem, 2cqw, 0.9rem)',
              }}
            >
              Tiempo limitado
            </span>

            {/* Centro: 40% OFF + barra + fecha */}
            <div className='flex flex-1 flex-col items-center justify-center'>
              {/* Titular */}
              <div className='flyer-rise relative' style={{ animationDelay: '0.22s' }}>
                <div className='flex flex-col items-center font-semibold leading-[0.85] text-white'>
                  <span style={{ fontSize: 'clamp(38px, 15cqw, 62px)' }}>40%</span>
                  <span className='uppercase' style={{ fontSize: 'clamp(38px, 15cqw, 62px)' }}>
                    Off
                  </span>
                </div>
              </div>

              {/* Barra sólida blanca — label */}
              <span
                className='flyer-rise mt-5 block w-full whitespace-nowrap bg-white text-center font-medium uppercase text-[#545454]'
                style={{
                  animationDelay: '0.42s',
                  fontSize: 'clamp(10px, 3.6cqw, 15px)',
                  letterSpacing: 'clamp(0.04em, 0.6cqw, 0.12em)',
                  paddingBlock: 'clamp(0.45rem, 1.8cqw, 0.7rem)',
                  paddingInline: 'clamp(0.4rem, 2cqw, 1rem)',
                }}
              >
                En todas las formaciones
              </span>

              {/* Fecha */}
              <p
                className='flyer-rise mt-4 font-semibold uppercase tracking-[0.3em] text-white'
                style={{ animationDelay: '0.58s', fontSize: 'clamp(12px, 3.8cqw, 15px)' }}
              >
                Del 1/9 al 5/9
              </p>
            </div>

            {/* CTA con flecha */}
            <div className='relative flex w-full flex-col items-center'>
              <span
                className='absolute -scale-x-100 text-[#F9BBC4]'
                style={{ top: 'clamp(-2.75rem, -9cqw, -2rem)', right: 'clamp(0.75rem, 6cqw, 2rem)' }}
              >
                <svg
                  aria-hidden
                  width='38'
                  height='44'
                  viewBox='0 0 44 50'
                  fill='none'
                  className='flyer-arrow block h-auto w-[clamp(28px,9cqw,44px)]'
                >
                  <path
                    d='M10 4C9 20 16 36 34 43'
                    stroke='currentColor'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                  />
                  <path
                    d='M27 44l7-1-2-7'
                    stroke='currentColor'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>

              <a
                href={FORMACIONES_URL}
                className='flyer-rise font-semibold uppercase text-white underline-offset-[6px] transition-colors hover:text-[#F9BBC4] hover:underline focus:outline-none'
                style={{
                  animationDelay: '0.72s',
                  fontSize: 'clamp(11px, 3.4cqw, 14px)',
                  letterSpacing: 'clamp(0.12em, 0.9cqw, 0.32em)',
                }}
              >
                Ver formaciones
              </a>

              {/* Logo abajo */}
              <div
                className='flyer-rise relative mt-5 opacity-80'
                style={{
                  animationDelay: '0.8s',
                  width: 'clamp(90px, 28cqw, 140px)',
                  height: 'clamp(15px, 4.5cqw, 22px)',
                }}
              >
                <Image
                  src='/formacion/mery-garcia-formaciones.svg'
                  alt=''
                  fill
                  className='object-contain [filter:brightness(0)_invert(1)]'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
