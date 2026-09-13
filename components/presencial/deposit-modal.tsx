'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Loader2, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  formatDepositAmount,
  hourLabel,
  type PresencialClassForStudent,
  type PresencialDepositQuote,
} from '@/lib/presencial-api';

/**
 * Popup de reserva: monto de la seña + disclaimer que hay que aceptar ANTES de
 * ir a pagar. El backend rechaza el pago si no se aceptó, así que el checkbox
 * no es decorativo: es el mismo requisito, mostrado.
 */
export function DepositModal({
  klass,
  dayLabel,
  onClose,
  onStarted,
}: Readonly<{
  klass: PresencialClassForStudent;
  dayLabel: string;
  onClose: () => void;
  onStarted: () => void;
}>) {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<PresencialDepositQuote | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showAcceptError, setShowAcceptError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const info = await presencialApi.depositInfo(klass.id);
      setQuote(info.deposit);
      setDisclaimer(info.disclaimer);
      setLoadError(null);
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [klass.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const goToPayment = async () => {
    if (!accepted) {
      setShowAcceptError(true);
      return;
    }
    setStarting(true);
    try {
      const res = await presencialApi.startDeposit(klass.id);
      onStarted();
      // Mercado Pago se abre en la misma pestaña: al volver, back_urls trae de
      // nuevo a /presencialidad y el estado se recarga solo.
      window.location.href = res.initPoint;
    } catch (e) {
      toast.error((e as Error).message);
      setStarting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button
        type='button'
        aria-label='Cerrar'
        onClick={onClose}
        className='absolute inset-0 bg-[#2B2B2B]/50 backdrop-blur-sm'
      />
      <div className='relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden'>
        <div className='bg-[#8b1538] text-white px-6 pt-6 pb-5 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className='absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
          <p className='text-[11px] uppercase tracking-[0.25em] text-white/75'>
            Reservar mi lugar
          </p>
          <h2 className='text-xl font-bold leading-tight mt-1'>{klass.title}</h2>
          <p className='text-sm text-white/85 capitalize mt-1'>
            {dayLabel} · {hourLabel(klass.startHour)} a {hourLabel(klass.endHour)} hs
          </p>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-5 space-y-4'>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin text-[#8b1538]' />
            </div>
          ) : loadError ? (
            <p className='text-sm text-[#8b1538] text-center py-6'>{loadError}</p>
          ) : !quote ? (
            <p className='text-sm text-[#2B2B2B]/70 text-center py-6 leading-relaxed'>
              Esta fecha todavía no tiene seña definida. Escribinos y coordinamos.
            </p>
          ) : (
            <>
              <div className='rounded-2xl bg-[#FBE8EA] px-4 py-4 text-center'>
                <p className='text-[11px] uppercase tracking-[0.2em] text-[#8b1538]/70'>
                  Seña
                </p>
                <p className='text-3xl font-bold text-[#8b1538] mt-0.5'>
                  {formatDepositAmount(quote.amountARS)}
                </p>
                {quote.amountUSD != null && (
                  <p className='text-[11px] text-[#2B2B2B]/55 mt-1'>
                    USD {quote.amountUSD.toLocaleString('en-US')}
                    {quote.rate ? ` · dólar $${Math.round(quote.rate).toLocaleString('es-AR')}` : ''}
                  </p>
                )}
              </div>

              <div className='rounded-2xl border border-[#EBA2A8] px-4 py-3.5'>
                <p className='flex items-center gap-2 text-sm font-semibold text-[#8b1538]'>
                  <CalendarClock className='w-4 h-4 shrink-0' />
                  Antes de continuar
                </p>
                <p className='mt-2 text-[13px] leading-relaxed text-[#2B2B2B]/75'>
                  {disclaimer}
                </p>
              </div>

              <label className='flex items-start gap-2.5 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    if (e.target.checked) setShowAcceptError(false);
                  }}
                  className='mt-0.5 w-4 h-4 shrink-0 accent-[#8b1538]'
                />
                <span className='text-[13px] leading-relaxed text-[#2B2B2B]/80'>
                  Leí y acepto las condiciones de la reserva.
                </span>
              </label>
              {showAcceptError && (
                <p className='flex items-center gap-1.5 text-xs text-[#8b1538]'>
                  <AlertCircle className='w-3.5 h-3.5 shrink-0' />
                  Tenés que aceptar las condiciones para continuar.
                </p>
              )}

              <button
                type='button'
                onClick={() => void goToPayment()}
                disabled={starting}
                className='w-full py-3 rounded-xl bg-[#8b1538] hover:bg-[#660e1b] text-white text-sm font-bold shadow-md shadow-[#8b1538]/25 disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-2'
              >
                {starting ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
                Pagar la seña
              </button>

              <p className='flex items-start gap-1.5 text-[11px] leading-relaxed text-[#2B2B2B]/50'>
                <ShieldCheck className='w-3.5 h-3.5 shrink-0 mt-px text-[#8b1538]' />
                Te llevamos a Mercado Pago para completar el pago. Al terminar volvés
                acá y tu reserva queda registrada.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
