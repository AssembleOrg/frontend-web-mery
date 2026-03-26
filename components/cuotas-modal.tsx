'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const SHOW_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
const STORAGE_KEY = 'cuotas-modal-last-shown';

export default function CuotasModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [waitingForPromo, setWaitingForPromo] = useState(false);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promoOpenedRef = useRef(false);

  const shouldShow = useCallback(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    return !lastShown || now - parseInt(lastShown, 10) >= SHOW_INTERVAL;
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    const isAllowedRoute =
      pathname === '/' ||
      pathname?.match(/^\/[a-z]{2}$/) ||
      pathname?.includes('/formaciones');

    if (!isAllowedRoute || pathname?.includes('/admin')) return;

    if (!shouldShow()) return;

    // Esperar al cierre del PromoModal antes de abrir este modal.
    setWaitingForPromo(true);
    promoOpenedRef.current = false;

    safetyTimeoutRef.current = setTimeout(() => {
      setWaitingForPromo(false);
      // Solo abrir por timeout si el promo nunca llegó a abrirse.
      if (!promoOpenedRef.current && shouldShow()) openModal();
    }, 5000);

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [pathname, shouldShow, openModal]);

  // Escuchar apertura/cierre del PromoModal para secuenciar correctamente.
  useEffect(() => {
    if (!waitingForPromo) return;

    const handlePromoOpened = () => {
      promoOpenedRef.current = true;
    };

    const handlePromoClosed = () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      setWaitingForPromo(false);
      if (shouldShow()) {
        setTimeout(openModal, 500);
      }
    };

    window.addEventListener('promo-modal-opened', handlePromoOpened);
    window.addEventListener('promo-modal-closed', handlePromoClosed);
    return () => {
      window.removeEventListener('promo-modal-opened', handlePromoOpened);
      window.removeEventListener('promo-modal-closed', handlePromoClosed);
    };
  }, [waitingForPromo, shouldShow, openModal]);

  const handleClose = () => setIsOpen(false);

  const handleCTA = () => {
    setIsOpen(false);
    router.push('/formaciones');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/60 z-[60]'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none'>
        <div
          className='rounded-2xl max-w-[320px] w-full p-8 relative pointer-events-auto'
          style={{ backgroundColor: '#fbe8ea' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 text-[#545454] hover:text-[#2b2b2b] transition-colors'
            aria-label='Cerrar'
          >
            <X className='w-5 h-5' />
          </button>

          {/* Contenido */}
          <div className='text-center space-y-5 font-admin'>
            {/* Encabezado marca */}
            <div className='space-y-0.5'>
              <p className='text-xs tracking-[0.3em] text-[#2b2b2b] uppercase'>
                Mery Garcia
              </p>
              <p className='text-[10px] tracking-widest text-[#545454] italic uppercase'>
                Exclusive
              </p>
            </div>

            {/* Separador */}
            <div className='w-8 h-px bg-[#eba2a8] mx-auto' />

            {/* Mes */}
            <p className='text-[10px] tracking-[0.25em] text-[#545454] uppercase'>
              Marzo 2026
            </p>

            {/* Mensaje principal */}
            <div className='space-y-0'>
              <h2 className='text-5xl font-bold text-[#2b2b2b] leading-none'>
                3 CUOTAS
              </h2>
              <h2 className='text-5xl font-bold text-[#2b2b2b] leading-none'>
                SIN INTERÉS
              </h2>
            </div>

            {/* Subtítulo */}
            <p className='text-sm font-semibold tracking-wide text-[#2b2b2b] uppercase'>
              En todas las formaciones
            </p>

            {/* Nota */}
            <p className='text-[10px] text-[#545454] italic'>
              Válido con tarjeta de crédito<br />a través de MercadoPago.
            </p>

            {/* Botones */}
            <div className='flex gap-3 pt-1'>
              <button
                onClick={handleCTA}
                className='flex-1 bg-[#2b2b2b] text-white text-xs font-bold tracking-widest uppercase py-3 px-4 rounded transition-colors hover:bg-[#1a1a1a]'
              >
                Ver más
              </button>
              <button
                onClick={handleClose}
                className='flex-1 border border-[#2b2b2b] text-[#2b2b2b] text-xs font-bold tracking-widest uppercase py-3 px-4 rounded transition-colors hover:bg-[#2b2b2b]/5'
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
