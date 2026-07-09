'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
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
  'w-full px-4 py-3 rounded-xl border border-[#f7cbcb]/70 bg-white text-sm text-[#2b2b2b] placeholder:text-[#545454]/50 focus:outline-none focus:ring-2 focus:ring-[#eba2a8] focus:border-transparent transition-shadow';

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
        className='w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#2b2b2b] text-white text-sm font-semibold tracking-wide hover:bg-black active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {submitting && <Loader2 className='w-4 h-4 animate-spin' />}
        {submitLabel || 'Confirmar mi lugar'}
      </button>
    </form>
  );
}

// ============ Bloques ============

/**
 * Reconoce líneas con marcadores (emoji o palabra clave) para renderizarlas
 * como filas con ícono. La línea de ubicación se convierte en link a Google Maps.
 */
type InfoLineKind = 'date' | 'location' | 'time' | 'text';

function classifyInfoLine(raw: string): { kind: InfoLineKind; text: string } {
  const line = raw.trim();
  const lower = line.toLowerCase();
  // Quita emoji/símbolo inicial para dejar el texto limpio
  const stripLead = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, '').trim();

  if (line.startsWith('📅') || /\b(fecha|d[ií]a|viernes|lunes|martes|mi[eé]rcoles|jueves|s[aá]bado|domingo)\b/.test(lower)) {
    return { kind: 'date', text: stripLead(line) };
  }
  if (line.startsWith('📍') || line.startsWith('🗺') || /\b(cabildo|direcci[oó]n|ubicaci[oó]n|caba|av\.|avenida|calle)\b/.test(lower)) {
    return { kind: 'location', text: stripLead(line) };
  }
  if (line.startsWith('🕐') || line.startsWith('⏰') || /\b(hs|horario|hora)\b/.test(lower)) {
    return { kind: 'time', text: stripLead(line) };
  }
  return { kind: 'text', text: line };
}

function InfoLineIcon({ kind }: { kind: InfoLineKind }) {
  const cls = 'w-4 h-4 text-[#2b2b2b] flex-shrink-0 mt-0.5';
  if (kind === 'date') return <Calendar className={cls} />;
  if (kind === 'location') return <MapPin className={cls} />;
  if (kind === 'time') return <Clock className={cls} />;
  return null;
}

function InfoBlock({ field }: { field: FormField }) {
  const lines = (field.description || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map(classifyInfoLine);

  const structured = lines.some((l) => l.kind !== 'text');

  return (
    <div className='rounded-2xl bg-[#fbe8ea] border border-[#f7cbcb]/60 px-5 py-4'>
      {field.label && (
        <p className='text-[13px] font-semibold uppercase tracking-wider text-[#2b2b2b] mb-3'>
          {field.label}
        </p>
      )}

      {structured ? (
        <ul className='space-y-2.5'>
          {lines.map((line, i) => {
            if (line.kind === 'location') {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line.text)}`;
              return (
                <li key={i}>
                  <a
                    href={mapsUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group flex items-start gap-2.5 text-sm text-[#2b2b2b] font-medium hover:text-black transition-colors'
                  >
                    <InfoLineIcon kind='location' />
                    <span className='underline decoration-[#eba2a8] decoration-2 underline-offset-2'>
                      {line.text}
                    </span>
                    <ExternalLink className='w-3.5 h-3.5 text-[#545454] flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity' />
                  </a>
                </li>
              );
            }
            return (
              <li key={i} className='flex items-start gap-2.5 text-sm text-[#2b2b2b] font-medium'>
                <InfoLineIcon kind={line.kind} />
                <span>{line.text}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        field.description && (
          <p className='text-sm text-[#3a3a3a] whitespace-pre-line leading-relaxed'>
            {field.description}
          </p>
        )
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
      <label className='block text-sm font-medium text-[#2b2b2b] mb-1.5'>
        {field.label}
        {field.required && <span className='text-[#eba2a8] ml-0.5'>*</span>}
      </label>
      {field.description && (
        <p className='text-[13px] text-[#3a3a3a] mb-2 whitespace-pre-line'>{field.description}</p>
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
                    ? 'border-[#eba2a8] bg-[#fbe8ea] text-[#2b2b2b] font-medium shadow-sm'
                    : 'border-[#f7cbcb]/70 bg-white text-[#3a3a3a] hover:border-[#eba2a8] hover:bg-[#fbe8ea]/40'
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selected ? 'border-[#2b2b2b]' : 'border-[#f7cbcb]'
                  }`}
                >
                  {selected && <span className='w-2 h-2 rounded-full bg-[#2b2b2b]' />}
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
                    ? 'border-[#eba2a8] bg-[#fbe8ea] text-[#2b2b2b] font-medium shadow-sm'
                    : 'border-[#f7cbcb]/70 bg-white text-[#3a3a3a] hover:border-[#eba2a8] hover:bg-[#fbe8ea]/40'
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected ? 'border-[#2b2b2b] bg-[#2b2b2b]' : 'border-[#f7cbcb] bg-white'
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
                      ? 'border-[#eba2a8] bg-[#fbe8ea] text-[#2b2b2b] shadow-sm'
                      : 'border-[#f7cbcb]/70 bg-white text-[#3a3a3a] hover:border-[#eba2a8] hover:bg-[#fbe8ea]/40'
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
