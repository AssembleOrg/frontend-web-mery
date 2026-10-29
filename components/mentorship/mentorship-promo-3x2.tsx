'use client';

import { useMemo, useState } from 'react';
import { Gift, Minus, Plus } from 'lucide-react';
import type { MentorshipProduct } from '@/lib/mentorship-api';
import { MENTORSHIP_3X2, mentorshipPrice, quote3x2 } from '@/lib/mentorship-promo';

type Currency = 'ARS' | 'USD';

interface Props {
  /** Mentorías online (sin clases one-to-one), de todos los cursos. */
  products: MentorshipProduct[];
  onBuy: (purchase: { currency: Currency; amount: string; message: string }) => void;
}

function formatMoney(n: number, currency: Currency): string {
  const v = Math.round(n);
  return currency === 'USD' ? `USD ${v.toLocaleString('en-US')}` : `$${v.toLocaleString('es-AR')}`;
}

export function MentorshipPromo3x2({ products, onBuy }: Readonly<Props>) {
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [qty, setQty] = useState<Record<string, number>>({});

  // Solo las mentorías que tienen precio en la moneda elegida.
  const priced = useMemo(
    () =>
      products
        .map((p) => ({ product: p, price: mentorshipPrice(p, currency) }))
        .filter((x): x is { product: MentorshipProduct; price: number } => x.price != null),
    [products, currency],
  );

  const picked = priced.flatMap(({ product, price }) =>
    Array.from({ length: qty[product.id] ?? 0 }, () => ({ product, price })),
  );
  const count = picked.length;
  const quote = quote3x2(picked.map((x) => x.price));

  if (priced.length === 0) return null;

  const change = (id: string, delta: number) =>
    setQty((q) => {
      const next = Math.max(0, (q[id] ?? 0) + delta);
      if (delta > 0 && count >= MENTORSHIP_3X2.BUY) return q;
      return { ...q, [id]: next };
    });

  const buy = () => {
    if (!quote) return;
    const giftName = [...picked].sort((a, b) => a.price - b.price)[0].product.name;
    const detail = priced
      .filter(({ product }) => (qty[product.id] ?? 0) > 0)
      .map(({ product }) => `${qty[product.id]}x ${product.name}`)
      .join(' + ');
    const amount = formatMoney(quote.total, currency);
    const method = currency === 'USD' ? 'Exterior' : 'Transferencia';
    onBuy({
      currency,
      amount,
      message: `Hola! Quiero la promo 3x2 de mentorías: ${detail} (${method} · ${amount}; de regalo: ${giftName}). Adjunto el comprobante de transferencia.`,
    });
  };

  return (
    <div className='rounded-xl border border-[#EBA2A8] bg-[#FBE8EA]/40 dark:bg-[#EBA2A8]/10 p-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-full bg-[#EBA2A8] px-2.5 py-0.5 text-xs font-semibold text-white'>
          3x2
        </span>
        <p className='text-sm font-semibold text-foreground'>Llevá 3 mentorías y pagá 2</p>
      </div>
      <p className='mt-1 text-xs text-muted-foreground'>
        Elegí 3 mentorías (podés combinarlas). La de menor valor es de regalo.
      </p>

      <div
        role='radiogroup'
        aria-label='Moneda'
        className='mt-3 grid grid-cols-2 gap-1 rounded-lg bg-white dark:bg-[#1c1c1e] p-1 border border-border'
      >
        {(['ARS', 'USD'] as const).map((c) => (
          <button
            key={c}
            type='button'
            role='radio'
            aria-checked={currency === c}
            onClick={() => setCurrency(c)}
            className={`min-h-[40px] rounded-md text-sm transition-colors ${
              currency === c
                ? 'bg-[#2B2B2B] text-white font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {c === 'ARS' ? 'Argentina · $' : 'Exterior · USD'}
          </button>
        ))}
      </div>

      <ul className='mt-3 space-y-2'>
        {priced.map(({ product, price }) => {
          const n = qty[product.id] ?? 0;
          return (
            <li
              key={product.id}
              className='flex items-center justify-between gap-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-border px-3 py-2'
            >
              <div className='min-w-0'>
                <p className='text-sm font-medium leading-snug text-foreground'>{product.name}</p>
                <p className='text-xs text-muted-foreground'>{formatMoney(price, currency)}</p>
              </div>
              <div className='flex shrink-0 items-center gap-1'>
                <button
                  type='button'
                  aria-label={`Quitar ${product.name}`}
                  onClick={() => change(product.id, -1)}
                  disabled={n === 0}
                  className='flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30'
                >
                  <Minus className='h-4 w-4' />
                </button>
                <span className='w-5 text-center text-sm font-semibold tabular-nums' aria-live='polite'>
                  {n}
                </span>
                <button
                  type='button'
                  aria-label={`Sumar ${product.name}`}
                  onClick={() => change(product.id, 1)}
                  disabled={count >= MENTORSHIP_3X2.BUY}
                  className='flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30'
                >
                  <Plus className='h-4 w-4' />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {quote ? (
        <div className='mt-3 space-y-1 text-sm'>
          <div className='flex justify-between text-muted-foreground'>
            <span>Subtotal</span>
            <span className='tabular-nums'>{formatMoney(quote.subtotal, currency)}</span>
          </div>
          <div className='flex justify-between text-[#8b1538] dark:text-[#EBA2A8]'>
            <span className='flex items-center gap-1.5'>
              <Gift className='h-3.5 w-3.5' aria-hidden='true' /> De regalo
            </span>
            <span className='tabular-nums'>−{formatMoney(quote.gift, currency)}</span>
          </div>
          <div className='flex justify-between pt-1 font-semibold text-foreground'>
            <span>Total</span>
            <span className='tabular-nums'>{formatMoney(quote.total, currency)}</span>
          </div>
        </div>
      ) : (
        <p className='mt-3 text-xs text-muted-foreground'>
          Elegiste {count} de {MENTORSHIP_3X2.BUY}.
        </p>
      )}

      <button
        type='button'
        onClick={buy}
        disabled={!quote}
        className='mt-3 w-full min-h-[44px] rounded-lg bg-[#EBA2A8] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#d89196] disabled:cursor-not-allowed disabled:opacity-50'
      >
        {quote ? `Comprar 3x2 · ${formatMoney(quote.total, currency)}` : 'Elegí 3 mentorías'}
      </button>
    </div>
  );
}
