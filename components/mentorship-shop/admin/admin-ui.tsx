'use client';

import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { shopApi } from '@/lib/mentorship-shop-api';

// Inputs a 16 px en mobile: con menos, iOS hace zoom al enfocar.
export const inputCls =
  'w-full h-11 rounded-xl border border-border bg-background px-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[#EBA2A8] focus:outline-none focus:ring-2 focus:ring-[#EBA2A8]/25 disabled:opacity-50';

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: Readonly<{ label: string; hint?: string; children: ReactNode; htmlFor?: string }>) {
  return (
    <div>
      <label htmlFor={htmlFor} className='mb-1 block text-xs font-medium text-muted-foreground'>
        {label}
      </label>
      {children}
      {hint && <p className='mt-1 text-[11px] leading-snug text-muted-foreground'>{hint}</p>}
    </div>
  );
}

export function TextInput(props: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

/** Monto opcional: '' = sin precio en esa moneda. */
export function MoneyInput({
  id,
  value,
  onChange,
  currency,
}: Readonly<{ id?: string; value: string; onChange: (v: string) => void; currency: 'ARS' | 'USD' }>) {
  return (
    <div className='relative'>
      <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
        {currency === 'ARS' ? '$' : 'USD'}
      </span>
      <input
        id={id}
        inputMode='decimal'
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        placeholder='Sin precio'
        className={`${inputCls} tabular-nums ${currency === 'ARS' ? 'pl-7' : 'pl-12'}`}
      />
    </div>
  );
}

/** '150.000' / '150000' / '99,5' → número; '' → null. Lanza si no es válido. */
export function parseMoney(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  // Si hay coma, es el decimal (formato AR): los puntos son miles.
  const normalized = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, '') : t;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Monto inválido: ${v}`);
  return Math.round(n * 100) / 100;
}

export const moneyToInput = (n: number | null) => (n == null ? '' : String(n));

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: Readonly<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}>) {
  const id = useId();
  return (
    <div className='flex items-start justify-between gap-4'>
      <label htmlFor={id} className='min-w-0 cursor-pointer'>
        <span className='block text-sm font-medium text-foreground'>{label}</span>
        {description && <span className='block mt-0.5 text-xs leading-snug text-muted-foreground'>{description}</span>}
      </label>
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBA2A8] focus-visible:ring-offset-2 ${
          checked ? 'bg-[#EBA2A8]' : 'bg-[#2B2B2B]/15 dark:bg-white/15'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function ImageField({
  value,
  onChange,
  label = 'Imagen',
}: Readonly<{ value: string | null; onChange: (url: string | null) => void; label?: string }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen pesa más de 5 MB');
      return;
    }
    setUploading(true);
    try {
      const { url } = await shopApi.adminUploadImage(file);
      onChange(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint='JPG, PNG o WEBP. Se ve en formato 4:3. Si no hay, se usa el fondo oscuro con el nombre.'>
      <div className='flex items-center gap-3'>
        <div className='relative w-24 aspect-[4/3] shrink-0 overflow-hidden rounded-xl bg-[#2B2B2B] ring-1 ring-border'>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt='' className='w-full h-full object-cover' />
          ) : (
            <span className='absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.3em] text-[#EBA2A8]'>MG</span>
          )}
          {uploading && (
            <span className='absolute inset-0 flex items-center justify-center bg-black/50'>
              <Loader2 className='w-5 h-5 animate-spin text-white' />
            </span>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className='inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-foreground hover:border-[#EBA2A8] disabled:opacity-50'
          >
            <ImagePlus className='w-4 h-4 text-[#EBA2A8]' /> {value ? 'Cambiar' : 'Subir'}
          </button>
          {value && (
            <button
              type='button'
              onClick={() => onChange(null)}
              className='inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground'
            >
              <X className='w-4 h-4' /> Quitar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className='hidden'
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </div>
    </Field>
  );
}

export function EmptyState({ icon, title, text }: Readonly<{ icon: ReactNode; title: string; text: string }>) {
  return (
    <div className='rounded-2xl border border-dashed border-border py-12 px-6 text-center'>
      <div className='mx-auto mb-3 w-fit text-muted-foreground/50'>{icon}</div>
      <p className='text-sm font-medium text-foreground'>{title}</p>
      <p className='mt-1 text-xs text-muted-foreground'>{text}</p>
    </div>
  );
}

export const primaryBtn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2B2B2B] px-4 text-sm font-medium text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 dark:bg-[#F9BBC4] dark:text-[#2B2B2B]';
export const ghostBtn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm text-foreground transition-colors hover:border-[#EBA2A8] disabled:opacity-50';
