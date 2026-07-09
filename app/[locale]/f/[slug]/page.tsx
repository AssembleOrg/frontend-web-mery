'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
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
    <div className='min-h-screen bg-[#eba2a8]'>
      <div className='max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16'>
        {/* Marca */}
        <div className='flex justify-center mb-9 sm:mb-11'>
          <Image
            src='/Img-home/mery-blanco-logo.png'
            alt='Mery García'
            width={150}
            height={45}
            priority
            className='h-10 sm:h-12 w-auto'
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Layout: logos de partners flanqueando el form (solo desktop) — 25% / 50% / 25% */}
        <div className='lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:items-center lg:gap-6 xl:gap-10'>
          {/* Partner izquierda: Anastasia Beverly Hills */}
          <div className='hidden lg:flex justify-center px-2'>
            <Image
              src='/form/anastasia-logo.png'
              alt='Anastasia Beverly Hills'
              width={280}
              height={244}
              className='w-full max-w-[220px] h-auto opacity-95'
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Columna central: el formulario */}
          <div className='w-full'>

        {state === 'loading' && (
          <div className='bg-white rounded-3xl shadow-xl shadow-[#2b2b2b]/10 p-8 space-y-4 animate-pulse'>
            <div className='h-7 bg-[#fbe8ea] rounded w-3/4' />
            <div className='h-4 bg-[#fbe8ea] rounded w-1/2' />
            <div className='h-11 bg-[#fbe8ea] rounded-xl' />
            <div className='h-11 bg-[#fbe8ea] rounded-xl' />
            <div className='h-11 bg-[#fbe8ea] rounded-xl' />
          </div>
        )}

        {state === 'not-found' && (
          <div className='bg-white rounded-3xl shadow-xl shadow-[#2b2b2b]/10 p-10 text-center'>
            <p className='text-lg font-semibold text-[#2b2b2b] mb-1'>Formulario no encontrado</p>
            <p className='text-sm text-[#545454]'>
              El enlace puede estar vencido o ser incorrecto.
            </p>
          </div>
        )}

        {state === 'closed' && form && (
          <div className='bg-white rounded-3xl shadow-xl shadow-[#2b2b2b]/10 p-10 text-center'>
            <div className='mx-auto w-12 h-12 rounded-full bg-[#fbe8ea] flex items-center justify-center mb-4'>
              <Lock className='w-5 h-5 text-[#2b2b2b]' />
            </div>
            <h1 className='font-primary text-xl text-[#2b2b2b] mb-2 tracking-wide'>{form.title}</h1>
            <p className='text-sm text-[#3a3a3a] whitespace-pre-line'>{form.closedMessage}</p>
          </div>
        )}

        {state === 'success' && (
          <div className='bg-white rounded-3xl shadow-xl shadow-[#2b2b2b]/10 p-10 sm:p-12 text-center'>
            <div className='mx-auto w-16 h-16 rounded-full bg-[#fbe8ea] flex items-center justify-center mb-5'>
              <CheckCircle2 className='w-8 h-8 text-[#2b2b2b]' />
            </div>
            <h1 className='font-primary text-2xl sm:text-3xl text-[#2b2b2b] mb-3 tracking-wide'>
              ¡Tu lugar está confirmado!
            </h1>
            <p className='text-sm text-[#3a3a3a] whitespace-pre-line leading-relaxed'>
              {successMessage}
            </p>
          </div>
        )}

        {state === 'ready' && form && (
          <div className='bg-white rounded-3xl shadow-xl shadow-[#2b2b2b]/10 overflow-hidden'>
            {/* Encabezado del formulario */}
            <div className='px-6 sm:px-9 pt-8 pb-6 border-b border-[#fbe8ea]'>
              <h1 className='font-primary text-2xl sm:text-3xl text-[#2b2b2b] leading-tight tracking-wide'>
                {form.title}
              </h1>
              {form.description && (
                <p className='mt-2.5 text-sm text-[#3a3a3a] whitespace-pre-line leading-relaxed'>
                  {form.description}
                </p>
              )}
            </div>

            <div className='px-6 sm:px-9 py-8'>
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
          </div>
          {/* /Columna central */}

          {/* Partner derecha: Juleriaque */}
          <div className='hidden lg:flex justify-center px-2'>
            <Image
              src='/form/juleriaque.png'
              alt='Juleriaque'
              width={280}
              height={280}
              className='w-full max-w-[220px] h-auto opacity-95'
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        {/* /Layout partners */}

        <p className='text-center text-xs text-white/70 mt-9'>
          © {new Date().getFullYear()} Mery García
        </p>
      </div>
    </div>
  );
}
