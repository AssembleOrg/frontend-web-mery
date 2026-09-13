'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { X, Clock, CheckCircle2, Hourglass, Ban, Loader2, Sparkles, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  hourLabel,
  formatDepositAmount,
  type PresencialClassForStudent,
} from '@/lib/presencial-api';
import { DepositModal } from './deposit-modal';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';

const TZ = 'America/Argentina/Buenos_Aires';

/** Popup con las clases de un día: estado con color, formaciones y CTA. */
export function DayClassesModal({
  dateKey,
  classes,
  hasActiveSignup,
  onClose,
  onChanged,
}: Readonly<{
  dateKey: string;
  classes: PresencialClassForStudent[];
  /** La alumna ya tiene una inscripción activa (en cualquier fecha). */
  hasActiveSignup: boolean;
  onClose: () => void;
  onChanged: () => void;
}>) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelFor, setCancelFor] = useState<PresencialClassForStudent | null>(null);
  const [depositFor, setDepositFor] = useState<PresencialClassForStudent | null>(null);

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

  const day = DateTime.fromISO(dateKey, { zone: TZ }).setLocale('es');

  async function cancel(c: PresencialClassForStudent) {
    if (!c.mySignup) return;
    setBusyId(c.id);
    try {
      await presencialApi.cancelSignup(c.mySignup.id);
      toast.success('Inscripción cancelada');
      setCancelFor(null);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const isMine = (c: PresencialClassForStudent) =>
    !!c.mySignup && (c.mySignup.status === 'PENDING' || c.mySignup.status === 'CONFIRMED');

  return (
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button type='button' aria-label='Cerrar' onClick={onClose} className='absolute inset-0 bg-[#2B2B2B]/50 backdrop-blur-sm' />
      <div className='relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden'>
        {/* Header con fecha grande */}
        <div className='bg-[#8b1538] text-white px-6 pt-6 pb-5 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className='absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
          <p className='text-[11px] uppercase tracking-[0.25em] text-white/75 capitalize'>
            {day.toFormat('cccc')}
          </p>
          <p className='text-5xl font-bold leading-none mt-1'>{day.day}</p>
          <p className='text-sm text-white/85 capitalize mt-1'>{day.toFormat('LLLL yyyy')}</p>
        </div>

        <div className='flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FBE8EA]/40'>
          {classes.map((c) => {
            const mine = isMine(c);
            const confirmedMine = mine && c.mySignup!.status === 'CONFIRMED';
            const paidDeposit = c.mySignup?.depositStatus === 'PAID';
            // Empezó a pagar y no terminó: se le ofrece retomar.
            const pendingDeposit = c.mySignup?.depositStatus === 'PENDING';
            // Escala de marca (rosa claro → rosa → bordó) para el estado de la
            // fecha; las clases en las que estoy anotada se distinguen por el
            // chip relleno, no por otro matiz.
            const tone = mine
              ? confirmedMine
                ? { band: 'bg-[#8b1538]', chip: 'bg-[#8b1538] text-white', label: 'Tu lugar está confirmado', Icon: CheckCircle2 }
                : { band: 'bg-[#8b1538]', chip: 'bg-[#EBA2A8] text-white', label: 'Anotada · pendiente de confirmación', Icon: Hourglass }
              : c.status === 'CONFIRMED'
                ? { band: 'bg-[#EBA2A8]', chip: 'bg-[#FBE8EA] text-[#660e1b]', label: 'Fecha confirmada', Icon: CheckCircle2 }
                : { band: 'bg-[#F7CBCB]', chip: 'bg-[#FBE8EA] text-[#545454]', label: 'Fecha tentativa', Icon: Sparkles };
            const Icon = tone.Icon;
            const disabled = !mine && hasActiveSignup;
            return (
              <div key={c.id} className='rounded-2xl bg-white shadow-sm ring-1 ring-[#F9BBC4]/40 overflow-hidden'>
                <div className={`h-1.5 ${tone.band}`} />
                <div className='p-4'>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${tone.chip}`}>
                    <Icon className='w-3.5 h-3.5' /> {tone.label}
                  </span>
                  <h3 className='mt-2.5 text-base font-bold text-[#2B2B2B] leading-snug'>{c.title}</h3>
                  <p className='mt-1 inline-flex items-center gap-1.5 text-sm text-[#2B2B2B]/70'>
                    <Clock className='w-4 h-4 text-[#8b1538]' />
                    {hourLabel(c.startHour)} a {hourLabel(c.endHour)} hs
                  </p>
                  {c.categories.length > 0 && (
                    <div className='mt-2.5 flex flex-wrap gap-1.5'>
                      {c.categories.map((x) => (
                        <span key={x.id} className='text-[11px] px-2 py-0.5 rounded-full bg-[#FBE8EA] text-[#8b1538] font-medium'>
                          {x.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {c.description && (
                    <p className='mt-2.5 text-xs text-[#2B2B2B]/60 leading-relaxed'>{c.description}</p>
                  )}

                  <div className='mt-4'>
                    {mine ? (
                      <>
                        {paidDeposit && (
                          <p className='mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8b1538]'>
                            <Wallet className='w-3.5 h-3.5' /> Seña pagada
                            {c.mySignup?.depositAmountARS
                              ? ` · ${formatDepositAmount(c.mySignup.depositAmountARS)}`
                              : ''}
                          </p>
                        )}
                        {pendingDeposit && (
                          <button
                            type='button'
                            onClick={() => setDepositFor(c)}
                            className='mb-2 w-full py-2.5 rounded-xl bg-[#8b1538] hover:bg-[#660e1b] text-white text-sm font-bold transition-colors'
                          >
                            Retomar el pago de la seña
                          </button>
                        )}
                        {new Date(c.startAt).getTime() > Date.now() && (
                          <button
                            type='button'
                            disabled={busyId === c.id}
                            onClick={() => setCancelFor(c)}
                            className='inline-flex items-center gap-1.5 text-xs font-medium text-[#2B2B2B]/60 hover:text-[#8b1538]'
                          >
                            <Ban className='w-3.5 h-3.5' /> Cancelar mi inscripción
                          </button>
                        )}
                      </>
                    ) : !c.price ? (
                      <p className='text-[11px] text-center text-[#2B2B2B]/50 leading-relaxed'>
                        Las reservas para esta fecha todavía no están abiertas.
                      </p>
                    ) : (
                      <>
                        <button
                          type='button'
                          disabled={disabled || busyId === c.id}
                          onClick={() => setDepositFor(c)}
                          className='w-full py-2.5 rounded-xl bg-[#8b1538] hover:bg-[#660e1b] text-white text-sm font-bold shadow-md shadow-[#8b1538]/25 disabled:bg-[#2B2B2B]/15 disabled:text-[#2B2B2B]/40 disabled:shadow-none transition-all active:scale-[0.99] flex items-center justify-center gap-2'
                        >
                          {busyId === c.id ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
                          Reservar mi lugar
                        </button>
                        {disabled && (
                          <p className='mt-1.5 text-[11px] text-center text-[#2B2B2B]/50'>
                            Ya tenés una inscripción activa. Cancelala para elegir otra fecha.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <p className='text-[11px] text-center text-[#2B2B2B]/50 px-2 pt-1'>
            Las fechas tentativas pueden cambiar. Te avisamos por email y en la app cuando se confirmen.
          </p>
        </div>
      </div>

      {depositFor && (
        <DepositModal
          klass={depositFor}
          dayLabel={day.toFormat("cccc d 'de' LLLL")}
          onClose={() => setDepositFor(null)}
          onStarted={onChanged}
        />
      )}
      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar tu inscripción?'
          description={`${cancelFor.title} · ${day.toFormat("cccc d 'de' LLLL")}. Después podés anotarte a otra fecha.`}
          confirmLabel='Sí, cancelar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => cancel(cancelFor)}
          onClose={() => setCancelFor(null)}
        />
      )}
    </div>
  );
}
