'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Lock } from 'lucide-react';
import { FormRenderer } from '@/components/forms/form-renderer';
import {
  getPublicForm,
  submitFormResponse,
  FormsApiError,
  type FormAnswers,
  type PublicForm,
} from '@/lib/forms-api';

type PageState = 'loading' | 'ready' | 'closed' | 'not-found' | 'success';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchForm = useCallback(async () => {
    try {
      const data = await getPublicForm(slug);
      setForm(data);
      setState(data.status === 'closed' ? 'closed' : 'ready');
    } catch {
      setState('not-found');
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchForm();
  }, [slug, fetchForm]);

  const handleSubmit = async (answers: FormAnswers) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitFormResponse(slug, answers);
      setSuccessMessage(result.message || form?.successMessage || '¡Gracias! Recibimos tu respuesta.');
      setState('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(
        error instanceof FormsApiError
          ? error.message
          : 'No pudimos enviar tu respuesta. Intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#fdf3f4] via-white to-[#fdf3f4]'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14'>
        {/* Marca */}
        <div className='text-center mb-8'>
          <p className='font-primary text-2xl sm:text-3xl text-[#660e1b] tracking-wide'>
            Mery García
          </p>
          <div className='mt-2 mx-auto w-16 h-0.5 bg-[#f9bbc4] rounded-full' />
        </div>

        {state === 'loading' && (
          <div className='bg-white rounded-2xl border border-[#f9bbc4]/30 shadow-sm p-8 space-y-4 animate-pulse'>
            <div className='h-7 bg-gray-100 rounded w-3/4' />
            <div className='h-4 bg-gray-100 rounded w-1/2' />
            <div className='h-10 bg-gray-100 rounded' />
            <div className='h-10 bg-gray-100 rounded' />
            <div className='h-10 bg-gray-100 rounded' />
          </div>
        )}

        {state === 'not-found' && (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center'>
            <p className='text-lg font-semibold text-gray-800 mb-1'>Formulario no encontrado</p>
            <p className='text-sm text-gray-500'>
              El enlace puede estar vencido o ser incorrecto.
            </p>
          </div>
        )}

        {state === 'closed' && form && (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center'>
            <div className='mx-auto w-12 h-12 rounded-full bg-[#FBE8EA] flex items-center justify-center mb-4'>
              <Lock className='w-5 h-5 text-[#660e1b]' />
            </div>
            <h1 className='text-lg font-semibold text-gray-800 mb-2'>{form.title}</h1>
            <p className='text-sm text-gray-500 whitespace-pre-line'>{form.closedMessage}</p>
          </div>
        )}

        {state === 'success' && (
          <div className='bg-white rounded-2xl border border-[#f9bbc4]/40 shadow-sm p-10 text-center'>
            <div className='mx-auto w-14 h-14 rounded-full bg-[#FBE8EA] flex items-center justify-center mb-4'>
              <CheckCircle2 className='w-7 h-7 text-[#660e1b]' />
            </div>
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>¡Registro enviado!</h1>
            <p className='text-sm text-gray-600 whitespace-pre-line leading-relaxed'>
              {successMessage}
            </p>
          </div>
        )}

        {state === 'ready' && form && (
          <div className='bg-white rounded-2xl border border-[#f9bbc4]/30 shadow-sm overflow-hidden'>
            {/* Encabezado del formulario */}
            <div className='px-6 sm:px-8 pt-7 pb-5 border-b border-[#FBE8EA]'>
              <h1 className='text-xl sm:text-2xl font-semibold text-gray-900 leading-snug'>
                {form.title}
              </h1>
              {form.description && (
                <p className='mt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed'>
                  {form.description}
                </p>
              )}
            </div>

            <div className='px-6 sm:px-8 py-7'>
              <FormRenderer
                fields={form.fields || []}
                submitLabel={form.submitLabel}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
              {submitError && (
                <p className='mt-4 text-sm text-red-500 text-center'>{submitError}</p>
              )}
            </div>
          </div>
        )}

        <p className='text-center text-xs text-gray-400 mt-8'>
          © {new Date().getFullYear()} Mery García
        </p>
      </div>
    </div>
  );
}
