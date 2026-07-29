'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Copy, Check, ArrowUpRight, Calendar } from 'lucide-react';

const STORAGE_KEY = 'abh-promo-2026';
const OPEN_DELAY_MS = 800;

const CODE = 'ABHXMERYGARCIA';
const SHOP_URL = 'https://www.juleriaque.com.ar/s?q=anastasia';

// Foto de producto ABH, compartida con las landings de formularios.
const IMAGE_SRC = '/form/aver1.jpg';

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
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={handleClose}
        aria-hidden='true'
      />

      <div className='relative z-[70] w-full max-w-[92vw] sm:max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300'>
        <button
          onClick={handleClose}
          aria-label='Cerrar'
          className='absolute top-3 right-3 z-[80] flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-4 w-4' />
        </button>

        <div className='relative h-[190px] w-full overflow-hidden bg-[#fbe8ea]'>
          <Image
            src={IMAGE_SRC}
            alt='Productos Anastasia Beverly Hills'
            fill
            sizes='(min-width: 640px) 420px, 92vw'
            priority
            className='object-cover'
          />
          <span className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#660e1b] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.14em] text-[#fbe8ea] whitespace-nowrap'>
            ANASTASIA BEVERLY HILLS
          </span>
        </div>

        <div className='flex flex-col items-center gap-3.5 px-8 py-7 text-center'>
          <h2
            id='abh-promo-title'
            className='text-2xl font-bold leading-tight text-[#660e1b]'
          >
            10% OFF en toda la línea
          </h2>

          <p className='text-sm leading-relaxed text-[#6b6660]'>
            En todos los productos Anastasia Beverly Hills de la tienda online
            de Juleriaque.
          </p>

          <span className='inline-flex items-center gap-1.5 rounded-full bg-[#fbe8ea] px-3 py-1.5 text-xs font-semibold text-[#660e1b]'>
            <Calendar className='h-3.5 w-3.5' />
            Hasta el 1 de septiembre
          </span>

          <button
            type='button'
            onClick={handleCopy}
            aria-label={`Copiar el código ${CODE}`}
            className='flex w-full items-center justify-between gap-3 rounded-[10px] bg-[#f7eaec] px-4 py-3 transition-colors hover:bg-[#f2dee1]'
          >
            <span className='text-lg font-bold tracking-wide text-[#660e1b]'>
              {CODE}
            </span>
            <span className='flex items-center gap-1.5 text-sm font-semibold text-[#660e1b]'>
              {copied ? (
                <Check className='h-4 w-4' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </span>
          </button>

          <a
            href={SHOP_URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={handleClose}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-[#660e1b] px-5 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90'
          >
            Ver productos
            <ArrowUpRight className='h-4 w-4 text-[#f9bbc4]' />
          </a>

          <button
            onClick={handleClose}
            className='text-xs text-[#8a837e] transition-colors hover:text-[#2b2b2b]'
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
