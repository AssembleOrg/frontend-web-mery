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
  Ban,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import {
  mentorshipApi,
  WEEKDAYS,
  minutesToHHMM,
  type MentorshipAvailability,
  type AdminMentorship,
  type MentorshipSlot,
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

  // Reprogramación admin
  const [rescheduleFor, setRescheduleFor] = useState<AdminMentorship | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function cancelBooking(b: AdminMentorship) {
    if (!confirm(`¿Cancelar la mentoría de ${b.user.email}? Se libera el cupo y se borra el evento de Google.`)) return;
    setBusyId(b.id);
    try {
      await mentorshipApi.adminCancel(b.id);
      toast.success('Mentoría cancelada');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

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
                        {b.status === 'SCHEDULED' && (
                          <div className='flex items-center gap-1 shrink-0'>
                            <button
                              type='button'
                              disabled={busyId === b.id}
                              onClick={() => setRescheduleFor(b)}
                              title='Reprogramar'
                              className='p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-40'
                            >
                              <RefreshCw className='w-4 h-4' />
                            </button>
                            <button
                              type='button'
                              disabled={busyId === b.id}
                              onClick={() => void cancelBooking(b)}
                              title='Cancelar'
                              className='p-1.5 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-40'
                            >
                              {busyId === b.id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Ban className='w-4 h-4' />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {rescheduleFor && (
        <AdminRescheduleModal
          booking={rescheduleFor}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function AdminRescheduleModal({
  booking,
  onClose,
  onDone,
}: Readonly<{
  booking: AdminMentorship;
  onClose: () => void;
  onDone: () => void;
}>) {
  const [slots, setSlots] = useState<MentorshipSlot[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    mentorshipApi
      .adminSlots()
      .then((s) => setSlots(s.filter((x) => x.available)))
      .catch(() => setSlots([]));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, MentorshipSlot[]>();
    for (const s of slots ?? []) {
      const key = new Date(s.start).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [slots]);

  async function confirm() {
    if (!selected) {
      toast.error('Elegí un horario');
      return;
    }
    setSaving(true);
    try {
      await mentorshipApi.adminReschedule(booking.id, selected);
      toast.success('Mentoría reprogramada');
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const studentName =
    [booking.user.firstName, booking.user.lastName].filter(Boolean).join(' ') ||
    booking.user.email;

  return (
    <div className='fixed inset-0 z-[70] flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Cerrar'
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
      />
      <div className='relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl flex flex-col max-h-[88vh]'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
          <div className='min-w-0'>
            <h3 className='font-bold text-foreground'>Reprogramar mentoría</h3>
            <p className='text-xs text-muted-foreground truncate'>
              {studentName} · {booking.category.name}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-full hover:bg-muted text-muted-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 min-h-0'>
          {slots === null ? (
            <div className='py-6 flex justify-center'>
              <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
            </div>
          ) : grouped.length === 0 ? (
            <p className='text-sm text-muted-foreground py-6 text-center'>
              No hay horarios libres.
            </p>
          ) : (
            <div className='space-y-3'>
              {grouped.map(([day, daySlots]) => (
                <div key={day}>
                  <p className='text-xs font-semibold text-foreground capitalize mb-1.5'>
                    {day}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {daySlots.map((s) => {
                      const label = new Date(s.start).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Argentina/Buenos_Aires',
                      });
                      const active = selected === s.start;
                      return (
                        <button
                          key={s.start}
                          type='button'
                          onClick={() => setSelected(s.start)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            active
                              ? 'bg-[#f9bbc4] text-white border-[#f9bbc4]'
                              : 'border-border hover:border-[#f9bbc4]'
                          }`}
                        >
                          {label} hs
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={() => void confirm()}
            disabled={saving || !selected}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#660e1b] text-white hover:opacity-90 disabled:opacity-50'
          >
            {saving ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Check className='w-4 h-4' />
            )}
            Reprogramar
          </button>
        </div>
      </div>
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
