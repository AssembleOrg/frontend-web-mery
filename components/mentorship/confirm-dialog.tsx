'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Diálogo de confirmación premium (reemplaza el confirm() nativo).
 * Bloquea scroll, esconde el bot externo y cierra con Escape / backdrop.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  destructive = false,
  onConfirm,
  onClose,
}: Readonly<{
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Puede ser async: mostramos spinner hasta que resuelve. */
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}>) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('hide-rag-widget');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, busy]);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button
        type='button'
        aria-label='Cerrar'
        onClick={() => !busy && onClose()}
        className='absolute inset-0 bg-black/50'
      />
      <div className='relative w-full sm:max-w-sm bg-[#1c1c1e] text-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5'>
        <div className='flex items-start gap-3'>
          <span
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              destructive ? 'bg-red-500/15' : 'bg-white/10'
            }`}
          >
            <AlertTriangle
              className={`w-[18px] h-[18px] ${destructive ? 'text-red-400' : 'text-[#EBA2A8]'}`}
            />
          </span>
          <div className='min-w-0'>
            <h3 className='font-semibold leading-tight'>{title}</h3>
            {description && (
              <p className='mt-1.5 text-sm text-white/60'>{description}</p>
            )}
          </div>
        </div>

        <div className='mt-5 flex gap-2'>
          <button
            type='button'
            onClick={() => !busy && onClose()}
            disabled={busy}
            className='flex-1 py-2.5 rounded-lg border border-white/15 text-sm font-medium text-white/80 hover:text-white hover:border-white/30 disabled:opacity-50 transition-colors'
          >
            {cancelLabel}
          </button>
          <button
            type='button'
            onClick={() => void handleConfirm()}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors ${
              destructive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-[#1c1c1e] hover:bg-white/90'
            }`}
          >
            {busy && <Loader2 className='w-4 h-4 animate-spin' />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
