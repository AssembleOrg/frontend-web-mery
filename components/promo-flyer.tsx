'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const STORAGE_KEY = 'flyer-jornada-2026-10-27';
const OPEN_DELAY_MS = 800;
// Se apaga solo al terminar la jornada (27/10, 13 hs de Buenos Aires).
const EXPIRES_AT = new Date('2026-10-27T13:00:00-03:00').getTime();

export default function PromoFlyer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (Date.now() > EXPIRES_AT) return;
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
      aria-label='Jornada de concientización sobre el cáncer de mama, 27 de octubre de 8 a 13 hs'
    >
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={handleClose}
        aria-hidden='true'
      />

      {/* Contenedor del flyer */}
      <div className='relative z-[70] w-full max-w-[min(92vw,85dvh)] md:max-w-[min(540px,85dvh)] animate-in zoom-in-95 duration-300'>
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2B2B2B] shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        <Image
          src='/Img-home/flyermery-jornada.webp'
          alt='Mery García — Jornada de concientización sobre el cáncer de mama. 27 de octubre, 8 a 13 hs, Aula Magna del Hospital Materno Infantil de Tigre. Participación especial en epítesis junto a la doctora Mariel Sarria.'
          width={1080}
          height={1080}
          priority
          sizes='(min-width: 768px) 540px, 92vw'
          className='h-auto w-full rounded-[20px] shadow-2xl'
        />
      </div>
    </div>
  );
}
