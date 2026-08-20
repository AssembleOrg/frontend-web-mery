'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CalendarClock,
  Plus,
  Trash2,
  Loader2,
  Power,
  Video,
} from 'lucide-react';
import {
  mentorshipApi,
  WEEKDAYS,
  minutesToHHMM,
  type MentorshipAvailability,
  type AdminMentorship,
} from '@/lib/mentorship-api';

function hhmmToMin(v: string): number {
  const [h, m] = v.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function AdminMentoriasPage() {
  const [avail, setAvail] = useState<MentorshipAvailability[]>([]);
  const [bookings, setBookings] = useState<AdminMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('SCHEDULED');

  // Form nueva franja
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        mentorshipApi.adminAvailability(),
        mentorshipApi.adminCalendar({
          status: statusFilter || undefined,
        }),
      ]);
      setAvail(a);
      setBookings(b);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addSlot() {
    const startMin = hhmmToMin(start);
    const endMin = hhmmToMin(end);
    if (endMin <= startMin) {
      toast.error('El fin debe ser posterior al inicio');
      return;
    }
    setSaving(true);
    try {
      await mentorshipApi.adminCreateAvailability({ weekday, startMin, endMin });
      toast.success('Franja agregada');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(a: MentorshipAvailability) {
    try {
      await mentorshipApi.adminUpdateAvailability(a.id, { isActive: !a.isActive });
      setAvail((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function removeSlot(id: string) {
    if (!confirm('¿Eliminar esta franja?')) return;
    try {
      await mentorshipApi.adminDeleteAvailability(id);
      setAvail((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, AdminMentorship[]>();
    for (const b of bookings) {
      const key = new Date(b.scheduledStart).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [bookings]);

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <h1 className='text-xl font-bold text-foreground flex items-center gap-2 mb-6'>
        <CalendarClock className='w-6 h-6 text-[#eba2a8]' />
        Mentorías
      </h1>

      {/* Disponibilidad */}
      <section className='mb-8'>
        <h2 className='text-sm font-bold text-foreground mb-3'>
          Disponibilidad semanal
        </h2>
        <div className='rounded-xl border border-border bg-white dark:bg-card p-4'>
          <div className='flex flex-wrap items-end gap-2 mb-4'>
            <div>
              <label className='block text-[11px] text-muted-foreground mb-1'>Día</label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className='px-3 py-2 text-sm rounded-lg border border-border bg-background'
              >
                {WEEKDAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-[11px] text-muted-foreground mb-1'>Desde</label>
              <input
                type='time'
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className='px-3 py-2 text-sm rounded-lg border border-border bg-background'
              />
            </div>
            <div>
              <label className='block text-[11px] text-muted-foreground mb-1'>Hasta</label>
              <input
                type='time'
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className='px-3 py-2 text-sm rounded-lg border border-border bg-background'
              />
            </div>
            <button
              type='button'
              onClick={() => void addSlot()}
              disabled={saving}
              className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-[#f9bbc4] text-white hover:bg-[#eba2a8] disabled:opacity-50'
            >
              {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4' />}
              Agregar
            </button>
          </div>

          {avail.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Sin franjas configuradas.</p>
          ) : (
            <div className='space-y-1.5'>
              {avail.map((a) => (
                <div
                  key={a.id}
                  className='flex items-center gap-3 text-sm py-1.5 border-b border-border/50 last:border-0'
                >
                  <span className={`font-medium ${a.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {WEEKDAYS[a.weekday]} {minutesToHHMM(a.startMin)}–{minutesToHHMM(a.endMin)}
                  </span>
                  <div className='ml-auto flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={() => void toggle(a)}
                      title={a.isActive ? 'Desactivar' : 'Activar'}
                      className={`p-1.5 rounded-md hover:bg-muted ${a.isActive ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      <Power className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => void removeSlot(a.id)}
                      className='p-1.5 rounded-md hover:bg-red-50 text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendario de mentorías */}
      <section>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-sm font-bold text-foreground'>Mentorías</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-1.5 text-sm rounded-lg border border-border bg-background'
          >
            <option value=''>Todas</option>
            <option value='SCHEDULED'>Agendadas</option>
            <option value='COMPLETED'>Cumplidas</option>
            <option value='CANCELLED'>Canceladas</option>
          </select>
        </div>

        {loading ? (
          <div className='py-10 flex justify-center'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : grouped.length === 0 ? (
          <p className='text-center text-sm text-muted-foreground py-10'>
            No hay mentorías para el filtro elegido.
          </p>
        ) : (
          <div className='space-y-4'>
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className='text-xs font-semibold text-muted-foreground capitalize mb-1.5'>
                  {day}
                </p>
                <div className='space-y-1.5'>
                  {items.map((b) => {
                    const time = new Date(b.scheduledStart).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Argentina/Buenos_Aires',
                    });
                    const name =
                      [b.user.firstName, b.user.lastName].filter(Boolean).join(' ') ||
                      b.user.email;
                    return (
                      <div
                        key={b.id}
                        className='flex items-center gap-3 rounded-lg border border-border bg-white dark:bg-card px-3 py-2 text-sm'
                      >
                        <span className='font-mono font-semibold text-[#660e1b] dark:text-[#f9bbc4] shrink-0'>
                          {time}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <div className='font-medium text-foreground truncate'>{name}</div>
                          <div className='text-xs text-muted-foreground truncate'>
                            {b.category.name} · {b.user.email}
                          </div>
                        </div>
                        {b.meetLink && (
                          <a
                            href={b.meetLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1.5 rounded-md hover:bg-muted text-[#eba2a8]'
                            title='Videollamada'
                          >
                            <Video className='w-4 h-4' />
                          </a>
                        )}
                        <StatusBadge status={b.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };
  const label: Record<string, string> = {
    SCHEDULED: 'Agendada',
    COMPLETED: 'Cumplida',
    CANCELLED: 'Cancelada',
  };
  return (
    <span className={`text-[10px] rounded-full px-1.5 py-0.5 shrink-0 ${map[status] ?? ''}`}>
      {label[status] ?? status}
    </span>
  );
}
