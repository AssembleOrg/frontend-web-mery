'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PresencialClassForStudent } from '@/lib/presencial-api';

const TZ = 'America/Argentina/Buenos_Aires';
const MONTHS_AHEAD = 6;

export type DayStatus =
  | 'none'
  | 'tentative'
  | 'confirmed'
  | 'minePending'
  | 'mineConfirmed';

/** Estado visual del día: mi inscripción > confirmada > tentativa. */
export function dayStatusOf(list: PresencialClassForStudent[]): DayStatus {
  if (list.length === 0) return 'none';
  if (list.some((c) => c.mySignup?.status === 'CONFIRMED')) return 'mineConfirmed';
  if (list.some((c) => c.mySignup?.status === 'PENDING')) return 'minePending';
  if (list.some((c) => c.status === 'CONFIRMED')) return 'confirmed';
  return 'tentative';
}

/**
 * Los cuatro estados se diferencian por intensidad dentro de la paleta de
 * marca (rosa → bordó), no por matiz. Nada de verde/ámbar/rojo: el sistema de
 * alertas de la marca usa rosa claro de fondo y bordó de texto.
 *   tentativa      → contorno punteado, sin relleno (todavía no es firme)
 *   confirmada     → relleno rosa claro + contorno rosa
 *   mía pendiente  → relleno rosa marcario
 *   mía confirmada → relleno bordó
 */
const DAY_STYLE: Record<DayStatus, string> = {
  none: 'border-2 border-transparent bg-white hover:bg-[#FBE8EA]/60 text-[#2B2B2B]',
  tentative:
    'border-2 border-dashed border-[#EBA2A8]/70 bg-white hover:bg-[#FBE8EA]/60 text-[#545454]',
  confirmed:
    'border-2 border-[#EBA2A8] bg-[#FBE8EA] hover:bg-[#F7CBCB] text-[#660e1b]',
  minePending:
    'border-2 border-[#F9BBC4] bg-[#EBA2A8] hover:opacity-90 text-white',
  mineConfirmed:
    'border-2 border-[#F9BBC4] bg-[#8b1538] hover:opacity-90 text-white',
};

/** Días con mi inscripción: el número va en blanco sobre relleno lleno. */
const FILLED_STATUSES: DayStatus[] = ['minePending', 'mineConfirmed'];

/**
 * Calendario mensual para la alumna. Los días con clase se pintan según estado,
 * siempre dentro de la paleta de marca. Click → onSelectDay.
 */
export function StudentCalendar({
  classes,
  onSelectDay,
}: Readonly<{
  classes: PresencialClassForStudent[];
  onSelectDay: (dateKey: string, list: PresencialClassForStudent[]) => void;
}>) {
  const today = DateTime.now().setZone(TZ).startOf('day');
  const [cursor, setCursor] = useState(today.startOf('month'));
  const minMonth = today.startOf('month');
  const maxMonth = today.plus({ months: MONTHS_AHEAD }).startOf('month');

  const byDay = useMemo(() => {
    const m = new Map<string, PresencialClassForStudent[]>();
    for (const c of classes) {
      const arr = m.get(c.date) ?? [];
      arr.push(c);
      m.set(c.date, arr);
    }
    return m;
  }, [classes]);

  const weeks = useMemo(() => {
    const start = cursor.startOf('week');
    const end = cursor.endOf('month').endOf('week');
    const days: DateTime[] = [];
    for (let d = start; d <= end; d = d.plus({ days: 1 })) days.push(d);
    const out: DateTime[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [cursor]);

  const monthCount = (status: DayStatus) =>
    Array.from(byDay.entries()).filter(
      ([k, list]) => k.startsWith(cursor.toFormat('yyyy-LL')) && dayStatusOf(list) === status,
    ).length;

  return (
    <div className='rounded-2xl bg-white shadow-sm ring-1 ring-[#F9BBC4]/60 overflow-hidden'>
      {/* Header */}
      <div className='bg-white border-b border-[#F9BBC4]/60 px-4 sm:px-6 py-4 text-[#2B2B2B]'>
        <div className='flex items-center justify-between gap-2'>
          <button
            type='button'
            disabled={cursor <= minMonth}
            onClick={() => setCursor((c) => c.minus({ months: 1 }))}
            aria-label='Mes anterior'
            className='p-2 rounded-full text-[#8b1538] hover:bg-[#FBE8EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <div className='text-center'>
            <p className='text-[11px] uppercase tracking-[0.25em] text-[#8b1538]/70'>Presencialidad</p>
            <h2 className='text-xl sm:text-2xl font-bold capitalize leading-tight text-[#2B2B2B]'>
              {cursor.setLocale('es').toFormat('LLLL yyyy')}
            </h2>
          </div>
          <button
            type='button'
            disabled={cursor >= maxMonth}
            onClick={() => setCursor((c) => c.plus({ months: 1 }))}
            aria-label='Mes siguiente'
            className='p-2 rounded-full text-[#8b1538] hover:bg-[#FBE8EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
        <p className='mt-2 text-center text-xs text-[#2B2B2B]/55'>
          {monthCount('tentative') +
            monthCount('confirmed') +
            monthCount('minePending') +
            monthCount('mineConfirmed') ===
          0
            ? 'Sin fechas este mes'
            : 'Tocá un día pintado para ver las clases y anotarte'}
        </p>
      </div>

      {/* Grilla */}
      <div className='p-3 sm:p-5'>
        <div className='grid grid-cols-7 mb-2'>
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
            <div key={d} className='text-center text-[11px] font-bold tracking-wider text-[#8b1538]/70'>
              {d}
            </div>
          ))}
        </div>
        <div className='space-y-1.5 sm:space-y-2'>
          {weeks.map((week, wi) => (
            <div key={wi} className='grid grid-cols-7 gap-1.5 sm:gap-2'>
              {week.map((d) => {
                const key = d.toISODate()!;
                const inMonth = d.month === cursor.month;
                const list = byDay.get(key) ?? [];
                const status = inMonth ? dayStatusOf(list) : 'none';
                const isToday = key === today.toISODate();
                const isPast = d < today;
                const clickable = inMonth && list.length > 0;
                return (
                  <button
                    key={key}
                    type='button'
                    disabled={!clickable}
                    onClick={() => onSelectDay(key, list)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                      inMonth ? DAY_STYLE[status] : 'bg-transparent text-[#2B2B2B]/25'
                    } ${clickable ? 'cursor-pointer active:scale-95 shadow-sm' : 'cursor-default'} ${
                      isPast && inMonth && status === 'none' ? 'text-[#2B2B2B]/35' : ''
                    } ${isToday ? 'outline outline-2 outline-offset-2 outline-[#EBA2A8]' : ''}`}
                  >
                    <span
                      className={`text-sm sm:text-base font-semibold ${
                        FILLED_STATUSES.includes(status) ? 'text-white' : ''
                      }`}
                    >
                      {d.day}
                    </span>
                    {clickable && (
                      <span className='mt-0.5 flex gap-0.5'>
                        {list.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              FILLED_STATUSES.includes(status)
                                ? 'bg-[#F9BBC4]'
                                : c.status === 'CONFIRMED'
                                  ? 'bg-[#8b1538]'
                                  : 'bg-[#EBA2A8]'
                            }`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className='mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium'>
          <span className='inline-flex items-center gap-1.5 text-[#545454]'>
            <span className='w-3.5 h-3.5 rounded-md border-2 border-dashed border-[#EBA2A8]/70 bg-white' />{' '}
            Fecha tentativa
          </span>
          <span className='inline-flex items-center gap-1.5 text-[#660e1b]'>
            <span className='w-3.5 h-3.5 rounded-md border-2 border-[#EBA2A8] bg-[#FBE8EA]' />{' '}
            Confirmada
          </span>
          <span className='inline-flex items-center gap-1.5 text-[#8b1538]'>
            <span className='w-3.5 h-3.5 rounded-md bg-[#EBA2A8]' /> Me anoté
          </span>
          <span className='inline-flex items-center gap-1.5 text-[#8b1538]'>
            <span className='w-3.5 h-3.5 rounded-md bg-[#8b1538]' /> Mi lugar confirmado
          </span>
        </div>
      </div>
    </div>
  );
}
