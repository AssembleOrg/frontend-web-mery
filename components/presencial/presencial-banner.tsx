'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, CheckCircle2, Clock, Ban, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  hourLabel,
  formatPresencialDate,
  SIGNUP_STATUS_LABEL,
  type PresencialClassForStudent,
  type PresencialSignupMine,
} from '@/lib/presencial-api';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';

/**
 * Bloque "Clases presenciales" en mi-cuenta: muestra el estado de mi
 * inscripción de forma bien clara (pendiente / confirmada / cancelada) y las
 * próximas fechas abiertas para anotarse (máximo una a la vez).
 */
export function PresencialBanner() {
  const [upcoming, setUpcoming] = useState<PresencialClassForStudent[] | null>(null);
  const [mine, setMine] = useState<PresencialSignupMine[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelFor, setCancelFor] = useState<PresencialSignupMine | null>(null);
  const [signupFor, setSignupFor] = useState<PresencialClassForStudent | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, m] = await Promise.all([presencialApi.upcoming(), presencialApi.mine()]);
      setUpcoming(u);
      setMine(m);
    } catch {
      setUpcoming([]);
    }
  }, []);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('presencial:changed', onChanged);
    return () => window.removeEventListener('presencial:changed', onChanged);
  }, [load]);

  if (upcoming === null) return null;

  const active = mine.find((s) => s.status === 'PENDING' || s.status === 'CONFIRMED');
  // Avisos recientes de cancelación / sin lugar (para que no pase desapercibido).
  const recentBad = !active
    ? mine.find(
        (s) =>
          (s.status === 'CANCELLED' || s.status === 'REJECTED') &&
          Date.now() - new Date(s.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 &&
          new Date(s.class.startAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      )
    : undefined;

  if (upcoming.length === 0 && !active && !recentBad) return null;

  async function signup(c: PresencialClassForStudent) {
    setBusyId(c.id);
    try {
      await presencialApi.signup(c.id);
      toast.success('Te anotaste. Te confirmamos por email y acá mismo.');
      setSignupFor(null);
      window.dispatchEvent(new CustomEvent('presencial:changed'));
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(s: PresencialSignupMine) {
    try {
      await presencialApi.cancelSignup(s.id);
      toast.success('Inscripción cancelada');
      setCancelFor(null);
      window.dispatchEvent(new CustomEvent('presencial:changed'));
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const range = (c: { startHour: number; endHour: number }) =>
    `${hourLabel(c.startHour)} a ${hourLabel(c.endHour)} hs`;

  return (
    <div className='mb-6 rounded-2xl bg-[#1c1c1e] text-white shadow-sm overflow-hidden'>
      <div className='flex items-center gap-2.5 px-5 pt-4 pb-3'>
        <MapPin className='w-4 h-4 text-[#EBA2A8]' />
        <h3 className='text-[13px] font-semibold uppercase tracking-[0.14em] text-white/90'>
          Clases presenciales
        </h3>
      </div>

      {/* Mi inscripción activa: estado bien visible */}
      {active && (
        <div
          className={`mx-5 mb-4 rounded-xl px-4 py-3 ${
            active.status === 'CONFIRMED'
              ? 'bg-green-500/15 ring-1 ring-green-500/40'
              : 'bg-amber-500/10 ring-1 ring-amber-400/40'
          }`}
        >
          <p className='flex items-center gap-2 text-sm font-semibold'>
            {active.status === 'CONFIRMED' ? (
              <CheckCircle2 className='w-4 h-4 text-green-400' />
            ) : (
              <Clock className='w-4 h-4 text-amber-300' />
            )}
            {active.status === 'CONFIRMED'
              ? 'Tu clase presencial está confirmada'
              : 'Estás anotada · pendiente de confirmación'}
          </p>
          <p className='mt-1 text-sm text-white/85'>{active.class.title}</p>
          <p className='text-sm text-white/60 capitalize'>
            {formatPresencialDate(active.class.date)} · {range(active.class)}
          </p>
          <p className='mt-1.5 text-[11px] text-white/45'>
            {active.status === 'CONFIRMED'
              ? 'Cualquier cambio te lo avisamos por email y acá.'
              : 'La fecha es estimativa. Cuando la confirmemos te avisamos por email y acá.'}
          </p>
          {new Date(active.class.startAt).getTime() > Date.now() && (
            <button
              type='button'
              onClick={() => setCancelFor(active)}
              className='mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/60 hover:text-red-300 hover:border-red-400/40'
            >
              <Ban className='w-3.5 h-3.5' /> Cancelar inscripción
            </button>
          )}
        </div>
      )}

      {recentBad && (
        <div className='mx-5 mb-4 rounded-xl px-4 py-3 bg-red-500/10 ring-1 ring-red-400/40'>
          <p className='text-sm font-semibold flex items-center gap-2'>
            <Ban className='w-4 h-4 text-red-300' />
            {recentBad.status === 'REJECTED'
              ? 'No pudimos confirmar tu lugar'
              : 'Tu clase presencial se canceló'}
          </p>
          <p className='mt-1 text-sm text-white/70'>
            {recentBad.class.title} · {formatPresencialDate(recentBad.class.date)}
          </p>
          <p className='mt-1 text-[11px] text-white/45'>Podés anotarte a otra fecha acá abajo.</p>
        </div>
      )}

      {/* Próximas fechas */}
      {upcoming.length > 0 && (
        <div className='divide-y divide-white/10 border-t border-white/10'>
          {upcoming.map((c) => {
            const isMine = c.mySignup && (c.mySignup.status === 'PENDING' || c.mySignup.status === 'CONFIRMED');
            return (
              <div key={c.id} className='px-5 py-3.5 flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold leading-tight'>{c.title}</p>
                  <p className='text-xs text-white/60 capitalize'>
                    {formatPresencialDate(c.date)} · {range(c)}
                  </p>
                  {c.categories.length > 0 && (
                    <p className='text-[11px] text-white/40 truncate'>
                      {c.categories.map((x) => x.name).join(' · ')}
                    </p>
                  )}
                  {c.description && (
                    <p className='text-[11px] text-white/40 mt-0.5'>{c.description}</p>
                  )}
                </div>
                {isMine ? (
                  <span className='shrink-0 text-[11px] px-2 py-1 rounded-full bg-white/10 text-white/80'>
                    {c.mySignup!.status === 'CONFIRMED' ? 'Confirmada' : 'Anotada'}
                  </span>
                ) : (
                  <button
                    type='button'
                    disabled={!!active || busyId === c.id}
                    onClick={() => setSignupFor(c)}
                    title={active ? 'Ya tenés una inscripción activa' : undefined}
                    className='shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EBA2A8] text-[#2B2B2B] hover:bg-[#f9bbc4] disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    {busyId === c.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : 'Anotarme'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className='px-5 pb-4 pt-3 text-[11px] text-white/40'>
        Las fechas son estimativas y podés anotarte a una sola a la vez. Te confirmamos
        la clase por email y en tu cuenta.
      </p>

      {signupFor && (
        <ConfirmDialog
          title='¿Anotarte a esta clase presencial?'
          description={`${signupFor.title} · ${formatPresencialDate(signupFor.date)} · ${range(signupFor)}. La fecha es estimativa: te confirmamos por email y acá.`}
          confirmLabel='Sí, anotarme'
          onConfirm={() => signup(signupFor)}
          onClose={() => setSignupFor(null)}
        />
      )}
      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar tu inscripción?'
          description={`${cancelFor.class.title} · ${formatPresencialDate(cancelFor.class.date)}. Después podés anotarte a otra fecha.`}
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
