'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Loader2, CalendarClock, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  mentorshipApi,
  type MentorshipProduct,
  type MentorshipVariant,
} from '@/lib/mentorship-api';
import { BankTransferModal } from '@/components/bank-transfer-modal';

interface Props {
  /** Si viene, filtra los productos de ese curso (más los genéricos sin curso). */
  categoryId?: string;
  onClose: () => void;
}

function formatAmount(v: MentorshipVariant): string {
  const n = Math.round(Number(v.amount));
  return v.currency === 'USD'
    ? `USD ${n.toLocaleString('en-US')}`
    : `$${n.toLocaleString('es-AR')}`;
}

export function MentorshipPurchaseModal({ categoryId, onClose }: Readonly<Props>) {
  const [products, setProducts] = useState<MentorshipProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<{
    currency: 'ARS' | 'USD';
    amount: string;
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await mentorshipApi.products();
      // Primero los del curso actual (o genéricos); si el curso no tiene
      // productos propios, mostramos todos igual.
      const own = categoryId
        ? all.filter((p) => !p.categoryId || p.categoryId === categoryId)
        : [];
      const rest = all.filter((p) => !own.includes(p));
      setProducts(own.length > 0 ? [...own, ...rest] : all);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickVariant = (p: MentorshipProduct, v: MentorshipVariant) => {
    const amount = formatAmount(v);
    setTransfer({
      currency: v.currency,
      amount,
      message: `Hola! Quiero comprar: ${p.name} (${v.label} · ${amount}). Adjunto el comprobante de transferencia.`,
    });
  };

  return (
    <>
      <div
        className='fixed inset-0 z-[70] flex items-center justify-center p-4'
        role='dialog'
        aria-modal='true'
      >
        <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
        <div className='relative z-[75] w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-2xl'>
          <div className='sticky top-0 flex items-center justify-between border-b border-border bg-white dark:bg-[#1c1c1e] px-5 py-4'>
            <h2 className='text-base font-semibold text-foreground'>
              Comprar mentoría / clase
            </h2>
            <button
              onClick={onClose}
              aria-label='Cerrar'
              className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='px-5 py-4 space-y-4'>
            {loading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : products.length === 0 ? (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                No hay productos disponibles por ahora.
              </p>
            ) : (
              products.map((p) => (
                <div key={p.id} className='rounded-xl border border-border p-4'>
                  <div className='flex items-center gap-2'>
                    {p.type === 'ONE_TO_ONE' ? (
                      <GraduationCap className='h-4 w-4 text-[#EBA2A8]' />
                    ) : (
                      <CalendarClock className='h-4 w-4 text-[#EBA2A8]' />
                    )}
                    <p className='text-sm font-semibold text-foreground'>{p.name}</p>
                  </div>
                  {p.description && (
                    <p className='mt-1 text-xs text-muted-foreground'>{p.description}</p>
                  )}
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {p.variants.map((v) => (
                      <button
                        key={v.id}
                        type='button'
                        onClick={() => pickVariant(p, v)}
                        className='rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-[#EBA2A8]'
                      >
                        <span className='text-muted-foreground'>{v.label}:</span>{' '}
                        <span className='font-semibold'>{formatAmount(v)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            <p className='text-[11px] leading-relaxed text-muted-foreground'>
              El pago es por transferencia (o efectivo, coordinando). Elegí una
              opción, transferí y envianos el comprobante por WhatsApp. Validamos el
              pago y habilitamos tu mentoría/clase manualmente.
            </p>
          </div>
        </div>
      </div>

      <BankTransferModal
        isOpen={!!transfer}
        onClose={() => setTransfer(null)}
        currency={transfer?.currency ?? 'ARS'}
        amount={transfer?.amount}
        whatsappMessage={transfer?.message}
      />
    </>
  );
}
