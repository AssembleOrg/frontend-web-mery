'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Copy, Check, ArrowUpRight, Calendar, Instagram } from 'lucide-react';

const STORAGE_KEY = 'abh-promo-2026-v2';
const OPEN_DELAY_MS = 800;

const CODE = 'ABHXMERYGARCIA';
const SHOP_URL = 'https://www.juleriaque.com.ar/s?q=anastasia';
const IG_URL =
  'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDc4MzI0Mzc3NjgxOTY3?story_media_id=3948588968534108469';

const IMAGE_SRC = '/form/anastasia.jpg';
const LOGO_SRC = '/form/mery_garcia_brow_artist_rosa_transparente.png';

export default function AbhPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el código igual queda visible en pantalla.
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-labelledby='abh-promo-title'
    >
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={handleClose}
        aria-hidden='true'
      />

      {/* max-h + overflow-y: en pantallas cortas la card scrollea por dentro
          en vez de desbordar arriba y abajo. */}
      <div className='relative z-[70] max-h-[calc(100dvh-2rem)] w-full max-w-[320px] overflow-y-auto overscroll-contain rounded-[20px] bg-[#1a1a1a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 animate-in zoom-in-95 duration-300 sm:max-w-[420px]'>
        {/* sticky, no absolute: la card scrollea y el cerrar tiene que quedar. */}
        <button
          onClick={handleClose}
          aria-label='Cerrar'
          className='sticky top-3 z-[80] ml-auto mr-3 -mb-8 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Sin overlay: la foto va limpia. Por eso el logo (blanco/rosa) baja
            al panel oscuro, que es donde tiene contraste. */}
        <div className='relative aspect-[16/10] w-full overflow-hidden sm:aspect-[4/3]'>
          <Image
            src={IMAGE_SRC}
            alt='Productos Anastasia Beverly Hills'
            fill
            priority
            sizes='(max-width: 640px) 320px, 420px'
            className='object-cover object-center'
          />
        </div>

        <div className='flex flex-col items-center gap-2.5 px-5 pb-5 pt-4 text-center sm:gap-3.5 sm:px-8 sm:pb-7 sm:pt-6'>
          <Image
            src={LOGO_SRC}
            alt='Mery García Brow Artist'
            width={260}
            height={60}
            className='h-auto w-[130px] sm:w-[160px]'
          />

          {/* Co-branding: la marca invitada en blanco, la casa en rosa. */}
          <span className='flex w-full items-center gap-2 text-[9px] font-medium uppercase tracking-[0.2em] sm:gap-3 sm:text-[10px] sm:tracking-[0.24em]'>
            <span className='h-px flex-1 bg-white/15' />
            <span className='text-white/85'>Anastasia</span>
            <span className='-mx-1 text-[#EBA2A8]/60'>×</span>
            <span className='text-[#EBA2A8]'>Mery García</span>
            <span className='h-px flex-1 bg-white/15' />
          </span>

          <h2
            id='abh-promo-title'
            className='text-xl font-bold leading-tight text-white sm:text-2xl'
          >
            <span className='text-[#EBA2A8]'>10% OFF</span> en toda la línea
          </h2>

          <p className='text-[13px] leading-relaxed text-white/70 sm:text-sm'>
            En todos los productos Anastasia Beverly Hills de la tienda online
            de Juleriaque.
          </p>

          <span className='inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-[#EBA2A8] ring-1 ring-white/10'>
            <Calendar className='h-3.5 w-3.5' />
            Hasta el 1 de septiembre
          </span>

          <button
            type='button'
            onClick={handleCopy}
            aria-label={`Copiar el código ${CODE}`}
            className='flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#EBA2A8]/40 bg-white/[0.06] px-3 py-2.5 transition-colors hover:border-[#EBA2A8]/70 hover:bg-white/[0.09] sm:gap-3 sm:px-4 sm:py-3'
          >
            <span className='text-base font-bold tracking-[0.04em] text-[#EBA2A8] sm:text-lg sm:tracking-[0.06em]'>
              {CODE}
            </span>
            <span className='flex shrink-0 items-center gap-1.5 text-xs font-semibold text-white/70 sm:text-sm'>
              {copied ? (
                <Check className='h-4 w-4' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </span>
          </button>

          {/*
            Abre en pestaña nueva y deja el modal abierto a propósito: si el
            visitante no copió el código antes de irse, al volver lo sigue
            teniendo a mano. Además lo copiamos al pasar a la tienda.
          */}
          <a
            href={SHOP_URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={handleCopy}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-[#EBA2A8] px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#F7CBCB] sm:py-3.5 sm:text-[15px]'
          >
            Ver productos
            <ArrowUpRight className='h-4 w-4' />
          </a>

          <span className='h-px w-full bg-white/10' />

          {/* También deja el modal abierto: el código sigue a mano al volver. */}
          <a
            href={IG_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex w-full items-center gap-2.5 rounded-2xl bg-white/[0.06] p-2.5 text-left ring-1 ring-white/10 transition hover:bg-white/[0.10] hover:ring-[#EBA2A8]/40 sm:gap-3 sm:p-3'
          >
            <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#EBA2A8] to-[#F7CBCB] sm:h-9 sm:w-9'>
              <Instagram className='h-4 w-4 text-[#1a1a1a]' />
            </span>
            <span className='flex-1 text-xs leading-snug text-white/80 sm:text-[13px]'>
              Conocé los productos{' '}
              <span className='font-semibold text-white'>FAV</span> de nuestra{' '}
              <span className='font-semibold text-[#EBA2A8]'>BrowBoss</span> y
              cómo combinarlos
            </span>
            <ArrowUpRight className='h-4 w-4 shrink-0 text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#EBA2A8]' />
          </a>

          <button
            onClick={handleClose}
            className='text-xs text-white/45 transition-colors hover:text-white/80'
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
