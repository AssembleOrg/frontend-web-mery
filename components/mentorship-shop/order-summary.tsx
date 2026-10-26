'use client';

import { formatPrice, type ShopOrder } from '@/lib/mentorship-shop-api';

/** Detalle de una compra: renglones, contenido de los packs y totales. */
export function OrderSummary({ order }: Readonly<{ order: ShopOrder }>) {
  return (
    <div>
      <ul className='divide-y divide-[#2B2B2B]/8 dark:divide-border'>
        {order.items.map((i) => (
          <li key={i.id} className='py-3 flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <p className='text-[15px] text-[#2B2B2B] dark:text-foreground leading-snug'>
                {i.quantity > 1 && <span className='tabular-nums'>{i.quantity}× </span>}
                {i.name}
              </p>
              {i.kind === 'PACK' && (
                <p className='mt-0.5 text-xs text-[#2B2B2B]/55 dark:text-muted-foreground'>
                  {i.contents.map((c) => `${c.quantity > 1 ? `${c.quantity}× ` : ''}${c.name}`).join(' · ')}
                </p>
              )}
            </div>
            <span className='shrink-0 text-sm tabular-nums text-[#2B2B2B]/75 dark:text-foreground/80'>
              {formatPrice(i.lineTotal, order.currency)}
            </span>
          </li>
        ))}
      </ul>
      <div className='mt-2 space-y-1.5 border-t border-[#2B2B2B]/8 dark:border-border pt-3 text-sm'>
        {order.discount > 0 && (
          <>
            <div className='flex justify-between text-[#2B2B2B]/60 dark:text-muted-foreground'>
              <span>Subtotal</span>
              <span className='tabular-nums'>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            <div className='flex justify-between gap-4 text-[#8b1538] dark:text-[#F9BBC4]'>
              <span className='min-w-0 truncate'>{order.promoLabel ?? 'Descuento'}</span>
              <span className='shrink-0 tabular-nums'>− {formatPrice(order.discount, order.currency)}</span>
            </div>
          </>
        )}
        <div className='flex items-baseline justify-between pt-1'>
          <span className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>Total</span>
          <span className='text-xl font-primary-medium tabular-nums text-[#2B2B2B] dark:text-foreground'>
            {formatPrice(order.total, order.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
