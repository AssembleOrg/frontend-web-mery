'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import NextLink from 'next/link';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { isMentorship3x2Active } from '@/lib/mentorship-promo';
import { PROMO_CONFIG, isPromoActive } from '@/lib/promo-config';
import { useAuthStore } from '@/stores/auth-store';
import { MentorshipPurchaseModal } from '@/components/mentorship/mentorship-purchase-modal';

const STORAGE_KEY = 'flyer-mentorias-2026-11';
const OPEN_DELAY_MS = 800;
const DIN = { fontFamily: 'var(--font-din-condensed)' } as const;
const PRESENCIAL_WA = `https://wa.me/5491153336627?text=${encodeURIComponent(
  'Hola! Quiero consultar por la presencialidad 2027 (one to one o grupal).',
)}`;

// Mismo collage que el popup "Prepárate para tu mentoría".
const COLLAGE = [
  { src: '/IMAGEN3.webp', area: 'sm:col-start-1 sm:row-start-1 sm:row-span-2', pos: 'object-left-bottom' },
  { src: '/IMAGEN1.webp', area: 'sm:col-start-2 sm:row-start-1', pos: 'object-center' },
  { src: '/IMAGEN2.webp', area: 'sm:col-start-2 sm:row-start-2', pos: 'object-[35%_center]' },
];

const ITEMS = [
  'Tu mentoría FREE ya está habilitada: reservala desde tu cuenta.',
  '3x2 para sumar encuentros: llevá 3 mentorías y pagá 2, hasta agotar disponibilidad.',
  'Presencialidad 2027 abierta, one to one o grupal.',
];

const LINK =
  'underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-[#F9BBC4]';

/**
 * Aviso a las alumnas: mentoría FREE habilitada + promo 3x2 + presencialidad
 * 2027. Se apaga sola cuando termina el 3x2.
 */
export default function PromoFlyer() {
  const [isOpen, setIsOpen] = useState(false);
  const [purchase, setPurchase] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const locale = useLocale();

  useEffect(() => {
    if (!isMentorship3x2Active()) return;
    const show = () => {
      if (!sessionStorage.getItem(STORAGE_KEY)) setIsOpen(true);
    };
    // Con la promo de formaciones activa, su popup (cuenta regresiva) sale
    // primero y este espera a que lo cierren: uno después del otro.
    let promoModalOpen = false;
    let due = false;
    let afterClose: ReturnType<typeof setTimeout> | undefined;
    const onOpened = () => {
      promoModalOpen = true;
    };
    const onClosed = () => {
      promoModalOpen = false;
      if (due) afterClose = setTimeout(show, OPEN_DELAY_MS);
    };
    window.addEventListener('promo-modal-opened', onOpened);
    window.addEventListener('promo-modal-closed', onClosed);
    const delay = isPromoActive() ? PROMO_CONFIG.MODAL_INITIAL_DELAY + 500 : OPEN_DELAY_MS;
    const timer = setTimeout(() => {
      due = true;
      if (!promoModalOpen) show();
    }, delay);
    return () => {
      clearTimeout(timer);
      clearTimeout(afterClose);
      window.removeEventListener('promo-modal-opened', onOpened);
      window.removeEventListener('promo-modal-closed', onClosed);
    };
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

  // El 3x2 vive en el modal de compra (catálogo completo, sin filtrar por curso).
  if (purchase) return <MentorshipPurchaseModal onClose={() => setPurchase(false)} />;
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-labelledby='promo-mentorias-title'
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

      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={handleClose} aria-hidden='true' />

      <div className='relative z-[70] w-full max-w-[700px] animate-in zoom-in-95 duration-300'>
        <button
          type='button'
          onClick={handleClose}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        <div className='relative flex max-h-[88dvh] overflow-hidden rounded-[20px] bg-black shadow-2xl'>
          {/* Collage */}
          <div className='grid w-[32%] flex-shrink-0 grid-cols-1 grid-rows-3 gap-1 p-1 sm:w-[40%] sm:grid-cols-2 sm:grid-rows-2 sm:gap-1.5 sm:p-1.5'>
            {COLLAGE.map((img, i) => (
              <div
                key={img.src}
                className={`tips-rise relative overflow-hidden rounded-[8px] sm:rounded-[10px] ${img.area}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <Image src={img.src} alt='' fill sizes='(min-width: 640px) 140px, 32vw' className={`object-cover grayscale ${img.pos}`} />
              </div>
            ))}
          </div>

          {/* Marco fino blanco */}
          <div
            aria-hidden
            className='tips-rise pointer-events-none absolute inset-2.5 z-30 border border-white/45 sm:inset-4'
            style={{ animationDelay: '0.4s' }}
          />

          {/* Flag rosa */}
          <span
            className='tips-rise absolute right-0 top-6 z-40 whitespace-nowrap bg-[#F9BBC4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black sm:top-9 sm:px-4 sm:py-1.5 sm:text-[12px]'
            style={{ ...DIN, animationDelay: '0.3s' }}
          >
            Alumnas
          </span>

          {/* Contenido */}
          <div className='relative z-40 flex min-w-0 flex-1 flex-col pb-6 pl-4 pr-5 pt-12 text-white sm:px-10 sm:pb-10 sm:pt-16'>
            <h2
              id='promo-mentorias-title'
              className='tips-rise text-[24px] font-semibold uppercase leading-[0.9] sm:text-[38px]'
              style={{ ...DIN, animationDelay: '0.22s' }}
            >
              Agendá tu
              <br />
              mentoría free
            </h2>

            <span aria-hidden className='tips-rise mt-4 block h-px w-10 bg-[#F9BBC4] sm:mt-5 sm:w-12' style={{ animationDelay: '0.36s' }} />

            <ul
              className='tips-rise mt-4 space-y-1.5 text-[12px] leading-snug text-white/90 sm:mt-6 sm:space-y-2.5 sm:text-[14px]'
              style={{ animationDelay: '0.44s' }}
            >
              {ITEMS.map((item) => (
                <li key={item} className='flex gap-2'>
                  <span aria-hidden className='mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[#F9BBC4]' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div
              className='tips-rise mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/15 pt-4 text-[11px] text-white/75 sm:mt-7 sm:pt-5 sm:text-[13px]'
              style={{ animationDelay: '0.58s' }}
            >
              {isAuthenticated ? (
                <button
                  type='button'
                  onClick={() => {
                    handleClose();
                    setPurchase(true);
                  }}
                  className={LINK}
                >
                  Sumar 3x2
                </button>
              ) : (
                <NextLink href={`/${locale}/login`} onClick={handleClose} className={LINK}>
                  Sumar 3x2
                </NextLink>
              )}
              <a href={PRESENCIAL_WA} target='_blank' rel='noopener noreferrer' onClick={handleClose} className={LINK}>
                Presencialidad 2027
              </a>
            </div>

            <Link
              href='/mi-cuenta'
              onClick={handleClose}
              className='tips-rise mt-4 self-start bg-white px-5 py-2.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#F9BBC4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BBC4] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:mt-5 sm:px-7 sm:py-3 sm:text-[14px] sm:tracking-[0.2em]'
              style={{ ...DIN, animationDelay: '0.72s' }}
            >
              Agendar mi mentoría
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
