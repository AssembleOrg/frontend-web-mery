'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  mentorshipApi,
  formatSlot,
  type MentorshipEligibility,
} from '@/lib/mentorship-api';
import { SlotPickerModal } from './slot-picker-modal';

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
  const [picker, setPicker] = useState(false);

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
    const onChanged = () => void load();
    window.addEventListener('mentorship:changed', onChanged);
    return () => window.removeEventListener('mentorship:changed', onChanged);
  }, [load]);

  const refresh = () => {
    void load();
    onChanged?.();
  };

  if (loading) {
    return (
      <div className='mt-3 flex justify-center py-2'>
        <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
      </div>
    );
  }
  if (!elig) return null;

  const m = elig.mentorship;

  // Ya tiene una mentoría agendada → se gestiona en el banner de arriba.
  // Acá dejamos solo una nota mínima que la referencia.
  if (m && m.status === 'SCHEDULED') {
    return (
      <div className='mt-3 flex items-start gap-2.5 rounded-xl bg-[#1c1c1e] text-white px-3.5 py-3'>
        <CalendarClock className='w-4 h-4 mt-0.5 shrink-0 text-[#EBA2A8]' />
        <div className='text-xs leading-relaxed'>
          <span className='font-semibold'>Mentoría agendada</span>
          <span className='text-white/60'> · </span>
          <span className='capitalize text-white/80'>{formatSlot(m.scheduledStart)} hs</span>
          <p className='text-[11px] text-white/40 mt-0.5'>
            Gestionala desde el bloque de arriba.
          </p>
        </div>
      </div>
    );
  }

  // Puede reservar
  if (elig.canBook) {
    return (
      <>
        <button
          type='button'
          onClick={() => setPicker(true)}
          className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] text-sm font-primary font-medium transition-colors'
        >
          <CalendarClock className='w-4 h-4 text-[#EBA2A8]' />
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
            onClose={() => setPicker(false)}
            onDone={() => {
              setPicker(false);
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
