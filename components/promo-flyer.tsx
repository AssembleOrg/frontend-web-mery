'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const RESERVA_URL = 'https://eventos.juleriaque.com.ar/evento/601';

export default function PromoFlyer() {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-label='Masterclass Anastasia Beverly Hills por Mery García en Juleriaque'
    >
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={() => setIsOpen(false)}
        aria-hidden='true'
      />

      {/* Contenedor del flyer */}
      <div className='relative z-[70] w-full max-w-[92vw] md:max-w-[460px] animate-in zoom-in-95 duration-300'>
        {/* Botón cerrar (flota en la esquina del flyer) */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2B2B2B] shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        {/* Flyer vertical (4:5). Misma imagen en mobile y desktop. */}
        <div className='relative aspect-[4/5] max-h-[85vh] mx-auto overflow-hidden rounded-2xl shadow-2xl bg-black'>
          <Image
            src='/form/juleriaque-mobile.jpg'
            alt='Masterclass Anastasia Beverly Hills por Mery García en Juleriaque. Viernes 24 de julio, 16.30 y 18.30 hs, Av. Cabildo 1985, CABA'
            fill
            priority
            sizes='(min-width: 768px) 460px, 92vw'
            className='object-contain'
          />
          {/*
            Botón INVISIBLE sobre "REGISTRATE" (inferior-izquierda).
            Coordenadas en % respecto al flyer 4:5. CALIBRAR con `bg-red-500/30` temporal.
          */}
          <a
            href={RESERVA_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Registrate en la Masterclass de Juleriaque'
            className='absolute rounded-md'
            style={{ top: '89.5%', left: '5%', width: '25%', height: '4.5%' }}
          />
        </div>
      </div>
    </div>
  );
}
