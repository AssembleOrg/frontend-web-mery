'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Loader2, Receipt, Search, X } from 'lucide-react';
import {
  formatPrice,
  ORDER_STATUS_LABEL,
  shopApi,
  type AdminShopOrder,
  type ShopOrderStatus,
} from '@/lib/mentorship-shop-api';
import { Sheet } from '@/components/mentorship-shop/sheet';
import { EmptyState, Field, ghostBtn, inputCls, primaryBtn } from './admin-ui';

const FILTERS: { value: ShopOrderStatus | ''; label: string }[] = [
  { value: 'PENDING', label: 'Para validar' },
  { value: 'PAID', label: 'Pagadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: '', label: 'Todas' },
];

const STATUS_CHIP: Record<ShopOrderStatus, string> = {
  PENDING: 'bg-[#FBE8EA] text-[#8b1538] dark:bg-[#3d2f31] dark:text-[#F9BBC4]',
  PAID: 'bg-[#2B2B2B] text-white dark:bg-white/10',
  REJECTED: 'bg-[#5c0e24]/10 text-[#5c0e24] dark:text-[#F9BBC4]',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  });

const fullName = (u: AdminShopOrder['user']) =>
  [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;

export function OrdersTab({ onPendingCount }: Readonly<{ onPendingCount: (n: number) => void }>) {
  const [status, setStatus] = useState<ShopOrderStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<AdminShopOrder[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [review, setReview] = useState<{ order: AdminShopOrder; action: 'approve' | 'reject' } | null>(null);

  const load = useCallback(
    async (p = 1) => {
      const res = await shopApi.adminOrders({ status: status || undefined, search: query || undefined, page: p });
      setOrders((prev) => (p === 1 ? res.orders : [...(prev ?? []), ...res.orders]));
      setPage(p);
      setTotal(res.total);
      onPendingCount(res.pendingCount);
    },
    [status, query, onPendingCount],
  );

  useEffect(() => {
    setOrders(null);
    load(1).catch((e: Error) => {
      toast.error(e.message);
      setOrders([]);
    });
  }, [load]);

  // Buscar al dejar de tipear.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const more = async () => {
    setLoadingMore(true);
    try {
      await load(page + 1);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto [scrollbar-width:none]'>
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type='button'
              onClick={() => setStatus(f.value)}
              className={`shrink-0 min-h-9 rounded-full px-3.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? 'bg-[#2B2B2B] text-white dark:bg-[#F9BBC4] dark:text-[#2B2B2B]'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className='relative sm:ml-auto sm:w-64'>
          <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Nombre, email o #número'
            aria-label='Buscar compras'
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {orders === null ? (
        <div className='flex justify-center py-16'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt className='w-9 h-9' />}
          title={status === 'PENDING' ? 'No hay pagos para validar' : 'No hay compras'}
          text={status === 'PENDING' ? 'Cuando alguien pague por transferencia, efectivo o USD aparece acá.' : 'Probá con otro filtro.'}
        />
      ) : (
        <div className='space-y-3'>
          {orders.map((o) => (
            <article key={o.id} className='rounded-2xl border border-border bg-white dark:bg-card p-4'>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-foreground'>
                    #{o.number} · {fullName(o.user)}
                  </p>
                  <p className='text-xs text-muted-foreground break-all'>{o.user.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_CHIP[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </div>
              <ul className='mt-3 space-y-0.5 text-sm text-foreground'>
                {o.items.map((i) => (
                  <li key={i.id}>
                    {i.quantity}× {i.name}
                    {i.kind === 'PACK' && (
                      <span className='text-xs text-muted-foreground'> ({i.contents.map((c) => c.name).join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                <span className='text-base font-semibold tabular-nums text-foreground'>{formatPrice(o.total, o.currency)}</span>
                <span>{o.paymentMethodLabel}</span>
                {o.promoLabel && <span className='text-[#8b1538] dark:text-[#F9BBC4]'>{o.promoLabel}</span>}
                <span>{fmtDateTime(o.createdAt)}</span>
                {o.mpPaymentId && <span>MP #{o.mpPaymentId}</span>}
                {o.status === 'PAID' && <span>{o.creditsCount} créditos</span>}
              </div>
              {o.adminNote && (
                <p
                  className={`mt-3 rounded-lg px-3 py-2 text-xs ${
                    o.adminNote.startsWith('⚠️')
                      ? 'bg-[#FBE8EA] text-[#8b1538] dark:bg-[#3d2f31] dark:text-[#F9BBC4]'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {o.adminNote}
                </p>
              )}
              {o.status === 'PENDING' && (
                <div className='mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end'>
                  <button type='button' onClick={() => setReview({ order: o, action: 'reject' })} className={ghostBtn}>
                    <X className='w-4 h-4' /> Rechazar
                  </button>
                  <button type='button' onClick={() => setReview({ order: o, action: 'approve' })} className={primaryBtn}>
                    <Check className='w-4 h-4 text-[#EBA2A8] dark:text-[#2B2B2B]' /> Aprobar
                  </button>
                </div>
              )}
            </article>
          ))}
          {orders.length < total && (
            <button type='button' onClick={() => void more()} disabled={loadingMore} className={`${ghostBtn} w-full`}>
              {loadingMore && <Loader2 className='w-4 h-4 animate-spin' />} Ver más
            </button>
          )}
        </div>
      )}

      {review && (
        <ReviewSheet
          order={review.order}
          action={review.action}
          onClose={() => setReview(null)}
          onDone={(updated) => {
            setReview(null);
            setOrders((prev) =>
              (prev ?? [])
                .map((x) => (x.id === updated.id ? updated : x))
                .filter((x) => !status || x.status === status),
            );
            void load(1).catch(() => undefined);
          }}
        />
      )}
    </div>
  );
}

function ReviewSheet({
  order,
  action,
  onClose,
  onDone,
}: Readonly<{
  order: AdminShopOrder;
  action: 'approve' | 'reject';
  onClose: () => void;
  onDone: (o: AdminShopOrder) => void;
}>) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const approve = action === 'approve';
  const credits = order.items.reduce(
    (s, i) => s + i.quantity * i.contents.reduce((t, c) => t + c.quantity, 0),
    0,
  );

  const submit = async () => {
    setSaving(true);
    try {
      const updated = approve
        ? await shopApi.adminApprove(order.id, note.trim() || undefined)
        : await shopApi.adminReject(order.id, note.trim() || undefined);
      toast.success(approve ? `Compra #${order.number} aprobada` : `Compra #${order.number} rechazada`);
      onDone(updated);
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <Sheet
      title={approve ? `Aprobar compra #${order.number}` : `Rechazar compra #${order.number}`}
      subtitle={`${fullName(order.user)} · ${formatPrice(order.total, order.currency)}`}
      icon={approve ? <Check className='w-5 h-5' /> : <AlertTriangle className='w-5 h-5' />}
      onClose={onClose}
      footer={
        <div className='grid grid-cols-2 gap-2'>
          <button type='button' onClick={onClose} className={ghostBtn}>
            Volver
          </button>
          <button type='button' onClick={() => void submit()} disabled={saving} className={primaryBtn}>
            {saving && <Loader2 className='w-4 h-4 animate-spin' />}
            {approve ? 'Aprobar' : 'Rechazar'}
          </button>
        </div>
      }
    >
      <p className='text-sm leading-relaxed text-foreground/80'>
        {approve
          ? `Confirmá que el pago de ${formatPrice(order.total, order.currency)} (${order.paymentMethodLabel}) ya está acreditado. Se habilitan ${credits} ${credits === 1 ? 'mentoría' : 'mentorías'} y le avisamos.`
          : 'La compra queda rechazada y le avisamos que no pudimos validar el pago. No se habilita nada.'}
      </p>
      {order.adminNote?.startsWith('⚠️') && (
        <p className='mt-3 rounded-lg bg-[#FBE8EA] dark:bg-[#3d2f31] px-3 py-2 text-xs text-[#8b1538] dark:text-[#F9BBC4]'>
          {order.adminNote}
        </p>
      )}
      <div className='mt-4'>
        <Field label={approve ? 'Nota interna (opcional)' : 'Motivo (se lo mostramos a la alumna)'} htmlFor='review-note'>
          <textarea
            id='review-note'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={approve ? 'Ej: transferencia Galicia 26/10' : 'Ej: no encontramos la transferencia'}
            className={`${inputCls} h-auto py-2.5 resize-none`}
          />
        </Field>
      </div>
    </Sheet>
  );
}
