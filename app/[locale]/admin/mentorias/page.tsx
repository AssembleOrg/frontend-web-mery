'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  CalendarX,
  Copy,
  Check,
  X,
} from 'lucide-react';
import {
  mentorshipApi,
  WEEKDAYS,
  minutesToHHMM,
  type MentorshipAvailability,
  type AdminMentorship,
} from '@/lib/mentorship-api';
import { SlotPickerModal } from '@/components/mentorship/slot-picker-modal';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';

function hhmmToMin(v: string): number {
  const [h, m] = v.split(':').map(Number);
  return h * 60 + (m || 0);
}

function studentName(u: AdminMentorship['user']): string {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
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

  // Acciones
  const [rescheduleFor, setRescheduleFor] = useState<AdminMentorship | null>(null);
  const [cancelFor, setCancelFor] = useState<AdminMentorship | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        mentorshipApi.adminAvailability(),
        mentorshipApi.adminCalendar({ status: statusFilter || undefined }),
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
    const onChanged = () => void load();
    window.addEventListener('mentorship:changed', onChanged);
    return () => window.removeEventListener('mentorship:changed', onChanged);
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
    const next = !a.isActive;
    setAvail((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: next } : x)));
    try {
      await mentorshipApi.adminUpdateAvailability(a.id, { isActive: next });
    } catch (e) {
      setAvail((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: a.isActive } : x)));
      toast.error((e as Error).message);
    }
  }

  async function removeSlot(id: string) {
    await mentorshipApi.adminDeleteAvailability(id);
    setAvail((prev) => prev.filter((x) => x.id !== id));
    setDeleteSlotId(null);
    toast.success('Franja eliminada');
  }

  async function cancelBooking(b: AdminMentorship) {
    await mentorshipApi.adminCancel(b.id);
    setCancelFor(null);
    toast.success('Mentoría cancelada');
    void load();
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

  const filterLabel: Record<string, string> = {
    SCHEDULED: 'agendadas',
    COMPLETED: 'cumplidas',
    CANCELLED: 'canceladas',
    '': '',
  };

  return (
    <div className='mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6'>
      <h1 className='text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 mb-5'>
        <CalendarClock className='w-5 h-5 sm:w-6 sm:h-6 text-[#EBA2A8]' />
        Mentorías
      </h1>

      {/* Disponibilidad */}
      <section className='mb-8'>
        <h2 className='text-sm font-bold text-foreground mb-3'>Disponibilidad semanal</h2>
        <div className='rounded-2xl border border-border bg-white dark:bg-card p-3 sm:p-4'>
          <div className='flex flex-wrap items-end gap-2 mb-4'>
            <div className='min-w-0'>
              <label className='block text-[11px] text-muted-foreground mb-1'>Día</label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
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
              className='inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] disabled:opacity-50 transition-colors'
            >
              {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4 text-[#EBA2A8]' />}
              Agregar
            </button>
          </div>

          {avail.length === 0 ? (
            <div className='text-center py-6'>
              <CalendarClock className='w-8 h-8 mx-auto mb-2 text-muted-foreground/40' />
              <p className='text-sm text-muted-foreground'>
                Sin franjas configuradas. Agregá la primera arriba.
              </p>
            </div>
          ) : (
            <div className='space-y-1'>
              {avail.map((a) => (
                <div
                  key={a.id}
                  className='flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0'
                >
                  <span className={`font-medium ${a.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {WEEKDAYS[a.weekday]} {minutesToHHMM(a.startMin)}–{minutesToHHMM(a.endMin)}
                  </span>
                  {!a.isActive && (
                    <span className='text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5'>
                      inactiva
                    </span>
                  )}
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
                      onClick={() => setDeleteSlotId(a.id)}
                      title='Eliminar'
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
        <div className='flex items-center justify-between gap-2 mb-3'>
          <h2 className='text-sm font-bold text-foreground'>Reservas</h2>
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
          <div className='text-center py-12'>
            <CalendarX className='w-10 h-10 mx-auto mb-3 text-muted-foreground/40' />
            <p className='text-sm font-medium text-foreground'>
              No hay mentorías {filterLabel[statusFilter] || ''}.
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Probá cambiar el filtro de estado.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className='text-xs font-semibold text-muted-foreground capitalize mb-1.5'>
                  {day}
                </p>
                <div className='space-y-2'>
                  {items.map((b) => (
                    <BookingRow
                      key={b.id}
                      booking={b}
                      onReschedule={() => setRescheduleFor(b)}
                      onCancel={() => setCancelFor(b)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {rescheduleFor && (
        <SlotPickerModal
          admin
          mode='reschedule'
          categoryId={rescheduleFor.categoryId}
          mentorshipId={rescheduleFor.id}
          defaultEmail={rescheduleFor.meetingEmail}
          subtitle={`${studentName(rescheduleFor.user)} · ${rescheduleFor.category.name}`}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            void load();
          }}
        />
      )}

      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar la mentoría?'
          description={`Se libera el cupo de ${studentName(cancelFor.user)} y se borra el evento de Google Calendar.`}
          confirmLabel='Sí, cancelar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => cancelBooking(cancelFor)}
          onClose={() => setCancelFor(null)}
        />
      )}

      {deleteSlotId && (
        <ConfirmDialog
          title='¿Eliminar esta franja?'
          description='Dejará de ofrecerse ese horario a los alumnos.'
          confirmLabel='Sí, eliminar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => removeSlot(deleteSlotId)}
          onClose={() => setDeleteSlotId(null)}
        />
      )}
    </div>
  );
}

function BookingRow({
  booking: b,
  onReschedule,
  onCancel,
}: Readonly<{
  booking: AdminMentorship;
  onReschedule: () => void;
  onCancel: () => void;
}>) {
  const time = new Date(b.scheduledStart).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const rescheduled = b.rescheduleCount >= 1;

  return (
    <div className='rounded-xl border border-border bg-white dark:bg-card p-3'>
      <div className='flex items-center gap-3'>
        <div className='shrink-0 flex flex-col items-start gap-1'>
          <span className='font-mono font-semibold text-sm text-[#2B2B2B] dark:text-[#EBA2A8]'>
            {time}
          </span>
          <StatusBadge status={b.status} />
          {rescheduled && b.status === 'SCHEDULED' && (
            <span className='inline-flex items-center gap-1 text-[10px] rounded-full px-1.5 py-0.5 bg-[#EBA2A8]/15 text-[#b06b72]'>
              <RefreshCw className='w-2.5 h-2.5' /> Reprogramada
            </span>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='font-medium text-foreground truncate'>{studentName(b.user)}</div>
          <div className='text-xs text-muted-foreground truncate'>
            {b.category.name} · {b.user.email}
          </div>
        </div>
        {b.status === 'SCHEDULED' && (
          <div className='flex items-center gap-1 shrink-0'>
            {b.meetLink && <MeetLinkPopover url={b.meetLink} />}
            <button
              type='button'
              onClick={onReschedule}
              title='Reprogramar'
              className='p-2 rounded-lg hover:bg-muted text-muted-foreground'
            >
              <RefreshCw className='w-4 h-4' />
            </button>
            <button
              type='button'
              onClick={onCancel}
              title='Cancelar'
              className='p-2 rounded-lg hover:bg-red-50 text-red-500'
            >
              <Ban className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MeetLinkPopover({ url }: Readonly<{ url: string }>) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No se pudo copiar');
    }
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        title='Videollamada'
        className={`p-2 rounded-lg hover:bg-muted ${open ? 'text-[#EBA2A8]' : 'text-muted-foreground'}`}
      >
        <Video className='w-4 h-4' />
      </button>
      {open && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='Cerrar'
            onClick={() => setOpen(false)}
            className='absolute inset-0 bg-black/50'
          />
          <div
            ref={ref}
            className='relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#1c1c1e] text-white shadow-2xl p-4'
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-[11px] font-semibold uppercase tracking-wider text-white/70'>
                Link de la videollamada
              </span>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='text-white/50 hover:text-white'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
            <p
              className='text-xs text-white/80 leading-relaxed'
              style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' } as React.CSSProperties}
            >
              {url}
            </p>
            <button
              type='button'
              onClick={() => void copy()}
              className='mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 transition-colors'
            >
              {copied ? (
                <>
                  <Check className='w-3.5 h-3.5 text-green-400' /> Copiado
                </>
              ) : (
                <>
                  <Copy className='w-3.5 h-3.5 text-[#EBA2A8]' /> Copiar link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-[#FBE8EA] text-[#b06b72]',
    COMPLETED: 'bg-green-500/10 text-green-600',
    CANCELLED: 'bg-muted text-muted-foreground',
  };
  const label: Record<string, string> = {
    SCHEDULED: 'Agendada',
    COMPLETED: 'Cumplida',
    CANCELLED: 'Cancelada',
  };
  return (
    <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0 ${map[status] ?? ''}`}>
      {label[status] ?? status}
    </span>
  );
}
