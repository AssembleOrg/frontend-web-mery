'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  Ban,
  RefreshCw,
  Check,
  X,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mentorshipApi, type AdminMentorship } from '@/lib/mentorship-api';
import {
  presencialApi,
  hourLabel,
  CLASS_STATUS_LABEL,
  SIGNUP_STATUS_LABEL,
  type PresencialClassAdmin,
  type PresencialSignupAdmin,
} from '@/lib/presencial-api';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { SlotPickerModal } from '@/components/mentorship/slot-picker-modal';
import { PresencialClassForm } from './presencial-class-form';

const TZ = 'America/Argentina/Buenos_Aires';

function dayKey(iso: string): string {
  return DateTime.fromISO(iso, { zone: TZ }).toISODate() ?? '';
}
function hhmm(iso: string): string {
  return DateTime.fromISO(iso, { zone: TZ }).toFormat('HH:mm');
}
function personName(u: { firstName: string | null; lastName: string | null; email: string }) {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

type Filters = { mentorias: boolean; presenciales: boolean };

/**
 * Calendario mensual del admin: mentorías (gris) + clases presenciales (rosa:
 * tentativa punteada / confirmada sólida). Click en un día → detalle con las
 * personas involucradas y acciones (confirmar/cancelar con confirmación).
 */
export function AdminCalendar() {
  const [cursor, setCursor] = useState(() => DateTime.now().setZone(TZ).startOf('month'));
  const [filters, setFilters] = useState<Filters>({ mentorias: true, presenciales: true });
  const [mentorships, setMentorships] = useState<AdminMentorship[]>([]);
  const [classes, setClasses] = useState<PresencialClassAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Acciones
  const [confirmClassFor, setConfirmClassFor] = useState<PresencialClassAdmin | null>(null);
  const [cancelClassFor, setCancelClassFor] = useState<PresencialClassAdmin | null>(null);
  const [rejectSignupFor, setRejectSignupFor] = useState<PresencialSignupAdmin | null>(null);
  const [editClass, setEditClass] = useState<PresencialClassAdmin | null>(null);
  const [newClassDate, setNewClassDate] = useState<string | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<AdminMentorship | null>(null);
  const [cancelMentFor, setCancelMentFor] = useState<AdminMentorship | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Rango visible (con margen de una semana a cada lado por la grilla).
    const from = cursor.minus({ days: 7 }).toUTC().toISO()!;
    const to = cursor.endOf('month').plus({ days: 7 }).toUTC().toISO()!;
    try {
      const [m, c] = await Promise.all([
        mentorshipApi.adminCalendar({ from, to }),
        presencialApi.adminCalendar({ from, to }),
      ]);
      setMentorships(m);
      setClasses(c);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('mentorship:changed', onChanged);
    window.addEventListener('presencial:changed', onChanged);
    return () => {
      window.removeEventListener('mentorship:changed', onChanged);
      window.removeEventListener('presencial:changed', onChanged);
    };
  }, [load]);

  // Grilla: semanas de lunes a domingo que cubren el mes.
  const weeks = useMemo(() => {
    const start = cursor.startOf('week'); // luxon: lunes
    const end = cursor.endOf('month').endOf('week');
    const days: DateTime[] = [];
    for (let d = start; d <= end; d = d.plus({ days: 1 })) days.push(d);
    const out: DateTime[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, { ments: AdminMentorship[]; cls: PresencialClassAdmin[] }>();
    const get = (k: string) => {
      const v = m.get(k) ?? { ments: [], cls: [] };
      m.set(k, v);
      return v;
    };
    if (filters.mentorias) {
      for (const x of mentorships) {
        if (x.status === 'CANCELLED') continue;
        get(dayKey(x.scheduledStart)).ments.push(x);
      }
    }
    if (filters.presenciales) {
      for (const c of classes) get(c.date).cls.push(c);
    }
    return m;
  }, [mentorships, classes, filters]);

  const todayKey = DateTime.now().setZone(TZ).toISODate();
  const selected = selectedDay ? byDay.get(selectedDay) : undefined;

  // ----- acciones -----
  async function confirmClass(c: PresencialClassAdmin) {
    const r = await presencialApi.adminConfirmClass(c.id);
    setConfirmClassFor(null);
    toast.success(`Clase confirmada · ${r.notified} alumna(s) avisadas`);
    window.dispatchEvent(new CustomEvent('presencial:changed'));
  }
  async function cancelClass(c: PresencialClassAdmin) {
    const r = await presencialApi.adminCancelClass(c.id);
    setCancelClassFor(null);
    toast.success(`Clase cancelada · ${r.notified} alumna(s) avisadas`);
    window.dispatchEvent(new CustomEvent('presencial:changed'));
  }
  async function confirmSignup(s: PresencialSignupAdmin) {
    try {
      await presencialApi.adminConfirmSignup(s.id);
      toast.success(`${personName(s.user)} confirmada`);
      window.dispatchEvent(new CustomEvent('presencial:changed'));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  async function rejectSignup(s: PresencialSignupAdmin) {
    await presencialApi.adminRejectSignup(s.id);
    setRejectSignupFor(null);
    toast.success(`${personName(s.user)} sin lugar (avisada)`);
    window.dispatchEvent(new CustomEvent('presencial:changed'));
  }
  async function cancelMentorship(m: AdminMentorship) {
    await mentorshipApi.adminCancel(m.id);
    setCancelMentFor(null);
    toast.success('Mentoría cancelada');
    window.dispatchEvent(new CustomEvent('mentorship:changed'));
  }

  const classChip = (c: PresencialClassAdmin) => {
    const base = 'block w-full truncate rounded px-1 py-0.5 text-[10px] leading-tight text-left';
    const style =
      c.status === 'CONFIRMED'
        ? 'bg-[#EBA2A8] text-[#2B2B2B]'
        : c.status === 'TENTATIVE'
          ? 'border border-dashed border-[#EBA2A8] text-[#8b1538] bg-[#fbe8ea]/60'
          : 'bg-muted text-muted-foreground line-through';
    return (
      <span key={c.id} className={`${base} ${style}`} title={`${c.title} · ${c.counts.active} inscriptas`}>
        {hourLabel(c.startHour)} {c.title}
        {c.counts.active > 0 && <span className='ml-1 font-semibold'>·{c.counts.active}</span>}
      </span>
    );
  };

  const mentChip = (m: AdminMentorship) => (
    <span
      key={m.id}
      className={`block w-full truncate rounded px-1 py-0.5 text-[10px] leading-tight text-left ${
        m.status === 'SCHEDULED' ? 'bg-[#2B2B2B] text-white' : 'bg-muted text-muted-foreground'
      }`}
      title={`${personName(m.user)} · ${m.category.name}`}
    >
      {hhmm(m.scheduledStart)} {personName(m.user)}
    </span>
  );

  return (
    <div className='space-y-4'>
      {/* Toolbar: filtros + acción (la navegación de mes vive dentro del calendario) */}
      <div className='flex flex-wrap items-center justify-end gap-2'>
        <div className='flex items-center gap-2 text-xs'>
          <label className='flex items-center gap-1.5 cursor-pointer'>
            <input
              type='checkbox'
              checked={filters.mentorias}
              onChange={(e) => setFilters((f) => ({ ...f, mentorias: e.target.checked }))}
              className='accent-[#EBA2A8]'
            />
            <span className='inline-block w-2.5 h-2.5 rounded-sm bg-[#2B2B2B]' /> Mentorías
          </label>
          <label className='flex items-center gap-1.5 cursor-pointer'>
            <input
              type='checkbox'
              checked={filters.presenciales}
              onChange={(e) => setFilters((f) => ({ ...f, presenciales: e.target.checked }))}
              className='accent-[#EBA2A8]'
            />
            <span className='inline-block w-2.5 h-2.5 rounded-sm bg-[#EBA2A8]' /> Presenciales
          </label>
          <button
            type='button'
            onClick={() => setNewClassDate(selectedDay ?? todayKey ?? '')}
            className='ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
          >
            <Plus className='w-3.5 h-3.5' /> Presencial
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <p className='text-[11px] text-muted-foreground'>
        <span className='inline-block align-middle w-3 h-3 rounded border border-dashed border-[#EBA2A8] bg-[#fbe8ea]/60 mr-1' />
        tentativa ·
        <span className='inline-block align-middle w-3 h-3 rounded bg-[#EBA2A8] mx-1' />
        confirmada · el número es la cantidad de inscriptas (solo lo ve el admin).
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4'>
        {/* Grilla */}
        <div className='rounded-2xl border border-border bg-white dark:bg-card overflow-hidden'>
          {/* Navegación de mes, pegada al calendario */}
          <div className='flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border'>
            <button
              type='button'
              onClick={() => setCursor((c) => c.minus({ months: 1 }))}
              className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95'
              aria-label='Mes anterior'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-primary-medium capitalize'>
                {cursor.setLocale('es').toFormat('LLLL yyyy')}
              </h3>
              <button
                type='button'
                onClick={() => setCursor(DateTime.now().setZone(TZ).startOf('month'))}
                className='px-2 py-0.5 text-[11px] rounded-full border border-border text-muted-foreground hover:border-[#EBA2A8] hover:text-foreground transition-colors'
              >
                Hoy
              </button>
              {loading && <Loader2 className='w-3.5 h-3.5 animate-spin text-muted-foreground' />}
            </div>
            <button
              type='button'
              onClick={() => setCursor((c) => c.plus({ months: 1 }))}
              className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95'
              aria-label='Mes siguiente'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
          <div className='grid grid-cols-7 text-[11px] font-semibold text-muted-foreground border-b border-border'>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className='px-2 py-1.5 text-center'>{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className='grid grid-cols-7 border-b border-border last:border-b-0'>
              {week.map((d) => {
                const key = d.toISODate()!;
                const inMonth = d.month === cursor.month;
                const ev = byDay.get(key);
                const has = !!ev && (ev.ments.length > 0 || ev.cls.length > 0);
                const isSel = selectedDay === key;
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => setSelectedDay(key)}
                    className={`min-h-[76px] sm:min-h-[92px] p-1 text-left border-r border-border last:border-r-0 transition-colors ${
                      inMonth ? '' : 'bg-muted/30 text-muted-foreground'
                    } ${isSel ? 'ring-2 ring-inset ring-[#EBA2A8]' : 'hover:bg-muted/40'}`}
                  >
                    <div
                      className={`text-[11px] font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                        key === todayKey ? 'bg-[#2B2B2B] text-white' : ''
                      }`}
                    >
                      {d.day}
                    </div>
                    {has && (
                      <div className='space-y-0.5'>
                        {ev!.cls.slice(0, 2).map(classChip)}
                        {ev!.ments.slice(0, 2).map(mentChip)}
                        {ev!.cls.length + ev!.ments.length > 4 && (
                          <span className='block text-[10px] text-muted-foreground'>
                            +{ev!.cls.length + ev!.ments.length - 4} más
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Detalle del día */}
        <aside className='rounded-2xl border border-border bg-white dark:bg-card p-3 sm:p-4 lg:sticky lg:top-4 self-start max-h-[70vh] overflow-y-auto'>
          {!selectedDay ? (
            <p className='text-sm text-muted-foreground'>Tocá un día para ver el detalle.</p>
          ) : (
            <>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-sm font-bold capitalize'>
                  {DateTime.fromISO(selectedDay, { zone: TZ }).setLocale('es').toFormat('cccc d LLL')}
                </h4>
                <button
                  type='button'
                  onClick={() => setNewClassDate(selectedDay)}
                  className='text-[11px] inline-flex items-center gap-1 text-[#8b1538] hover:underline'
                >
                  <Plus className='w-3 h-3' /> presencial
                </button>
              </div>

              {!selected || (selected.cls.length === 0 && selected.ments.length === 0) ? (
                <p className='text-sm text-muted-foreground'>Nada agendado este día.</p>
              ) : (
                <div className='space-y-3'>
                  {selected.cls.map((c) => (
                    <div key={c.id} className='rounded-xl border border-[#EBA2A8]/50 bg-[#fbe8ea]/40 p-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <p className='text-sm font-semibold leading-tight'>{c.title}</p>
                          <p className='text-xs text-muted-foreground'>
                            {hourLabel(c.startHour)}–{hourLabel(c.endHour)} hs ·{' '}
                            <span className='font-medium'>{CLASS_STATUS_LABEL[c.status]}</span>
                            {c.restrictToStudents && ' · solo alumnas'}
                          </p>
                          {c.categories.length > 0 && (
                            <p className='text-[11px] text-muted-foreground mt-0.5'>
                              {c.categories.map((x) => x.name).join(' · ')}
                            </p>
                          )}
                        </div>
                        <button
                          type='button'
                          onClick={() => setEditClass(c)}
                          className='p-1 rounded text-muted-foreground hover:text-foreground'
                          aria-label='Editar'
                        >
                          <Pencil className='w-3.5 h-3.5' />
                        </button>
                      </div>

                      <p className='mt-2 text-xs flex items-center gap-1.5'>
                        <Users className='w-3.5 h-3.5 text-[#8b1538]' />
                        <span className='font-semibold'>{c.counts.active}</span> inscriptas
                        <span className='text-muted-foreground'>
                          ({c.counts.pending} pendientes · {c.counts.confirmed} confirmadas)
                        </span>
                      </p>

                      {c.signups.filter((s) => s.status !== 'CANCELLED').length > 0 && (
                        <ul className='mt-2 space-y-1.5'>
                          {c.signups
                            .filter((s) => s.status !== 'CANCELLED')
                            .map((s) => (
                              <li key={s.id} className='text-xs rounded-lg bg-white dark:bg-background border border-border px-2 py-1.5'>
                                <div className='flex items-center justify-between gap-2'>
                                  <div className='min-w-0'>
                                    <p className='font-medium truncate'>{personName(s.user)}</p>
                                    <p className='text-[11px] text-muted-foreground truncate'>
                                      {s.user.email}{s.user.phone ? ` · ${s.user.phone}` : ''}
                                    </p>
                                    <p className={`text-[11px] ${
                                      s.status === 'CONFIRMED' ? 'text-green-600' : s.status === 'PENDING' ? 'text-amber-600' : 'text-muted-foreground'
                                    }`}>
                                      {SIGNUP_STATUS_LABEL[s.status]}
                                    </p>
                                    {s.note && <p className='text-[11px] italic text-muted-foreground'>“{s.note}”</p>}
                                  </div>
                                  {(s.status === 'PENDING' || s.status === 'CONFIRMED') && (
                                    <div className='flex gap-1 shrink-0'>
                                      {s.status === 'PENDING' && (
                                        <button
                                          type='button'
                                          onClick={() => confirmSignup(s)}
                                          className='p-1 rounded bg-green-500/15 text-green-700 hover:bg-green-500/25'
                                          title='Confirmar'
                                        >
                                          <Check className='w-3.5 h-3.5' />
                                        </button>
                                      )}
                                      <button
                                        type='button'
                                        onClick={() => setRejectSignupFor(s)}
                                        className='p-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                        title='Sin lugar'
                                      >
                                        <X className='w-3.5 h-3.5' />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}

                      {(c.status === 'TENTATIVE' || c.status === 'CONFIRMED') && (
                        <div className='mt-3 flex gap-2'>
                          {c.status === 'TENTATIVE' && (
                            <button
                              type='button'
                              onClick={() => setConfirmClassFor(c)}
                              className='flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
                            >
                              Confirmar clase
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => setCancelClassFor(c)}
                            className='flex-1 py-1.5 text-xs font-medium rounded-lg border border-border text-red-600 hover:border-red-400'
                          >
                            Cancelar clase
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {selected.ments.map((m) => (
                    <div key={m.id} className='rounded-xl border border-border p-3'>
                      <p className='text-sm font-semibold leading-tight'>
                        {hhmm(m.scheduledStart)}–{hhmm(m.scheduledEnd)} hs · Mentoría
                      </p>
                      <p className='text-xs'>{personName(m.user)}</p>
                      <p className='text-[11px] text-muted-foreground'>
                        {m.category.name} · {m.user.email}
                      </p>
                      <div className='mt-2 flex flex-wrap gap-1.5'>
                        {m.meetLink && (
                          <a
                            href={m.meetLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg bg-[#2B2B2B] text-white'
                          >
                            <Video className='w-3 h-3 text-[#EBA2A8]' /> Meet
                          </a>
                        )}
                        {m.status === 'SCHEDULED' && (
                          <>
                            <button
                              type='button'
                              onClick={() => setRescheduleFor(m)}
                              className='inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border border-border'
                            >
                              <RefreshCw className='w-3 h-3' /> Reprogramar
                            </button>
                            <button
                              type='button'
                              onClick={() => setCancelMentFor(m)}
                              className='inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg border border-border text-red-600'
                            >
                              <Ban className='w-3 h-3' /> Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Diálogos */}
      {confirmClassFor && (
        <ConfirmDialog
          title='¿Confirmar la clase presencial?'
          description={`${confirmClassFor.title} · ${hourLabel(confirmClassFor.startHour)}–${hourLabel(confirmClassFor.endHour)} hs. Se confirma el lugar de las ${confirmClassFor.counts.pending} pendientes y se les avisa por email y en la app.`}
          confirmLabel='Sí, confirmar'
          onConfirm={() => confirmClass(confirmClassFor)}
          onClose={() => setConfirmClassFor(null)}
        />
      )}
      {cancelClassFor && (
        <ConfirmDialog
          title='¿Cancelar la clase presencial?'
          description={`${cancelClassFor.title}. Las ${cancelClassFor.counts.active} inscriptas quedan canceladas y se les avisa por email y en la app.`}
          confirmLabel='Sí, cancelar clase'
          destructive
          onConfirm={() => cancelClass(cancelClassFor)}
          onClose={() => setCancelClassFor(null)}
        />
      )}
      {rejectSignupFor && (
        <ConfirmDialog
          title='¿Dejar sin lugar a esta alumna?'
          description={`${personName(rejectSignupFor.user)} recibe un email avisando que no pudimos confirmar su lugar. Puede anotarse a otra fecha.`}
          confirmLabel='Sí, sin lugar'
          destructive
          onConfirm={() => rejectSignup(rejectSignupFor)}
          onClose={() => setRejectSignupFor(null)}
        />
      )}
      {cancelMentFor && (
        <ConfirmDialog
          title='¿Cancelar esta mentoría?'
          description={`${personName(cancelMentFor.user)} · ${cancelMentFor.category.name}. Se libera el horario.`}
          confirmLabel='Sí, cancelar'
          destructive
          onConfirm={() => cancelMentorship(cancelMentFor)}
          onClose={() => setCancelMentFor(null)}
        />
      )}
      {rescheduleFor && (
        <SlotPickerModal
          admin
          mode='reschedule'
          categoryId={rescheduleFor.categoryId}
          mentorshipId={rescheduleFor.id}
          defaultEmail={rescheduleFor.meetingEmail}
          subtitle={`${personName(rescheduleFor.user)} · ${rescheduleFor.category.name}`}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            window.dispatchEvent(new CustomEvent('mentorship:changed'));
          }}
        />
      )}
      {(editClass || newClassDate !== null) && (
        <PresencialClassForm
          initial={editClass}
          defaultDate={newClassDate ?? undefined}
          onClose={() => {
            setEditClass(null);
            setNewClassDate(null);
          }}
          onSaved={() => {
            setEditClass(null);
            setNewClassDate(null);
          }}
        />
      )}
    </div>
  );
}
