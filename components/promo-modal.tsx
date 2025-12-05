'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { DateTime } from 'luxon';
import {
  PROMO_CONFIG,
  getTimeUntilPromoChange,
  isPromoDisabled,
} from '@/lib/promo-config';

const SHOW_INTERVAL = PROMO_CONFIG.MODAL_SHOW_INTERVAL;

interface TimeLeft {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export default function PromoModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [isPromoActive, setIsPromoActive] = useState(false);

  useEffect(() => {
    // Solo mostrar en home (pathname debe ser '/' o '/es' o '/en')
    const isHome =
      pathname === '/' ||
      pathname === '/es' ||
      pathname === '/en' ||
      pathname?.match(/^\/[a-z]{2}$/);

    if (!isHome) {
      return;
    }

    // No mostrar en rutas de admin
    if (pathname?.includes('/admin')) {
      return;
    }

    // No mostrar si la promoción está desactivada
    if (isPromoDisabled()) {
      return;
    }

    // Verificar si debe mostrarse el modal
    const checkShouldShow = () => {
      const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
      const disableDate = PROMO_CONFIG.DISABLE_DATE;

      // No mostrar si está desactivada
      if (now >= disableDate) return false;

      const lastShown = localStorage.getItem('promo-modal-last-shown');

      if (!lastShown) {
        return true;
      }

      const timeSinceLastShown = now.toMillis() - parseInt(lastShown, 10);
      return timeSinceLastShown >= SHOW_INTERVAL;
    };

    if (checkShouldShow()) {
      // Esperar antes de mostrar el modal
      const timeout = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(
          'promo-modal-last-shown',
          DateTime.now()
            .setZone('America/Argentina/Buenos_Aires')
            .toMillis()
            .toString()
        );
      }, PROMO_CONFIG.MODAL_INITIAL_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
      const startDate = PROMO_CONFIG.START_DATE;
      const endDate = PROMO_CONFIG.END_DATE;

      // Determinar el target según la fecha actual
      const target = now < startDate ? startDate : endDate;
      const diff = target.diff(now, [
        'days',
        'hours',
        'minutes',
        'seconds',
        'milliseconds',
      ]);

      if (diff.toMillis() <= 0) {
        setIsPromoActive(now >= startDate && now <= endDate);
        setTimeLeft({
          days: 0,
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        return;
      }

      setIsPromoActive(now >= startDate && now <= endDate);

      // Calcular tiempo restante en formato DD:HH:MM:SS
      const days = Math.floor(diff.days);
      const hours = Math.floor(diff.hours % 24);
      const minutes = Math.floor(diff.minutes % 60);
      const seconds = Math.floor(diff.seconds % 60);

      setTimeLeft({
        days,
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCTA = () => {
    setIsOpen(false);
    router.push('/ofertas-especiales');
  };

  if (!isOpen) return null;

  const isCountdownZero =
    timeLeft.days === 0 &&
    timeLeft.hours === '00' &&
    timeLeft.minutes === '00' &&
    timeLeft.seconds === '00';

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/60 z-50'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
        <div
          className='rounded-2xl max-w-lg w-full p-8 relative pointer-events-auto overflow-hidden'
          style={{ backgroundColor: '#fbe8ea' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10'
            aria-label='Cerrar'
          >
            <X className='w-6 h-6' />
          </button>

          {/* Contenido */}
          <div className='text-center space-y-6 font-admin relative z-10'>
            {/* Badge de descuento */}
            <div className='inline-flex items-center justify-center'>
              <div className='bg-[#5f0001] text-white px-6 py-2 rounded-full text-sm font-bold tracking-wider'>
                ¡OFERTA ESPECIAL!
              </div>
            </div>

            {/* Título */}
            <div className='space-y-2'>
              <h2 className='text-4xl font-bold text-[#5f0001]'>
                {PROMO_CONFIG.TEXTS.modalTitle}
              </h2>
              <p className='text-xl font-semibold text-[var(--mg-dark)]'>
                {PROMO_CONFIG.TEXTS.modalSubtitle}
              </p>
              <p className='text-sm text-[var(--mg-gray)]'>
                {PROMO_CONFIG.TEXTS.modalDateRange}
              </p>
            </div>

            {/* Mensaje motivacional */}
            <div className='space-y-2'>
              <p className='text-base text-[var(--mg-dark)]'>
                Cerra el año con una oportunidad de llevar tu profesión a otro
                nivel.
              </p>
              <p className='text-sm text-[var(--mg-gray)]'>
                <strong className='font-bold text-[var(--mg-dark)]'>
                  Accesibles desde cualquier dispositivo
                </strong>
              </p>
              <p className='text-lg font-black text-[var(--mg-dark)]'>
                <span className='animated-underline-dark'>
                  Incluye Nanoblading & Camuflaje
                </span>
              </p>
            </div>

            {/* Contador */}
            <div className='py-6'>
              {isCountdownZero ? (
                <div className='space-y-3'>
                  <p className='text-lg font-medium text-gray-400'>
                    {PROMO_CONFIG.TEXTS.countdownEnded}
                  </p>
                  <div className='flex justify-center gap-2'>
                    {[
                      { value: 0, label: 'Días' },
                      { value: '00', label: 'Horas' },
                      { value: '00', label: 'Min' },
                      { value: '00', label: 'Seg' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className='flex flex-col items-center'
                      >
                        <div className='bg-gray-200 text-gray-400 rounded-lg px-3 py-2 min-w-[60px] font-mono text-2xl font-bold'>
                          {item.value}
                        </div>
                        <span className='text-xs text-gray-400 mt-1'>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-[var(--mg-dark)]'>
                    {isPromoActive
                      ? PROMO_CONFIG.TEXTS.countdownActive
                      : PROMO_CONFIG.TEXTS.countdownBeforeStart}
                  </p>
                  <div className='flex justify-center gap-2'>
                    {[
                      { value: timeLeft.days, label: 'Días' },
                      { value: timeLeft.hours, label: 'Horas' },
                      { value: timeLeft.minutes, label: 'Min' },
                      { value: timeLeft.seconds, label: 'Seg' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className='flex flex-col items-center'
                      >
                        <div
                          className='text-[#5f0001] rounded-lg px-3 py-2 min-w-[60px] font-mono text-2xl font-bold'
                          style={{
                            backgroundColor: '#fbe8ea',
                            boxShadow: 'none',
                          }}
                        >
                          {item.value}
                        </div>
                        <span className='text-xs text-[var(--mg-gray)] mt-1 font-medium'>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleCTA}
              className='w-full bg-[var(--mg-pink-cta)] hover:bg-[var(--mg-pink)] text-[var(--mg-dark)] font-bold py-4 px-8 rounded-xl transition-colors duration-200'
            >
              {PROMO_CONFIG.TEXTS.modalCTA}
            </button>

            {/* Descripción adicional */}
            <p className='text-xs text-[var(--mg-gray)]'>
              {PROMO_CONFIG.TEXTS.modalDescription}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
