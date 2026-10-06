'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Loader2, X } from 'lucide-react';
import { FormRenderer } from '@/components/forms/form-renderer';
import {
  getPublicForm,
  submitFormResponse,
  type FormAnswers,
  type FormField,
  type PublicForm,
} from '@/lib/forms-api';
import { claimNewCourseCoupon, type NewCourseCoupon } from '@/lib/rewards-api';

/** Slug del formulario creado desde /admin/formularios. */
const FORM_SLUG = 'mentoria';

/**
 * Pregunta "¿con qué nuevo curso...?": debajo va el aviso del cupón. Se busca
 * por id y, si el admin rehízo el campo, por el texto de la pregunta.
 */
const NEW_COURSE_FIELD_ID = '78e7bf34-1584-47d8-9b76-ef74680194f3';
const isNewCourseField = (f: FormField) =>
  f.id === NEW_COURSE_FIELD_ID || /nuevo curso/i.test(f.label);

function CouponNotice() {
  return (
    <div className='mt-3'>
      <p className='text-sm font-semibold text-[#d4787f]'>
        Reclamar mi cupón 20% OFF para mi nueva formación{' '}
        <span className='font-normal'>(válido por tres meses)</span>
      </p>
      <p className='mt-1 text-xs text-[#545454]'>No acumulable con otras promociones</p>
    </div>
  );
}

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
  const [claiming, setClaiming] = useState(false);
  // Respuestas guardadas mientras se muestra el cupón; se entregan al continuar.
  const [pending, setPending] = useState<FormAnswers | null>(null);
  const [coupon, setCoupon] = useState<NewCourseCoupon | null>(null);
  const [copied, setCopied] = useState(false);

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

        {coupon && pending ? (
          <div className='text-center'>
            <p className='text-[11px] uppercase tracking-[0.2em] text-[#d4787f]'>
              {coupon.alreadyClaimed ? 'Tu cupón' : 'Cupón reclamado'}
            </p>
            <h2 className='font-primary text-xl text-[#2b2b2b] mt-1'>
              20% OFF para tu nueva formación
            </h2>
            <button
              type='button'
              onClick={() => {
                void navigator.clipboard?.writeText(coupon.code);
                setCopied(true);
              }}
              className='mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[#EBA2A8] bg-[#FBE8EA] px-5 py-3 font-mono text-lg font-semibold tracking-wider text-[#8b1538]'
              aria-label={`Copiar el código ${coupon.code}`}
            >
              {coupon.code}
              {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
            </button>
            <p className='mt-3 text-sm text-[#545454]'>
              Válido hasta el{' '}
              {new Date(coupon.validTo).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
              . Un solo uso, para una formación que todavía no tengas.
            </p>
            <p className='mt-1 text-xs text-[#545454]'>No acumulable con otras promociones</p>
            <p className='mt-4 text-xs text-[#545454]'>
              Guardalo: lo usás en el checkout, en el campo de cupón.
            </p>
            <button
              type='button'
              onClick={() => onDone(pending)}
              className='mt-6 w-full rounded-xl bg-[#2b2b2b] px-6 py-4 text-sm font-semibold tracking-wide text-white hover:bg-black'
            >
              Continuar y elegir horario
            </button>
          </div>
        ) : !form ? (
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
                submitting={claiming}
                renderAfterField={(f) => (isNewCourseField(f) ? <CouponNotice /> : null)}
                onSubmit={async (answers) => {
                  const emailFields = (form.fields || []).filter((f) => f.type === 'email');
                  const full = {
                    ...answers,
                    ...Object.fromEntries(emailFields.map((f) => [f.id, email])),
                  };
                  // El cupón no debe frenar la reserva: si falla, se sigue igual.
                  setClaiming(true);
                  try {
                    setCoupon(await claimNewCourseCoupon());
                    setPending(full);
                  } catch {
                    onDone(full);
                  } finally {
                    setClaiming(false);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
