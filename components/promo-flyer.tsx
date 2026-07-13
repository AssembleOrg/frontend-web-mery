'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const RESERVA_URL = 'https://merygarcia.com.ar/f/masterclass-autostyling';

export default function PromoFlyer() {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-label='Master Class de Autostyling'
    >
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={() => setIsOpen(false)}
        aria-hidden='true'
      />

      {/* Contenedor del flyer */}
      <div className='relative z-[70] w-full max-w-[92vw] md:max-w-[880px] animate-in zoom-in-95 duration-300'>
        {/* Botón cerrar (flota en la esquina del flyer) */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2B2B2B] shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        {/* MOBILE: flyer vertical (9:16). Oculto en >= md. */}
        <div className='relative block md:hidden aspect-[940/1640] max-h-[82vh] mx-auto overflow-hidden rounded-2xl shadow-2xl bg-black'>
          <Image
            src='/form/flyer-mobile.png'
            alt='Invitación a la Master Class de Autostyling de Mery García'
            fill
            priority
            sizes='92vw'
            className='object-contain'
          />
          {/*
            Botón INVISIBLE sobre "Reservá tu clase aquí…" (versión mobile, centrado abajo).
            Coordenadas en % respecto al flyer 9:16. CALIBRAR con `bg-red-500/30` temporal.
          */}
          <a
            href={RESERVA_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Reservá tu clase en la Master Class de Autostyling'
            className='absolute rounded-md'
            style={{ top: '82%', left: '25%', width: '50%', height: '8%' }}
          />
        </div>

        {/* DESKTOP: flyer horizontal (16:9). Oculto en < md. */}
        <div className='relative hidden md:block aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-2xl bg-black'>
          <Image
            src='/form/flyer-evento.jpg'
            alt='Invitación a la Master Class de Autostyling de Mery García'
            fill
            priority
            sizes='880px'
            className='object-contain'
          />
          {/*
            Botón INVISIBLE sobre "Reservá tu clase aquí…" (versión desktop, inferior-derecha).
            Coordenadas en % respecto al flyer 16:9. CALIBRAR con `bg-red-500/30` temporal.
          */}
          <a
            href={RESERVA_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Reservá tu clase en la Master Class de Autostyling'
            className='absolute rounded-md'
            style={{ top: '65%', left: '66%', width: '30%', height: '15%' }}
          />
        </div>
      </div>
    </div>
  );
}
