'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  Video,
  Loader2,
  X,
  Check,
  RefreshCw,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  mentorshipApi,
  formatSlot,
  type MentorshipEligibility,
  type MentorshipSlot,
} from '@/lib/mentorship-api';

interface Props {
  categoryId: string;
  categoryName: string;
  defaultEmail: string;
  /** Se llama tras reservar/reagendar/cancelar, para refrescar el estado del chat. */
  onChanged?: () => void;
}

export function MentorshipGate({
  categoryId,
  categoryName,
  defaultEmail,
  onChanged,
}: Readonly<Props>) {
  const [elig, setElig] = useState<MentorshipEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  // Modal de selección de horario. mode: 'book' | 'reschedule'
  const [picker, setPicker] = useState<null | { mode: 'book' | 'reschedule'; id?: string }>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setElig(await mentorshipApi.eligibility(categoryId));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = () => {
    void load();
    onChanged?.();
  };

  async function cancel(id: string) {
    if (!confirm('¿Cancelar la mentoría? Se libera el cupo.')) return;
    try {
      await mentorshipApi.cancel(id);
      toast.success('Mentoría cancelada');
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className='mt-3 flex justify-center py-2'>
        <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
      </div>
    );
  }
  if (!elig) return null;

  const m = elig.mentorship;

  // Ya tiene una mentoría agendada
  if (m && m.status === 'SCHEDULED') {
    return (
      <div className='mt-3 rounded-lg border border-[#f9bbc4]/60 bg-[#fff4f6] dark:bg-[#3a1f26] p-3 text-sm'>
        <div className='flex items-center gap-2 font-medium text-[#660e1b] dark:text-[#ffd3d9]'>
          <CalendarClock className='w-4 h-4' />
          Mentoría agendada
        </div>
        <p className='text-xs text-[#660e1b] dark:text-[#ffd3d9] mt-1 capitalize'>
          {formatSlot(m.scheduledStart)} hs
        </p>
        <p className='text-[11px] text-muted-foreground mt-1'>
          El chat de <strong>{categoryName}</strong> se activa después de la mentoría.
        </p>
        {m.meetLink && (
          <a
            href={m.meetLink}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#660e1b] dark:text-[#f9bbc4] underline'
          >
            <Video className='w-3.5 h-3.5' /> Link de la videollamada
          </a>
        )}
        <div className='flex items-center gap-2 mt-3'>
          {m.canReschedule && (
            <button
              type='button'
              onClick={() => setPicker({ mode: 'reschedule', id: m.id })}
              className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-border hover:border-[#f9bbc4]'
            >
              <RefreshCw className='w-3.5 h-3.5' /> Reagendar
            </button>
          )}
          <button
            type='button'
            onClick={() => void cancel(m.id)}
            className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50'
          >
            <Ban className='w-3.5 h-3.5' /> Cancelar
          </button>
        </div>
        <p className='text-[10px] text-muted-foreground mt-2'>
          Reprogramar (1 vez) o cancelar: hasta 72 hs antes.
        </p>
        {picker && (
          <SlotPickerModal
            categoryId={categoryId}
            defaultEmail={m.meetingEmail || defaultEmail}
            mode={picker.mode}
            mentorshipId={picker.id}
            onClose={() => setPicker(null)}
            onDone={() => {
              setPicker(null);
              refresh();
            }}
          />
        )}
      </div>
    );
  }

  // Puede reservar
  if (elig.canBook) {
    return (
      <>
        <button
          type='button'
          onClick={() => setPicker({ mode: 'book' })}
          className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-[#f9bbc4] text-[#660e1b] dark:text-[#f9bbc4] hover:bg-[#f9bbc4] hover:text-white dark:hover:text-[#3a1f26] text-sm font-primary font-medium transition-colors'
        >
          <CalendarClock className='w-4 h-4' />
          Reservá tu mentoría
        </button>
        <p className='mt-2 text-[11px] text-center text-muted-foreground'>
          Aprobaste el examen. Reservá tu mentoría para activar el chat.
        </p>
        {picker && (
          <SlotPickerModal
            categoryId={categoryId}
            defaultEmail={defaultEmail}
            mode='book'
            onClose={() => setPicker(null)}
            onDone={() => {
              setPicker(null);
              refresh();
            }}
          />
        )}
      </>
    );
  }

  // No elegible (no debería mostrarse acá porque el gate previo ya filtra)
  return null;
}

function SlotPickerModal({
  categoryId,
  defaultEmail,
  mode,
  mentorshipId,
  onClose,
  onDone,
}: Readonly<{
  categoryId: string;
  defaultEmail: string;
  mode: 'book' | 'reschedule';
  mentorshipId?: string;
  onClose: () => void;
  onDone: () => void;
}>) {
  const [slots, setSlots] = useState<MentorshipSlot[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    mentorshipApi
      .slots()
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
    if (mode === 'book' && !email.trim()) {
      toast.error('Ingresá el email para la videollamada');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'reschedule' && mentorshipId) {
        await mentorshipApi.reschedule(mentorshipId, selected);
        toast.success('Mentoría reprogramada');
      } else {
        await mentorshipApi.book({
          categoryId,
          start: selected,
          meetingEmail: email.trim(),
        });
        toast.success('Mentoría reservada');
      }
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button
        type='button'
        aria-label='Cerrar'
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
      />
      <div className='relative w-full sm:max-w-md bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88vh]'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
          <h3 className='font-bold text-foreground'>
            {mode === 'reschedule' ? 'Reprogramar mentoría' : 'Reservá tu mentoría'}
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-full hover:bg-muted text-muted-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
          {mode === 'book' && (
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>
                Email para la videollamada
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
              />
              <p className='text-[11px] text-muted-foreground mt-1'>
                Te llega la invitación de Google Meet a este email.
              </p>
            </div>
          )}

          <div>
            <p className='text-xs font-medium text-muted-foreground mb-2'>
              Elegí un horario
            </p>
            {slots === null ? (
              <div className='py-6 flex justify-center'>
                <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
              </div>
            ) : grouped.length === 0 ? (
              <p className='text-sm text-muted-foreground py-6 text-center'>
                No hay horarios disponibles por ahora.
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
            {mode === 'reschedule' ? 'Reprogramar' : 'Confirmar reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}
