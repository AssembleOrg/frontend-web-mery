'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Video, RefreshCw, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  mentorshipApi,
  formatSlot,
  type Mentorship,
} from '@/lib/mentorship-api';
import { SlotPickerModal } from './slot-picker-modal';
import { ConfirmDialog } from './confirm-dialog';

/**
 * Banner destacado (estilo card iOS, fondo oscuro premium) con las mentorías
 * agendadas del alumno. Se monta arriba de "Mis Cursos". Si no hay ninguna
 * agendada, no renderiza nada.
 */
export function MentorshipBanner({
  defaultEmail,
  courseNames,
}: Readonly<{ defaultEmail: string; courseNames?: Record<string, string> }>) {
  const [items, setItems] = useState<Mentorship[] | null>(null);
  const [picker, setPicker] = useState<null | { id: string; categoryId: string; email: string }>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await mentorshipApi.mine();
      setItems(
        all
          .filter((m) => m.status === 'SCHEDULED')
          .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)),
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
    // Refrescar al instante cuando se reserva/reagenda/cancela desde cualquier lado.
    const onChanged = () => void load();
    window.addEventListener('mentorship:changed', onChanged);
    return () => window.removeEventListener('mentorship:changed', onChanged);
  }, [load]);

  async function cancel(id: string) {
    try {
      await mentorshipApi.cancel(id);
      toast.success('Mentoría cancelada');
      window.dispatchEvent(new CustomEvent('mentorship:changed'));
      setCancelId(null);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const courseName = (m: Mentorship) =>
    courseNames?.[m.categoryId] || m.category?.name || 'Tu curso';

  if (!items || items.length === 0) return null;

  return (
    <div className='mb-6 rounded-2xl bg-[#1c1c1e] text-white shadow-sm overflow-hidden'>
      <div className='flex items-center gap-2.5 px-5 pt-4 pb-3'>
        <CalendarClock className='w-4 h-4 text-[#EBA2A8]' />
        <h3 className='text-[13px] font-semibold uppercase tracking-[0.14em] text-white/90'>
          {items.length > 1 ? 'Tus mentorías agendadas' : 'Mentoría agendada'}
        </h3>
      </div>

      <div className='divide-y divide-white/10'>
        {items.map((m) => (
          <div key={m.id} className='px-5 py-4'>
            <p className='text-[15px] font-semibold leading-tight'>
              {courseName(m)}
            </p>
            <p className='mt-1 text-sm text-white/60 capitalize'>
              {formatSlot(m.scheduledStart)} hs
            </p>

            <div className='mt-3 flex flex-wrap items-center gap-2'>
              {m.meetLink && (
                <a
                  href={m.meetLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors'
                >
                  <Video className='w-3.5 h-3.5 text-[#EBA2A8]' /> Videollamada
                </a>
              )}
              {m.canReschedule && (
                <button
                  type='button'
                  onClick={() =>
                    setPicker({
                      id: m.id,
                      categoryId: m.categoryId,
                      email: m.meetingEmail || defaultEmail,
                    })
                  }
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-colors'
                >
                  <RefreshCw className='w-3.5 h-3.5' /> Reagendar
                </button>
              )}
              <button
                type='button'
                onClick={() => setCancelId(m.id)}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/15 text-white/60 hover:text-red-300 hover:border-red-400/40 transition-colors'
              >
                <Ban className='w-3.5 h-3.5' /> Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className='px-5 pb-4 pt-1 text-[11px] text-white/40'>
        Podés reprogramar (1 vez) o cancelar hasta 72 hs antes. El chat del curso se activa
        después de la mentoría.
      </p>

      {picker && (
        <SlotPickerModal
          categoryId={picker.categoryId}
          defaultEmail={picker.email}
          mode='reschedule'
          mentorshipId={picker.id}
          onClose={() => setPicker(null)}
          onDone={() => {
            setPicker(null);
            void load();
          }}
        />
      )}

      {cancelId && (
        <ConfirmDialog
          title='¿Cancelar la mentoría?'
          description='Se libera el cupo para otro alumno. Podés volver a reservar más adelante si hay horarios disponibles.'
          confirmLabel='Sí, cancelar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => cancel(cancelId)}
          onClose={() => setCancelId(null)}
        />
      )}
    </div>
  );
}
