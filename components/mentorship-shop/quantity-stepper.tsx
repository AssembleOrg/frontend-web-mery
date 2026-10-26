'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { MAX_LINE_QTY } from '@/stores/mentorship-cart-store';

/** − cantidad +, con áreas táctiles de 44 px. En 1, el "−" pasa a quitar. */
export function QuantityStepper({
  value,
  onChange,
  label,
  tone = 'light',
  size = 'md',
}: Readonly<{
  value: number;
  onChange: (n: number) => void;
  /** Para lectores de pantalla: "Mentoría Módulo 1". */
  label: string;
  tone?: 'light' | 'dark';
  size?: 'md' | 'sm';
}>) {
  const dark = tone === 'dark';
  const btn = `flex items-center justify-center rounded-full transition-colors disabled:opacity-35 ${
    size === 'sm' ? 'w-9 h-9' : 'w-11 h-11'
  } ${
    dark
      ? 'text-white hover:bg-white/10 active:bg-white/15'
      : 'text-[#2B2B2B] dark:text-foreground hover:bg-[#2B2B2B]/5 active:bg-[#2B2B2B]/10 dark:hover:bg-muted'
  }`;
  return (
    <div
      className={`inline-flex items-center rounded-full ${
        dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-white dark:bg-card ring-1 ring-[#2B2B2B]/12 dark:ring-border'
      }`}
      role='group'
      aria-label={`Cantidad de ${label}`}
    >
      <button
        type='button'
        className={btn}
        onClick={() => onChange(value - 1)}
        aria-label={value === 1 ? `Quitar ${label}` : `Restar uno: ${label}`}
      >
        {value === 1 ? <Trash2 className='w-4 h-4' /> : <Minus className='w-4 h-4' />}
      </button>
      <span
        className={`min-w-7 text-center text-base tabular-nums font-primary-medium ${
          dark ? 'text-white' : 'text-[#2B2B2B] dark:text-foreground'
        }`}
        aria-live='polite'
      >
        {value}
      </span>
      <button
        type='button'
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_LINE_QTY}
        aria-label={`Sumar uno: ${label}`}
      >
        <Plus className='w-4 h-4' />
      </button>
    </div>
  );
}
