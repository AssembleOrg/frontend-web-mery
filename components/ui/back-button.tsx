'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Botón "volver" premium: ícono en un contenedor circular aesthetic
 * (reemplaza los "← Volver" de texto). Acepta `href` (Link) u `onClick` (button).
 * Con `label` muestra el texto al lado del ícono; sin él, queda solo el círculo
 * (siempre con aria-label para accesibilidad).
 */
export function BackButton({
  href,
  onClick,
  label,
  ariaLabel = 'Volver',
  className,
}: Readonly<{
  href?: string;
  onClick?: () => void;
  label?: string;
  ariaLabel?: string;
  className?: string;
}>) {
  const circle = (
    <span className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-foreground/70 group-hover:text-foreground group-hover:bg-muted transition-colors'>
      <ChevronLeft className='w-5 h-5' />
    </span>
  );

  const inner = (
    <>
      {circle}
      {label && <span className='text-sm font-primary-medium text-foreground/80 group-hover:text-foreground'>{label}</span>}
    </>
  );

  const cls = cn(
    'group inline-flex items-center gap-2 rounded-full transition-all active:scale-95',
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type='button' onClick={onClick} aria-label={ariaLabel} className={cls}>
      {inner}
    </button>
  );
}
