'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowLeft, CheckCircle2, Hourglass, MapPin, CalendarDays, Ban } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentCalendar } from '@/components/presencial/student-calendar';
import { DayClassesModal } from '@/components/presencial/day-classes-modal';
import {
  presencialApi,
  hourLabel,
  type PresencialClassForStudent,
  type PresencialSignupMine,
} from '@/lib/presencial-api';

const TZ = 'America/Argentina/Buenos_Aires';

export default function PresencialidadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(`/${locale}/mi-cuenta`);
  };

  const [classes, setClasses] = useState<PresencialClassForStudent[]>([]);
  const [mine, setMine] = useState<PresencialSignupMine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ dateKey: string; list: PresencialClassForStudent[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, m] = await Promise.all([presencialApi.upcoming(), presencialApi.mine()]);
      setClasses(u);
      setMine(m);
      // Si el modal está abierto, refrescar su contenido con los datos nuevos.
      setSelected((s) => (s ? { ...s, list: u.filter((c) => c.date === s.dateKey) } : s));
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('presencial:changed', onChanged);
    return () => window.removeEventListener('presencial:changed', onChanged);
  }, [load]);

  const active = mine.find((s) => s.status === 'PENDING' || s.status === 'CONFIRMED');
  const recentBad = !active
    ? mine.find(
        (s) =>
          (s.status === 'CANCELLED' || s.status === 'REJECTED') &&
          new Date(s.class.startAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      )
    : undefined;

  const fmtDay = (dateStr: string) =>
    DateTime.fromISO(dateStr, { zone: TZ }).setLocale('es').toFormat("cccc d 'de' LLLL");

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gradient-to-b from-[#FBE8EA] via-white to-white'>
        <Navigation />

        <main className='max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16'>
          {/* Volver */}
          <button
            type='button'
            onClick={goBack}
            className='mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#8b1538] hover:text-[#660e1b] transition-colors'
          >
            <ArrowLeft className='w-4 h-4' /> Volver
          </button>

          {/* Título */}
          <div className='mb-6'>
            <p className='inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#8b1538]'>
              <MapPin className='w-3.5 h-3.5' /> Clases presenciales
            </p>
            <h1 className='mt-1 text-3xl sm:text-4xl font-primary font-bold text-[#2B2B2B]'>
              Presencialidad
            </h1>
            <p className='mt-2 text-sm text-[#2B2B2B]/65 max-w-xl'>
              Elegí la fecha que prefieras en el calendario. Podés anotarte a una sola a la vez;
              cuando confirmemos la clase te avisamos por email y en la app.
            </p>
          </div>

          {/* Estado de mi inscripción */}
          {active && (
            <div
              className={`mb-6 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm ${
                active.status === 'CONFIRMED'
                  ? 'bg-[#DCFCE7] ring-1 ring-[#22C55E]/50'
                  : 'bg-[#FEF3C7] ring-1 ring-[#F59E0B]/50'
              }`}
            >
              <span
                className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${
                  active.status === 'CONFIRMED' ? 'bg-[#16A34A] text-white' : 'bg-[#F59E0B] text-white'
                }`}
              >
                {active.status === 'CONFIRMED' ? <CheckCircle2 className='w-6 h-6' /> : <Hourglass className='w-6 h-6' />}
              </span>
              <div className='min-w-0'>
                <p className={`text-base font-bold ${active.status === 'CONFIRMED' ? 'text-[#166534]' : 'text-[#92400E]'}`}>
                  {active.status === 'CONFIRMED' ? 'Tu clase está confirmada' : 'Estás anotada · pendiente de confirmación'}
                </p>
                <p className='text-sm text-[#2B2B2B]/80 mt-0.5'>{active.class.title}</p>
                <p className='text-sm text-[#2B2B2B]/60 capitalize'>
                  {fmtDay(active.class.date)} · {hourLabel(active.class.startHour)} a {hourLabel(active.class.endHour)} hs
                </p>
                <button
                  type='button'
                  onClick={() =>
                    setSelected({
                      dateKey: active.class.date,
                      list: classes.filter((c) => c.date === active.class.date),
                    })
                  }
                  className='mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b1538] hover:underline'
                >
                  <CalendarDays className='w-3.5 h-3.5' /> Ver en el calendario
                </button>
              </div>
            </div>
          )}

          {recentBad && (
            <div className='mb-6 rounded-2xl p-4 sm:p-5 flex items-start gap-3 bg-[#FEE2E2] ring-1 ring-red-300/60'>
              <span className='shrink-0 w-11 h-11 rounded-2xl bg-red-500 text-white flex items-center justify-center'>
                <Ban className='w-6 h-6' />
              </span>
              <div>
                <p className='text-base font-bold text-red-800'>
                  {recentBad.status === 'REJECTED' ? 'No pudimos confirmar tu lugar' : 'Esa fecha se canceló'}
                </p>
                <p className='text-sm text-[#2B2B2B]/70 mt-0.5'>
                  {recentBad.class.title} · <span className='capitalize'>{fmtDay(recentBad.class.date)}</span>
                </p>
                <p className='text-xs text-[#2B2B2B]/55 mt-1'>Elegí otra fecha en el calendario.</p>
              </div>
            </div>
          )}

          {/* Calendario */}
          {loading ? (
            <div className='rounded-3xl bg-white/70 ring-1 ring-[#F9BBC4]/40 h-[420px] animate-pulse' />
          ) : (
            <StudentCalendar
              classes={classes}
              onSelectDay={(dateKey, list) => setSelected({ dateKey, list })}
            />
          )}
        </main>

        <Footer />
      </div>

      {selected && selected.list.length > 0 && (
        <DayClassesModal
          dateKey={selected.dateKey}
          classes={selected.list}
          hasActiveSignup={!!active}
          onClose={() => setSelected(null)}
          onChanged={() => {
            window.dispatchEvent(new CustomEvent('presencial:changed'));
            void load();
          }}
        />
      )}
    </ProtectedRoute>
  );
}
