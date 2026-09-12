'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PresencialClassForStudent } from '@/lib/presencial-api';

const TZ = 'America/Argentina/Buenos_Aires';
const MONTHS_AHEAD = 6;

export type DayStatus = 'none' | 'tentative' | 'confirmed' | 'mine';

/** Estado visual del día: mío > confirmada > tentativa. */
export function dayStatusOf(list: PresencialClassForStudent[]): DayStatus {
  if (list.length === 0) return 'none';
  if (
    list.some(
      (c) => c.mySignup && (c.mySignup.status === 'PENDING' || c.mySignup.status === 'CONFIRMED'),
    )
  ) {
    return 'mine';
  }
  if (list.some((c) => c.status === 'CONFIRMED')) return 'confirmed';
  return 'tentative';
}

const DAY_STYLE: Record<DayStatus, string> = {
  none: 'bg-white hover:bg-[#FBE8EA]/60 text-[#2B2B2B]',
  tentative:
    'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] ring-2 ring-inset ring-[#F59E0B]/50',
  confirmed:
    'bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] ring-2 ring-inset ring-[#22C55E]/60',
  mine: 'bg-[#8b1538] hover:bg-[#660e1b] text-white ring-2 ring-inset ring-[#F9BBC4]',
};

/**
 * Calendario mensual para la alumna. Los días con clase se pintan según estado
 * (tentativa ámbar · confirmada verde · la mía bordó). Click → onSelectDay.
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
    <div className='rounded-3xl bg-white shadow-[0_10px_40px_-15px_rgba(102,14,27,0.25)] ring-1 ring-[#F9BBC4]/50 overflow-hidden'>
      {/* Header degradé */}
      <div className='bg-gradient-to-r from-[#660e1b] via-[#8b1538] to-[#EBA2A8] px-4 sm:px-6 py-4 text-white'>
        <div className='flex items-center justify-between gap-2'>
          <button
            type='button'
            disabled={cursor <= minMonth}
            onClick={() => setCursor((c) => c.minus({ months: 1 }))}
            aria-label='Mes anterior'
            className='p-2 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <div className='text-center'>
            <p className='text-[11px] uppercase tracking-[0.25em] text-white/70'>Presencialidad</p>
            <h2 className='text-xl sm:text-2xl font-bold capitalize leading-tight'>
              {cursor.setLocale('es').toFormat('LLLL yyyy')}
            </h2>
          </div>
          <button
            type='button'
            disabled={cursor >= maxMonth}
            onClick={() => setCursor((c) => c.plus({ months: 1 }))}
            aria-label='Mes siguiente'
            className='p-2 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>
        <p className='mt-2 text-center text-xs text-white/80'>
          {monthCount('tentative') + monthCount('confirmed') + monthCount('mine') === 0
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
                    <span className={`text-sm sm:text-base font-semibold ${status === 'mine' ? 'text-white' : ''}`}>
                      {d.day}
                    </span>
                    {clickable && (
                      <span className='mt-0.5 flex gap-0.5'>
                        {list.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === 'mine'
                                ? 'bg-[#F9BBC4]'
                                : c.status === 'CONFIRMED'
                                  ? 'bg-[#16A34A]'
                                  : 'bg-[#F59E0B]'
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
          <span className='inline-flex items-center gap-1.5 text-[#92400E]'>
            <span className='w-3.5 h-3.5 rounded-md bg-[#FEF3C7] ring-2 ring-inset ring-[#F59E0B]/50' /> Fecha tentativa
          </span>
          <span className='inline-flex items-center gap-1.5 text-[#166534]'>
            <span className='w-3.5 h-3.5 rounded-md bg-[#DCFCE7] ring-2 ring-inset ring-[#22C55E]/60' /> Confirmada
          </span>
          <span className='inline-flex items-center gap-1.5 text-[#8b1538]'>
            <span className='w-3.5 h-3.5 rounded-md bg-[#8b1538]' /> Mi inscripción
          </span>
        </div>
      </div>
    </div>
  );
}
