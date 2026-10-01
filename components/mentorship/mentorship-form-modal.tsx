'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { FormRenderer } from '@/components/forms/form-renderer';
import {
  getPublicForm,
  submitFormResponse,
  type FormAnswers,
  type PublicForm,
} from '@/lib/forms-api';

/** Slug del formulario creado desde /admin/formularios. */
const FORM_SLUG = 'mentoria';

/** Guarda las respuestas. Se llama recién después de reservar. */
export function saveMentorshipForm(answers: FormAnswers) {
  // Si falla no bloquea: la reserva ya está hecha.
  return submitFormResponse(FORM_SLUG, answers).catch(() => undefined);
}

/**
 * Formulario previo a elegir horario. Solo junta las respuestas: se guardan
 * (saveMentorshipForm) cuando la reserva se confirma. Si el form no existe o
 * está cerrado, sigue de largo para no bloquear la reserva.
 * Los campos email no se muestran: se completan con el email de la cuenta,
 * que es lo que usa /admin/mentorias para mostrar la ficha en cada reserva.
 */
export function MentorshipFormModal({
  email,
  onDone,
  onClose,
}: Readonly<{ email: string; onDone: (answers?: FormAnswers) => void; onClose: () => void }>) {
  const [form, setForm] = useState<PublicForm | null>(null);

  useEffect(() => {
    getPublicForm(FORM_SLUG)
      .then((f) => (f.status === 'closed' ? onDone() : setForm(f)))
      .catch(() => onDone());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='mentorship-form-title'
    >
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} aria-hidden='true' />
      <div className='relative w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar'
          className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-[#FBE8EA]'
        >
          <X className='h-5 w-5' />
        </button>

        {!form ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='h-6 w-6 animate-spin text-[#EBA2A8]' />
          </div>
        ) : (
          <>
            <h2 id='mentorship-form-title' className='font-primary text-xl text-[#2b2b2b] pr-8'>
              {form.title}
            </h2>
            {form.description && (
              <p className='mt-2 text-sm text-[#545454] whitespace-pre-line'>{form.description}</p>
            )}
            <div className='mt-6'>
              <FormRenderer
                fields={(form.fields || []).filter((f) => f.type !== 'email')}
                submitLabel={form.submitLabel || 'Continuar y elegir horario'}
                onSubmit={(answers) => {
                  const emailFields = (form.fields || []).filter((f) => f.type === 'email');
                  onDone({ ...answers, ...Object.fromEntries(emailFields.map((f) => [f.id, email])) });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
