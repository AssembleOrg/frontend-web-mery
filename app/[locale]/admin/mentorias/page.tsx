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
  CalendarX,
  Copy,
  Check,
  X,
  FileText,
  Images,
  ChevronRight,
} from 'lucide-react';
import {
  mentorshipApi,
  WEEKDAYS,
  minutesToHHMM,
  formatSlot,
  formatTime,
  materialProgress,
  MATERIAL_SECTIONS,
  MATERIAL_TOTAL,
  type MentorshipAvailability,
  type AdminMentorship,
} from '@/lib/mentorship-api';
import { SlotPickerModal } from '@/components/mentorship/slot-picker-modal';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import {
  getForms,
  getFormResponses,
  type FormAnswers,
  type FormAnswerValue,
  type FormField,
} from '@/lib/forms-api';

/** Fichas del form previo a la mentoría (slug `mentoria`), indexadas por email. */
type Fichas = { fields: FormField[]; byEmail: Map<string, FormAnswers> };

async function loadFichas(): Promise<Fichas> {
  try {
    const { data } = await getForms({ search: 'mentoria' });
    const form = data.find((f) => f.slug === 'mentoria');
    if (!form) return { fields: [], byEmail: new Map() };
    // ponytail: últimas 200 respuestas; paginar o filtrar por email si se supera.
    const res = await getFormResponses(form.id, { limit: 200 });
    const byEmail = new Map<string, FormAnswers>();
    for (const r of res.data.responses) if (r.email) byEmail.set(r.email.toLowerCase(), r.answers);
    return { fields: res.data.form.fields, byEmail };
  } catch {
    return { fields: [], byEmail: new Map() };
  }
}

function formatAnswer(field: FormField, v: FormAnswerValue): string {
  const label = (id: string) => field.options?.find((o) => o.id === id)?.label ?? id;
  if (Array.isArray(v)) return v.map(label).join(', ');
  if (typeof v === 'object') return (v.value ? 'Sí' : 'No') + (v.context ? ` — ${v.context}` : '');
  return field.options ? label(v) : v;
}

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
  const [fichas, setFichas] = useState<Fichas>({ fields: [], byEmail: new Map() });
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
      const [a, b, f] = await Promise.all([
        mentorshipApi.adminAvailability(),
        mentorshipApi.adminCalendar({ status: statusFilter || undefined }),
        loadFichas(),
      ]);
      setAvail(a);
      setBookings(b);
      setFichas(f);
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
                      fields={fichas.fields}
                      answers={fichas.byEmail.get(b.user.email.toLowerCase())}
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

/**
 * Card de una reserva. Toda la card abre el detalle (material, ficha, link y
 * acciones): así en mobile no compite el nombre con una fila de íconos.
 */
function BookingRow({
  booking: b,
  fields,
  answers,
  onReschedule,
  onCancel,
}: Readonly<{
  booking: AdminMentorship;
  fields: FormField[];
  answers?: FormAnswers;
  onReschedule: () => void;
  onCancel: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const time = new Date(b.scheduledStart).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const showMaterial = b.materialRequired && b.status !== 'CANCELLED';
  const progress = materialProgress(b.material);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='group w-full text-left rounded-xl border border-border bg-white dark:bg-card p-3 sm:p-4 transition-colors hover:border-[#EBA2A8] hover:bg-[#FBE8EA]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EBA2A8]'
      >
        <div className='flex items-start gap-3'>
          <span className='shrink-0 pt-0.5 font-mono font-semibold text-sm text-[#2B2B2B] dark:text-[#EBA2A8]'>
            {time}
          </span>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-foreground leading-snug break-words'>
              {studentName(b.user)}
            </div>
            <div className='text-xs text-muted-foreground leading-snug break-words'>
              {b.category.name}
            </div>
            <div className='text-xs text-muted-foreground/80 leading-snug break-all'>{b.user.email}</div>

            <div className='mt-2 flex flex-wrap items-center gap-1.5'>
              <StatusBadge status={b.status} />
              {b.rescheduleCount >= 1 && b.status === 'SCHEDULED' && (
                <Chip className='bg-[#EBA2A8]/15 text-[#b06b72]'>
                  <RefreshCw className='w-2.5 h-2.5' /> Reprogramada
                </Chip>
              )}
              {showMaterial && (
                <Chip
                  className={
                    b.materialComplete
                      ? 'bg-emerald-50 text-emerald-700'
                      : progress
                        ? 'bg-[#EBA2A8]/15 text-[#b06b72]'
                        : 'bg-muted text-muted-foreground'
                  }
                >
                  <Images className='w-2.5 h-2.5' /> Material {progress}/{MATERIAL_TOTAL}
                </Chip>
              )}
              {answers && (
                <Chip className='bg-muted text-muted-foreground'>
                  <FileText className='w-2.5 h-2.5' /> Ficha
                </Chip>
              )}
            </div>
          </div>
          <ChevronRight className='w-4 h-4 mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
        </div>
      </button>

      {open && (
        <BookingDetail
          booking={b}
          fields={fields}
          answers={answers}
          onClose={() => setOpen(false)}
          onReschedule={() => {
            setOpen(false);
            onReschedule();
          }}
          onCancel={() => {
            setOpen(false);
            onCancel();
          }}
        />
      )}
    </>
  );
}

function Chip({ className, children }: Readonly<{ className: string; children: React.ReactNode }>) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${className}`}>
      {children}
    </span>
  );
}

/**
 * Detalle de la reserva: hoja que sube desde abajo en mobile y modal centrado
 * en desktop. Junta todo lo que antes eran popovers sueltos.
 */
function BookingDetail({
  booking: b,
  fields,
  answers,
  onClose,
  onReschedule,
  onCancel,
}: Readonly<{
  booking: AdminMentorship;
  fields: FormField[];
  answers?: FormAnswers;
  onClose: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}>) {
  const [copied, setCopied] = useState(false);
  const showMaterial = b.materialRequired && b.status !== 'CANCELLED';
  const progress = materialProgress(b.material);
  const fichaRows = answers
    ? fields.filter((f) => f.type !== 'info' && f.type !== 'email' && answers[f.id] !== undefined)
    : [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No se pudo copiar');
    }
  }

  return (
    <div className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4' role='dialog' aria-modal='true'>
      <button type='button' aria-label='Cerrar' onClick={onClose} className='absolute inset-0 bg-black/50' />
      <div className='relative flex w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-card shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200'>
        {/* Cabecera fija */}
        <div className='flex items-start gap-3 border-b border-border p-4 sm:p-5'>
          <div className='min-w-0 flex-1'>
            <p className='font-semibold text-foreground leading-snug break-words'>{studentName(b.user)}</p>
            <p className='text-xs text-muted-foreground break-all'>{b.user.email}</p>
            <p className='mt-1.5 text-sm text-foreground'>{b.category.name}</p>
            <p className='text-sm text-muted-foreground capitalize'>
              {formatSlot(b.scheduledStart)} – {formatTime(b.scheduledEnd)} hs
            </p>
            <div className='mt-2 flex flex-wrap gap-1.5'>
              <StatusBadge status={b.status} />
              {b.rescheduleCount >= 1 && b.status === 'SCHEDULED' && (
                <Chip className='bg-[#EBA2A8]/15 text-[#b06b72]'>
                  <RefreshCw className='w-2.5 h-2.5' /> Reprogramada
                </Chip>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className='p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Contenido */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-5 space-y-6'>
          {b.meetLink && (
            <section>
              <SectionTitle>Videollamada</SectionTitle>
              <div className='flex flex-wrap gap-2'>
                <a
                  href={b.meetLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#2B2B2B] text-white hover:bg-black'
                >
                  <Video className='w-3.5 h-3.5 text-[#EBA2A8]' /> Abrir Meet
                </a>
                <button
                  type='button'
                  onClick={() => void copyLink(b.meetLink!)}
                  className='inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted'
                >
                  {copied ? (
                    <>
                      <Check className='w-3.5 h-3.5 text-green-600' /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className='w-3.5 h-3.5' /> Copiar link
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {showMaterial && (
            <section>
              <SectionTitle>
                Material · {progress}/{MATERIAL_TOTAL}
                {b.materialComplete && <span className='ml-1.5 text-emerald-600'>completo</span>}
              </SectionTitle>
              {b.material?.notStaff && (
                <p className='mb-3 text-xs text-muted-foreground'>
                  ✓ Confirmó que las referencias no son trabajos del staff.
                </p>
              )}
              <div className='space-y-4'>
                {MATERIAL_SECTIONS.map((s) => {
                  const items = b.material?.[s.group] ?? [];
                  return (
                    <div key={s.group}>
                      <p className='text-xs font-medium text-foreground'>
                        {s.title} <span className='text-muted-foreground'>· {items.length}</span>
                      </p>
                      {items.length === 0 ? (
                        <p className='mt-1 text-xs text-muted-foreground'>Sin cargar</p>
                      ) : (
                        <div className='mt-1.5 grid grid-cols-3 sm:grid-cols-4 gap-2'>
                          {items.map((img) => (
                            <a
                              key={img.key}
                              href={img.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='block aspect-square overflow-hidden rounded-lg bg-muted'
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt='' className='h-full w-full object-cover transition-transform hover:scale-105' />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {fichaRows.length > 0 && answers && (
            <section>
              <SectionTitle>Ficha</SectionTitle>
              <dl className='space-y-3'>
                {fichaRows.map((f) => (
                  <div key={f.id}>
                    <dt className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                      {f.label}
                    </dt>
                    <dd className='text-sm text-foreground whitespace-pre-line break-words'>
                      {formatAnswer(f, answers[f.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {!b.meetLink && !showMaterial && fichaRows.length === 0 && (
            <p className='text-sm text-muted-foreground'>Sin información adicional para esta reserva.</p>
          )}
        </div>

        {/* Acciones fijas abajo (al alcance del pulgar en mobile) */}
        {b.status === 'SCHEDULED' && (
          <div className='flex gap-2 border-t border-border p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
            <button
              type='button'
              onClick={onReschedule}
              className='flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted'
            >
              <RefreshCw className='w-4 h-4' /> Reprogramar
            </button>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50'
            >
              <Ban className='w-4 h-4' /> Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h3 className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
      {children}
    </h3>
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
