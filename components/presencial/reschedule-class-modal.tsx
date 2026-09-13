'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  HOUR_OPTIONS,
  hourLabel,
  formatPresencialDate,
  type PresencialClassAdmin,
} from '@/lib/presencial-api';

/**
 * Mover una fecha conservando las inscriptas. Es lo que reemplaza a "cancelar y
 * volver a crear": las señas ya pagas se trasladan solas.
 */
export function RescheduleClassModal({
  klass,
  onClose,
  onDone,
}: Readonly<{
  klass: PresencialClassAdmin;
  onClose: () => void;
  onDone: () => void;
}>) {
  const [date, setDate] = useState(klass.date);
  const [startHour, setStartHour] = useState(klass.startHour);
  const [endHour, setEndHour] = useState(klass.endHour);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const today = new Date().toISOString().slice(0, 10);
  const max = new Date();
  max.setMonth(max.getMonth() + 6);
  const maxDate = max.toISOString().slice(0, 10);

  const unchanged =
    date === klass.date &&
    startHour === klass.startHour &&
    endHour === klass.endHour;

  async function save() {
    if (!date) return toast.error('Elegí una fecha');
    if (endHour <= startHour) {
      return toast.error('El fin debe ser posterior al inicio');
    }
    setSaving(true);
    try {
      const r = await presencialApi.adminRescheduleClass(klass.id, {
        date,
        startHour,
        endHour,
      });
      toast.success(
        r.notified > 0
          ? `Fecha movida · ${r.notified} alumna(s) avisadas`
          : 'Fecha movida',
      );
      window.dispatchEvent(new CustomEvent('presencial:changed'));
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button
        type='button'
        aria-label='Cerrar'
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
      />
      <div className='relative w-full sm:max-w-md bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]'>
        <div className='flex items-center justify-between px-5 py-4 bg-[#8b1538] text-white rounded-t-2xl shrink-0'>
          <h3 className='font-semibold flex items-center gap-2'>
            <CalendarClock className='w-4 h-4' /> Reprogramar clase
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
          <div className='rounded-xl bg-muted/40 px-3 py-2.5'>
            <p className='text-sm font-medium text-foreground'>{klass.title}</p>
            <p className='text-xs text-muted-foreground capitalize mt-0.5'>
              Ahora: {formatPresencialDate(klass.date)} ·{' '}
              {hourLabel(klass.startHour)} a {hourLabel(klass.endHour)} hs
            </p>
          </div>

          <div>
            <label className='block text-xs font-medium text-muted-foreground mb-1'>
              Nueva fecha
            </label>
            <input
              type='date'
              value={date}
              min={today}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
            />
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                Desde
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
              >
                {HOUR_OPTIONS.filter((h) => h <= 17).map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                Hasta
              </label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
              >
                {HOUR_OPTIONS.filter((h) => h >= 10).map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='rounded-xl bg-[#FBE8EA] px-3.5 py-3 text-[12px] leading-relaxed text-[#2B2B2B]/80'>
            Las {klass.counts.active} inscriptas conservan su lugar y su seña: no
            tienen que anotarse ni pagar de nuevo. La clase vuelve a quedar{' '}
            <strong>tentativa</strong> hasta que confirmes la fecha nueva, y a todas
            les llega el aviso por email y en la app.
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground'
          >
            Volver
          </button>
          <button
            type='button'
            onClick={() => void save()}
            disabled={saving || unchanged}
            className='px-4 py-2 text-sm font-semibold rounded-lg bg-[#8b1538] text-white hover:bg-[#660e1b] disabled:opacity-40 flex items-center gap-2'
          >
            {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : null}
            Mover la fecha
          </button>
        </div>
      </div>
    </div>
  );
}
