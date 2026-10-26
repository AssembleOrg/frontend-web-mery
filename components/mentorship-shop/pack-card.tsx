'use client';

import { Check, Plus } from 'lucide-react';
import { formatPrice, priceIn, type ShopCurrency, type ShopPack } from '@/lib/mentorship-shop-api';
import { QuantityStepper } from './quantity-stepper';

export function PackCard({
  pack,
  currency,
  quantity,
  onAdd,
  onQuantity,
}: Readonly<{
  pack: ShopPack;
  currency: ShopCurrency;
  quantity: number;
  onAdd: () => void;
  onQuantity: (n: number) => void;
}>) {
  const price = priceIn(pack, currency);
  const compare = currency === 'ARS' ? pack.compareARS : pack.compareUSD;
  const saving = price != null && compare != null && compare > price ? compare - price : null;
  const sessions = pack.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <article className='relative flex flex-col overflow-hidden rounded-3xl bg-[#2B2B2B] text-white shadow-[0_18px_40px_-20px_rgba(43,43,43,0.55)] sm:flex-row'>
      {pack.imageUrl && (
        <div className='relative aspect-[16/9] sm:aspect-auto sm:w-[40%] shrink-0'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pack.imageUrl} alt='' loading='lazy' className='absolute inset-0 w-full h-full object-cover' />
        </div>
      )}
      <div className='flex flex-1 flex-col p-5 sm:p-7'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-[11px] uppercase tracking-[0.3em] text-[#EBA2A8]'>
            Pack · {sessions} {sessions === 1 ? 'mentoría' : 'mentorías'}
          </span>
          {saving != null && (
            <span className='rounded-full bg-[#EBA2A8] px-2.5 py-0.5 text-[11px] font-primary-medium text-white'>
              Ahorrás {formatPrice(saving, currency)}
            </span>
          )}
        </div>
        <h3 className='mt-2 text-xl sm:text-2xl font-primary uppercase tracking-[0.14em] leading-snug text-balance'>
          {pack.name}
        </h3>
        {pack.tagline && <p className='mt-2 text-sm leading-relaxed text-white/70 text-pretty'>{pack.tagline}</p>}

        <ul className='mt-4 space-y-2'>
          {pack.items.map((i) => (
            <li key={i.productId} className='flex items-start gap-2.5 text-sm text-white/90'>
              <span className='mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#EBA2A8]/20 text-[#F9BBC4] flex items-center justify-center'>
                <Check className='w-3 h-3' aria-hidden='true' />
              </span>
              <span>
                {i.quantity > 1 && <span className='tabular-nums'>{i.quantity}× </span>}
                {i.name}
              </span>
            </li>
          ))}
        </ul>

        <div className='mt-6 flex flex-wrap items-end justify-between gap-4'>
          <div>
            {compare != null && saving != null && (
              <p className='text-sm text-white/45 line-through tabular-nums'>{formatPrice(compare, currency)}</p>
            )}
            {price != null ? (
              <p className='text-[28px] leading-none font-primary-medium tabular-nums'>{formatPrice(price, currency)}</p>
            ) : (
              <p className='text-sm text-white/60'>
                {currency === 'USD' ? 'Solo se abona en pesos' : 'Solo se abona en dólares'}
              </p>
            )}
          </div>
          {price != null &&
            (quantity > 0 ? (
              <QuantityStepper value={quantity} onChange={onQuantity} label={pack.name} tone='dark' />
            ) : (
              <button
                type='button'
                onClick={onAdd}
                className='inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#EBA2A8] px-6 text-sm font-primary-medium text-white transition-all hover:bg-[#d89196] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B2B2B]'
                aria-label={`Agregar ${pack.name} al carrito`}
              >
                <Plus className='w-4 h-4' aria-hidden='true' /> Agregar pack
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
