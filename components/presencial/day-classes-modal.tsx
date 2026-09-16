'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { X, Clock, CheckCircle2, Hourglass, Ban, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  hourLabel,
  type PresencialClassForStudent,
} from '@/lib/presencial-api';
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
  const [signupFor, setSignupFor] = useState<PresencialClassForStudent | null>(null);
  const [cancelFor, setCancelFor] = useState<PresencialClassForStudent | null>(null);
  const [closing, setClosing] = useState(false);

  // Cierre con animación de salida: marca closing, espera la anim y recién desmonta.
  // Fallback por si prefers-reduced-motion desactiva la animación (no dispara onAnimationEnd).
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 260);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const day = DateTime.fromISO(dateKey, { zone: TZ }).setLocale('es');

  async function signup(c: PresencialClassForStudent) {
    setBusyId(c.id);
    try {
      await presencialApi.signup(c.id);
      toast.success('¡Anotada! Te confirmamos por email y en la app.');
      setSignupFor(null);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

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
      <button
        type='button'
        aria-label='Cerrar'
        onClick={requestClose}
        className={`absolute inset-0 bg-[#1c1c1e]/60 backdrop-blur-sm animate-overlay-in ${closing ? 'is-closing' : ''}`}
      />
      <div
        onAnimationEnd={() => closing && onClose()}
        className={`relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-sheet-in sm:animate-pop-in ${closing ? 'is-closing' : ''}`}
      >
        {/* Header dark premium con fecha grande */}
        <div className='bg-[#1c1c1e] text-white px-6 pt-7 pb-6 shrink-0'>
          <button
            type='button'
            onClick={requestClose}
            aria-label='Cerrar'
            className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95'
          >
            <X className='w-5 h-5' />
          </button>
          <p className='text-[11px] uppercase tracking-[0.28em] text-white/55 capitalize'>
            {day.toFormat('cccc')}
          </p>
          <p className='text-6xl font-primary-medium leading-none mt-1.5'>{day.day}</p>
          <p className='text-sm text-white/50 capitalize mt-1.5'>{day.toFormat('LLLL yyyy')}</p>
        </div>

        <div className='flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FAFAFA] pb-[calc(1rem+env(safe-area-inset-bottom))]'>
          {classes.map((c) => {
            const mine = isMine(c);
            const confirmedMine = mine && c.mySignup!.status === 'CONFIRMED';
            const tone = mine
              ? confirmedMine
                ? { band: 'bg-[#16A34A]', chip: 'bg-[#DCFCE7] text-[#166534]', label: 'Tu lugar está confirmado', Icon: CheckCircle2 }
                : { band: 'bg-[#8b1538]', chip: 'bg-[#FBE8EA] text-[#8b1538]', label: 'Anotada · pendiente de confirmación', Icon: Hourglass }
              : c.status === 'CONFIRMED'
                ? { band: 'bg-[#22C55E]', chip: 'bg-[#DCFCE7] text-[#166534]', label: 'Fecha confirmada', Icon: CheckCircle2 }
                : { band: 'bg-[#F59E0B]', chip: 'bg-[#FEF3C7] text-[#78350F]', label: 'Fecha tentativa', Icon: Sparkles };
            const Icon = tone.Icon;
            const disabled = !mine && hasActiveSignup;
            return (
              <div key={c.id} className='rounded-2xl bg-white shadow-md shadow-black/[0.04] ring-1 ring-black/[0.06] overflow-hidden'>
                <div className={`h-1.5 ${tone.band}`} />
                <div className='p-4'>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${tone.chip}`}>
                    <Icon className='w-3.5 h-3.5' /> {tone.label}
                  </span>
                  <h3 className='mt-3 text-base font-primary-medium text-[#2B2B2B] leading-snug'>{c.title}</h3>
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
                      new Date(c.startAt).getTime() > Date.now() && (
                        <button
                          type='button'
                          disabled={busyId === c.id}
                          onClick={() => setCancelFor(c)}
                          className='inline-flex items-center gap-1.5 text-xs font-medium text-[#2B2B2B]/60 hover:text-red-600'
                        >
                          <Ban className='w-3.5 h-3.5' /> Cancelar mi inscripción
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          type='button'
                          disabled={disabled || busyId === c.id}
                          onClick={() => setSignupFor(c)}
                          className='w-full py-2.5 rounded-xl bg-[#8b1538] hover:bg-[#660e1b] text-white text-sm font-bold shadow-md shadow-[#8b1538]/25 disabled:bg-[#2B2B2B]/15 disabled:text-[#2B2B2B]/40 disabled:shadow-none transition-all active:scale-[0.99] flex items-center justify-center gap-2'
                        >
                          {busyId === c.id ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
                          Anotarme a esta fecha
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

      {signupFor && (
        <ConfirmDialog
          title='¿Anotarte a esta clase presencial?'
          description={`${signupFor.title} · ${day.toFormat("cccc d 'de' LLLL")} · ${hourLabel(signupFor.startHour)} a ${hourLabel(signupFor.endHour)} hs. Te confirmamos por email y en la app.`}
          confirmLabel='Sí, anotarme'
          onConfirm={() => signup(signupFor)}
          onClose={() => setSignupFor(null)}
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
