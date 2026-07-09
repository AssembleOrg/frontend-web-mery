'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import type { FormAnswers, FormField, YesNoAnswer } from '@/lib/forms-api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormRendererProps {
  fields: FormField[];
  submitLabel?: string | null;
  onSubmit: (answers: FormAnswers) => Promise<void> | void;
  submitting?: boolean;
  /** Modo preview: deshabilita el submit real */
  preview?: boolean;
}

const inputClasses =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent transition-shadow';

export function FormRenderer({
  fields,
  submitLabel,
  onSubmit,
  submitting = false,
  preview = false,
}: FormRendererProps) {
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const answerableFields = useMemo(
    () => fields.filter((f) => f.type !== 'info'),
    [fields],
  );

  const setAnswer = (fieldId: string, value: FormAnswers[string]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of answerableFields) {
      const value = answers[field.id];
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        if (field.required) newErrors[field.id] = 'Este campo es obligatorio';
        continue;
      }

      if (field.type === 'email' && typeof value === 'string' && !EMAIL_REGEX.test(value.trim())) {
        newErrors[field.id] = 'Ingresá un email válido';
      }
      if (field.type === 'phone' && typeof value === 'string' && value.replace(/\D/g, '').length < 6) {
        newErrors[field.id] = 'Ingresá un teléfono válido';
      }
    }

    setErrors(newErrors);

    const firstErrorId = Object.keys(newErrors)[0];
    if (firstErrorId) {
      document
        .getElementById(`form-field-${firstErrorId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    if (!validate()) return;
    await onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-6'>
      {fields.map((field) => (
        <div key={field.id} id={`form-field-${field.id}`}>
          {field.type === 'info' ? (
            <InfoBlock field={field} />
          ) : (
            <FieldBlock
              field={field}
              value={answers[field.id]}
              error={errors[field.id]}
              onChange={(v) => setAnswer(field.id, v)}
            />
          )}
        </div>
      ))}

      <button
        type='submit'
        disabled={submitting}
        className='w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#660e1b] text-white text-sm font-semibold tracking-wide hover:bg-[#7a1220] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {submitting && <Loader2 className='w-4 h-4 animate-spin' />}
        {submitLabel || 'Enviar'}
      </button>
    </form>
  );
}

// ============ Bloques ============

function InfoBlock({ field }: { field: FormField }) {
  return (
    <div className='rounded-xl bg-gradient-to-br from-[#FBE8EA] to-[#fdf3f4] border border-[#f9bbc4]/40 px-5 py-4'>
      {field.label && (
        <p className='text-sm font-semibold text-[#660e1b] mb-1'>{field.label}</p>
      )}
      {field.description && (
        <p className='text-sm text-gray-700 whitespace-pre-line leading-relaxed'>
          {field.description}
        </p>
      )}
    </div>
  );
}

function FieldBlock({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: FormAnswers[string] | undefined;
  error?: string;
  onChange: (value: FormAnswers[string]) => void;
}) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-800 mb-1.5'>
        {field.label}
        {field.required && <span className='text-[#EBA2A8] ml-0.5'>*</span>}
      </label>
      {field.description && (
        <p className='text-xs text-gray-500 mb-2 whitespace-pre-line'>{field.description}</p>
      )}

      <FieldInput field={field} value={value} onChange={onChange} hasError={!!error} />

      {error && <p className='mt-1.5 text-xs text-red-500'>{error}</p>}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  hasError,
}: {
  field: FormField;
  value: FormAnswers[string] | undefined;
  onChange: (value: FormAnswers[string]) => void;
  hasError: boolean;
}) {
  const errorClasses = hasError ? ' !border-red-300 ring-1 ring-red-200' : '';

  switch (field.type) {
    case 'text':
      return (
        <input
          type='text'
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClasses + errorClasses}
        />
      );

    case 'email':
      return (
        <input
          type='email'
          inputMode='email'
          autoComplete='email'
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'tu@email.com'}
          className={inputClasses + errorClasses}
        />
      );

    case 'phone':
      return (
        <PhoneInput
          value={(value as string) || ''}
          onChange={(full) => onChange(full)}
          placeholder={field.placeholder || 'Tu número'}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={inputClasses + ' resize-y min-h-[100px]' + errorClasses}
        />
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses + errorClasses}
        >
          <option value=''>{field.placeholder || 'Seleccioná una opción…'}</option>
          {(field.options || []).map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className='space-y-2'>
          {(field.options || []).map((opt) => {
            const selected = value === opt.id;
            return (
              <button
                key={opt.id}
                type='button'
                onClick={() => onChange(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  selected
                    ? 'border-[#EBA2A8] bg-[#FBE8EA] text-[#660e1b] font-medium shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#f9bbc4] hover:bg-[#FBE8EA]/30'
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selected ? 'border-[#660e1b]' : 'border-gray-300'
                  }`}
                >
                  {selected && <span className='w-2 h-2 rounded-full bg-[#660e1b]' />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      );

    case 'checkbox': {
      const selectedIds = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (optId: string) => {
        onChange(
          selectedIds.includes(optId)
            ? selectedIds.filter((id) => id !== optId)
            : [...selectedIds, optId],
        );
      };
      return (
        <div className='space-y-2'>
          {(field.options || []).map((opt) => {
            const selected = selectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type='button'
                onClick={() => toggle(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                  selected
                    ? 'border-[#EBA2A8] bg-[#FBE8EA] text-[#660e1b] font-medium shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#f9bbc4] hover:bg-[#FBE8EA]/30'
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected ? 'border-[#660e1b] bg-[#660e1b]' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <Check className='w-3 h-3 text-white' />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'yesno': {
      const current = value as YesNoAnswer | undefined;
      const setValue = (v: boolean) => {
        onChange({ value: v, ...(current?.context ? { context: current.context } : {}) });
      };
      return (
        <div>
          <div className='grid grid-cols-2 gap-2'>
            {[
              { v: true, label: 'Sí' },
              { v: false, label: 'No' },
            ].map(({ v, label }) => {
              const selected = current?.value === v;
              return (
                <button
                  key={label}
                  type='button'
                  onClick={() => setValue(v)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'border-[#EBA2A8] bg-[#FBE8EA] text-[#660e1b] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#f9bbc4] hover:bg-[#FBE8EA]/30'
                  }`}
                  aria-pressed={selected}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {field.allowContext && current !== undefined && (
            <textarea
              value={current?.context || ''}
              onChange={(e) => onChange({ value: current!.value, context: e.target.value })}
              placeholder={field.contextLabel || '¿Querés contarnos más? (opcional)'}
              rows={2}
              className={inputClasses + ' mt-2 resize-y'}
            />
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
