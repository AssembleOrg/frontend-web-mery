'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Hoja inferior en mobile / diálogo centrado en desktop.
 * - Bloquea el scroll del fondo (html + body: iOS Safari ignora solo body).
 * - Cierra con Escape y tocando afuera; esconde el widget de ayuda.
 * - El pie respeta el safe-area del iPhone.
 */
export function Sheet({
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  size = 'md',
}: Readonly<{
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.classList.remove('hide-rag-widget');
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
    >
      <button
        type='button'
        aria-label='Cerrar'
        tabIndex={-1}
        onClick={onClose}
        className='absolute inset-0 bg-black/45 animate-overlay-in'
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex w-full flex-col max-h-[92dvh] sm:max-h-[88dvh] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-card shadow-2xl outline-none animate-sheet-in sm:animate-pop-in ${
          size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md'
        }`}
      >
        {/* Manija (solo mobile) */}
        <div className='sm:hidden flex justify-center pt-2.5' aria-hidden='true'>
          <span className='h-1 w-10 rounded-full bg-[#2B2B2B]/15 dark:bg-white/20' />
        </div>
        <div className='flex items-start gap-3 px-5 pt-3 pb-4 sm:pt-5 border-b border-[#2B2B2B]/8 dark:border-border'>
          {icon && (
            <span className='shrink-0 w-10 h-10 rounded-2xl bg-[#FBE8EA] dark:bg-[#3d2f31] text-[#8b1538] dark:text-[#F9BBC4] flex items-center justify-center'>
              {icon}
            </span>
          )}
          <div className='min-w-0 flex-1 pt-0.5'>
            <h2 id={titleId} className='text-lg font-primary-medium text-[#2B2B2B] dark:text-foreground leading-snug'>
              {title}
            </h2>
            {subtitle && (
              <p className='mt-0.5 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>{subtitle}</p>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className='-mr-2 -mt-1 shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[#2B2B2B]/50 hover:text-[#2B2B2B] hover:bg-[#2B2B2B]/5 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4'>{children}</div>
        {footer && (
          <div className='shrink-0 border-t border-[#2B2B2B]/8 dark:border-border px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4'>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
