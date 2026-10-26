'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, ImagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  mentorshipApi,
  formatSlot,
  formatTime,
  materialProgress,
  MATERIAL_TOTAL,
  type Mentorship,
  type MentorshipEligibility,
} from '@/lib/mentorship-api';
import { SlotPickerModal } from './slot-picker-modal';
import { MentorshipTipsModal } from './mentorship-tips-modal';
import { MentorshipFormModal, saveMentorshipForm } from './mentorship-form-modal';
import { MentorshipMaterialModal } from './mentorship-material-modal';
import type { FormAnswers } from '@/lib/forms-api';

interface Props {
  categoryId: string;
  categoryName: string;
  defaultEmail: string;
  /** Se llama tras reservar/reagendar/cancelar, para refrescar el estado del chat. */
  onChanged?: () => void;
  /**
   * Con el chat ya abierto: mostrar solo lo accionable (reservar o la mentoría
   * agendada) y nada mientras carga ni cuando no corresponde.
   */
  soloAccionable?: boolean;
}

export function MentorshipGate({
  categoryId,
  categoryName,
  defaultEmail,
  onChanged,
  soloAccionable = false,
}: Readonly<Props>) {
  const [elig, setElig] = useState<MentorshipEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState(false);
  const [tips, setTips] = useState(false);
  const [form, setForm] = useState(false);
  // Respuestas del form previo: se guardan solo si la reserva se confirma.
  const [answers, setAnswers] = useState<FormAnswers>();
  // Recién reservada y pide material (Estilismo): se abre la carga al toque.
  const [materialFor, setMaterialFor] = useState<Mentorship | null>(null);

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

  // Modal a pantalla completa: mientras está abierta tapa al gate igual.
  if (materialFor) {
    return (
      <MentorshipMaterialModal
        mentorship={materialFor}
        onClose={() => {
          setMaterialFor(null);
          void load();
        }}
      />
    );
  }

  if (loading) {
    if (soloAccionable) return null;
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
        <div className='min-w-0 flex-1 text-xs leading-relaxed'>
          <span className='font-semibold'>Mentoría agendada</span>
          <span className='text-white/60'> · </span>
          <span className='capitalize text-white/80'>{formatSlot(m.scheduledStart)} – {formatTime(m.scheduledEnd)} hs</span>
          <p className='text-[11px] text-white/40 mt-0.5'>
            Sujeta a confirmación de Mery García. Gestionala desde el bloque de arriba.
          </p>
          {m.materialRequired && !m.materialComplete && (
            <button
              type='button'
              onClick={() => setMaterialFor(m)}
              className='mt-2 inline-flex items-center gap-1.5 bg-[#F9BBC4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white'
              style={{ fontFamily: 'var(--font-din-condensed)' }}
            >
              <ImagePlus className='h-3.5 w-3.5' />
              Cargar material · {materialProgress(m.material)}/{MATERIAL_TOTAL}
            </button>
          )}
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
          onClick={() => setTips(true)}
          className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] text-sm font-primary font-medium transition-colors'
        >
          <CalendarClock className='w-4 h-4 text-[#EBA2A8]' />
          Reservá tu mentoría
        </button>
        <p className='mt-2 text-[11px] text-center text-muted-foreground'>
          {soloAccionable
            ? 'Tenés una mentoría de cortesía disponible. La mentoría queda sujeta a confirmación de Mery García.'
            : 'Aprobaste el examen. Reservá tu mentoría para activar el chat. La mentoría queda sujeta a confirmación de Mery García.'}
        </p>
        {tips && (
          <MentorshipTipsModal
            categoryName={categoryName}
            onClose={() => setTips(false)}
            onAccept={() => {
              setTips(false);
              setForm(true);
            }}
          />
        )}
        {form && (
          <MentorshipFormModal
            email={defaultEmail}
            onClose={() => setForm(false)}
            onDone={(a) => {
              setAnswers(a);
              setForm(false);
              setPicker(true);
            }}
          />
        )}
        {picker && (
          <SlotPickerModal
            categoryId={categoryId}
            defaultEmail={defaultEmail}
            mode='book'
            onClose={() => setPicker(false)}
            onDone={(booked) => {
              if (answers) void saveMentorshipForm(answers);
              setPicker(false);
              if (booked?.materialRequired) setMaterialFor(booked);
              refresh();
            }}
          />
        )}
      </>
    );
  }

  // Con el chat abierto no se muestran avisos de "no disponible".
  if (soloAccionable) return null;

  // Ya usó su mentoría gratuita (una por cuenta).
  if (elig.blockedByOtherCourse || elig.needsPurchase) {
    return (
      <div className='mt-3 flex items-start gap-2.5 rounded-xl bg-[#1c1c1e] text-white px-3.5 py-3'>
        <CalendarClock className='w-4 h-4 mt-0.5 shrink-0 text-[#EBA2A8]' />
        <div className='text-xs leading-relaxed'>
          <span className='font-semibold'>Mentoría no disponible</span>
          <p className='text-[11px] text-white/60 mt-0.5'>
            La mentoría gratuita es una sola por cuenta y ya la usaste en otra
            formación.
          </p>
        </div>
      </div>
    );
  }

  // No elegible (no debería mostrarse acá porque el gate previo ya filtra)
  return null;
}
