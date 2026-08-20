'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { mentorshipApi, type MentorshipSlot } from '@/lib/mentorship-api';

export function SlotPickerModal({
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

  // Bloquear scroll de fondo, esconder el bot externo y cerrar con Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('hide-rag-widget');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

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
      window.dispatchEvent(new CustomEvent('mentorship:changed'));
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
      <div className='relative w-full sm:max-w-md bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88dvh]'>
        <div className='flex items-center justify-between gap-3 px-5 py-4 bg-[#2B2B2B] text-white rounded-t-2xl shrink-0'>
          <div className='min-w-0 flex items-center gap-3'>
            <span className='flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center'>
              <CalendarClock className='w-[18px] h-[18px] text-[#EBA2A8]' />
            </span>
            <h3 className='font-semibold leading-tight'>
              {mode === 'reschedule' ? 'Reprogramar mentoría' : 'Reservá tu mentoría'}
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors'
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
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#EBA2A8]'
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
                                ? 'bg-[#2B2B2B] text-white border-[#2B2B2B]'
                                : 'border-border text-foreground hover:border-[#EBA2A8]'
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

        <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]'>
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
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] disabled:opacity-50 transition-colors'
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
