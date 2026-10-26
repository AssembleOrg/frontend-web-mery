'use client';

import { Clock, Plus, Users } from 'lucide-react';
import {
  durationLabel,
  formatPrice,
  priceIn,
  type ShopCurrency,
  type ShopProduct,
  type ShopPromo,
} from '@/lib/mentorship-shop-api';
import { QuantityStepper } from './quantity-stepper';

/** Portada: la foto si hay; si no, el tile oscuro de las formaciones. */
export function ShopCover({
  name,
  imageUrl,
  compact = false,
  className = '',
}: Readonly<{
  name: string;
  imageUrl: string | null;
  /** Miniatura: solo el monograma MG. */
  compact?: boolean;
  className?: string;
}>) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=''
        loading='lazy'
        decoding='async'
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  if (compact) {
    return (
      <div className={`w-full h-full bg-[#2B2B2B] flex items-center justify-center ${className}`} aria-hidden='true'>
        <span className='text-[11px] font-primary uppercase tracking-[0.3em] pl-[0.3em] text-[#EBA2A8]'>MG</span>
      </div>
    );
  }
  return (
    <div
      className={`w-full h-full bg-[#2B2B2B] flex flex-col items-center justify-center px-5 text-center ${className}`}
    >
      <span className='text-white text-[13px] sm:text-sm font-primary uppercase tracking-[0.28em] leading-relaxed text-balance'>
        {name}
      </span>
      <span className='mt-2 text-[9px] uppercase tracking-[0.35em] text-[#EBA2A8]'>Mery García</span>
    </div>
  );
}

export function ProductCard({
  product,
  currency,
  promos,
  quantity,
  onAdd,
  onQuantity,
}: Readonly<{
  product: ShopProduct;
  currency: ShopCurrency;
  promos: ShopPromo[];
  quantity: number;
  onAdd: () => void;
  onQuantity: (n: number) => void;
}>) {
  const price = priceIn(product, currency);
  const promo = promos.find((p) => p.appliesToAll || p.productIds.includes(product.id));
  const duration = durationLabel(product.durationMin);
  const isOneToOne = product.type === 'ONE_TO_ONE';

  return (
    <article className='group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border shadow-[0_1px_2px_rgba(43,43,43,0.04)] transition-shadow hover:shadow-[0_12px_32px_-12px_rgba(43,43,43,0.22)]'>
      <div className='relative aspect-[4/3] overflow-hidden'>
        <ShopCover name={product.name} imageUrl={product.imageUrl} />
        <div className='absolute top-3 left-3 right-3 flex flex-wrap gap-1.5'>
          {promo && (
            <span className='rounded-full bg-[#EBA2A8] px-2.5 py-1 text-[11px] font-primary-medium uppercase tracking-[0.12em] text-white shadow-sm'>
              {promo.label}
            </span>
          )}
          {isOneToOne && (
            <span className='rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-primary-medium uppercase tracking-[0.12em] text-[#8b1538] backdrop-blur-sm'>
              Presencial
            </span>
          )}
        </div>
      </div>

      <div className='flex flex-1 flex-col p-4 sm:p-5'>
        {product.category && (
          <p className='text-[11px] uppercase tracking-[0.2em] text-[#8b1538] dark:text-[#F9BBC4] truncate'>
            {product.category.name}
          </p>
        )}
        <h3 className='mt-1 text-lg font-primary-medium leading-snug text-[#2B2B2B] dark:text-foreground text-pretty'>
          {product.name}
        </h3>
        {product.tagline && (
          <p className='mt-1.5 text-sm leading-relaxed text-[#2B2B2B]/65 dark:text-muted-foreground text-pretty'>
            {product.tagline}
          </p>
        )}
        <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#2B2B2B]/55 dark:text-muted-foreground'>
          {duration && (
            <span className='inline-flex items-center gap-1.5'>
              <Clock className='w-3.5 h-3.5' aria-hidden='true' /> {duration}
            </span>
          )}
          <span className='inline-flex items-center gap-1.5'>
            <Users className='w-3.5 h-3.5' aria-hidden='true' />
            {isOneToOne ? 'Clase individual · se coordina' : 'Online por Google Meet'}
          </span>
        </div>

        <div className='mt-auto pt-5 flex items-end justify-between gap-3'>
          <div className='min-w-0'>
            {price != null ? (
              <p className='text-[22px] leading-none font-primary-medium tabular-nums text-[#2B2B2B] dark:text-foreground'>
                {formatPrice(price, currency)}
              </p>
            ) : (
              <p className='text-sm text-[#2B2B2B]/55 dark:text-muted-foreground'>
                {currency === 'USD' ? 'Solo se abona en pesos' : 'Solo se abona en dólares'}
              </p>
            )}
          </div>
          {price != null &&
            (quantity > 0 ? (
              <QuantityStepper value={quantity} onChange={onQuantity} label={product.name} />
            ) : (
              <button
                type='button'
                onClick={onAdd}
                className='inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#EBA2A8] px-5 text-sm font-primary-medium text-white shadow-sm transition-all hover:bg-[#d89196] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1538] focus-visible:ring-offset-2'
                aria-label={`Agregar ${product.name} al carrito`}
              >
                <Plus className='w-4 h-4' aria-hidden='true' /> Agregar
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
