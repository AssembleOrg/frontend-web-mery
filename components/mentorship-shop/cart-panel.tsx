'use client';

import { useEffect, useState } from 'react';
import {
  Banknote,
  BadgePercent,
  Check,
  CreditCard,
  Globe,
  Landmark,
  Loader2,
  ShoppingBag,
  Tag,
  X,
} from 'lucide-react';
import {
  formatPrice,
  METHOD_CURRENCY,
  type ShopPaymentMethod,
  type ShopQuote,
} from '@/lib/mentorship-shop-api';
import { useMentorshipCart } from '@/stores/mentorship-cart-store';
import { QuantityStepper } from './quantity-stepper';

const METHODS: {
  value: ShopPaymentMethod;
  title: string;
  detail: string;
  icon: typeof CreditCard;
}[] = [
  {
    value: 'MERCADOPAGO',
    title: 'Mercado Pago',
    detail: 'Tarjeta o dinero en cuenta. Se acredita al instante.',
    icon: CreditCard,
  },
  {
    value: 'TRANSFER',
    title: 'Transferencia',
    detail: 'Te mostramos los datos y validamos el pago.',
    icon: Landmark,
  },
  {
    value: 'CASH',
    title: 'Efectivo',
    detail: 'En el estudio. Lo coordinamos por WhatsApp.',
    icon: Banknote,
  },
];

export function CartPanel({
  quote,
  loading,
  error,
  submitting,
  onCheckout,
  showCheckout = true,
}: Readonly<{
  quote: ShopQuote | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onCheckout: () => void;
  /** En la hoja mobile el botón va en el pie fijo. */
  showCheckout?: boolean;
}>) {
  const lines = useMentorshipCart((s) => s.lines);
  const paymentMethod = useMentorshipCart((s) => s.paymentMethod);
  const setPaymentMethod = useMentorshipCart((s) => s.setPaymentMethod);
  const setQuantity = useMentorshipCart((s) => s.setQuantity);
  const code = useMentorshipCart((s) => s.code);
  const setCode = useMentorshipCart((s) => s.setCode);
  const currency = METHOD_CURRENCY[paymentMethod];

  const [codeOpen, setCodeOpen] = useState(!!code);
  const [draft, setDraft] = useState(code);
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // El resultado del código llega con la cotización. Si no existe, se descarta
  // para que no frene la compra.
  useEffect(() => {
    if (!code || !quote?.code) return;
    setCodeMsg({ ok: quote.code.status === 'applied', text: quote.code.message });
    if (quote.code.status === 'invalid') setCode('');
  }, [quote?.code, code, setCode]);

  if (lines.length === 0) {
    return (
      <div className='flex flex-col items-center text-center py-10 px-4'>
        <span className='w-14 h-14 rounded-full bg-[#FBE8EA] dark:bg-[#3d2f31] text-[#EBA2A8] flex items-center justify-center'>
          <ShoppingBag className='w-6 h-6' aria-hidden='true' />
        </span>
        <p className='mt-4 font-primary-medium text-[#2B2B2B] dark:text-foreground'>Tu carrito está vacío</p>
        <p className='mt-1 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground max-w-[240px]'>
          Sumá mentorías o un pack para ver el total con las promos aplicadas.
        </p>
      </div>
    );
  }

  const freeNames = quote?.promo?.freeUnits.map((u) => u.name) ?? [];
  const canCheckout = !!quote && !loading && !error && !submitting;

  return (
    <div className='space-y-6'>
      {/* Renglones */}
      <ul className='divide-y divide-[#2B2B2B]/8 dark:divide-border -my-1'>
        {lines.map((l) => {
          const q = quote?.lines.find((x) => x.kind === l.kind && x.id === l.id);
          return (
            <li key={`${l.kind}:${l.id}`} className='py-3 flex items-center gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='text-[15px] leading-snug text-[#2B2B2B] dark:text-foreground'>
                  {l.kind === 'PACK' && (
                    <span className='mr-1.5 align-[1px] rounded bg-[#2B2B2B] px-1.5 py-px text-[10px] uppercase tracking-[0.14em] text-[#F9BBC4]'>
                      Pack
                    </span>
                  )}
                  {q?.name ?? <span className='inline-block h-4 w-32 rounded bg-[#2B2B2B]/8 animate-pulse align-middle' />}
                </p>
                <p className='mt-0.5 text-sm tabular-nums text-[#2B2B2B]/55 dark:text-muted-foreground'>
                  {q ? (
                    <>
                      {formatPrice(q.lineTotal, currency)}
                      {l.quantity > 1 && <span> · {formatPrice(q.unitPrice, currency)} c/u</span>}
                    </>
                  ) : (
                    ' '
                  )}
                </p>
              </div>
              <QuantityStepper
                size='sm'
                value={l.quantity}
                onChange={(n) => setQuantity(l.kind, l.id, n)}
                label={q?.name ?? 'producto'}
              />
            </li>
          );
        })}
      </ul>

      {/* Promo aplicada */}
      {quote?.promo && (
        <div className='rounded-2xl bg-[#FBE8EA] dark:bg-[#3d2f31] px-4 py-3 flex gap-3'>
          <BadgePercent className='w-5 h-5 shrink-0 text-[#8b1538] dark:text-[#F9BBC4] mt-0.5' aria-hidden='true' />
          <div className='min-w-0 text-sm'>
            <p className='font-primary-medium text-[#8b1538] dark:text-[#F9BBC4]'>
              {quote.promo.name}
              {!quote.promo.name.toLowerCase().includes(quote.promo.label.toLowerCase()) && ` · ${quote.promo.label}`}
            </p>
            <p className='text-[#2B2B2B]/70 dark:text-foreground/80 mt-0.5'>
              {freeNames.length > 0
                ? `Te regalamos: ${freeNames.join(', ')}.`
                : `Ahorrás ${formatPrice(quote.promo.discount, currency)}.`}
            </p>
          </div>
        </div>
      )}

      {/* Código */}
      <div>
        {!codeOpen ? (
          <button
            type='button'
            onClick={() => setCodeOpen(true)}
            className='inline-flex min-h-11 items-center gap-2 text-sm text-[#8b1538] dark:text-[#F9BBC4] underline-offset-4 hover:underline'
          >
            <Tag className='w-4 h-4' aria-hidden='true' /> ¿Tenés un código de descuento?
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCodeMsg(null);
              setCode(draft.trim().toUpperCase());
            }}
          >
            <label htmlFor='shop-code' className='block text-xs uppercase tracking-[0.16em] text-[#2B2B2B]/55 dark:text-muted-foreground mb-1.5'>
              Código de descuento
            </label>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <input
                  id='shop-code'
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.toUpperCase())}
                  autoCapitalize='characters'
                  autoComplete='off'
                  autoCorrect='off'
                  spellCheck={false}
                  enterKeyHint='done'
                  placeholder='EJ: MERY10'
                  className='w-full h-11 rounded-xl border border-[#2B2B2B]/15 dark:border-border bg-white dark:bg-background px-3.5 pr-10 text-base uppercase tracking-[0.08em] text-[#2B2B2B] dark:text-foreground placeholder:text-[#2B2B2B]/30 focus:border-[#EBA2A8] focus:outline-none focus:ring-2 focus:ring-[#EBA2A8]/30'
                />
                {code && (
                  <button
                    type='button'
                    onClick={() => {
                      setCode('');
                      setDraft('');
                      setCodeMsg(null);
                    }}
                    aria-label='Quitar código'
                    className='absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-[#2B2B2B]/40 hover:text-[#2B2B2B]'
                  >
                    <X className='w-4 h-4' />
                  </button>
                )}
              </div>
              <button
                type='submit'
                disabled={!draft.trim() || draft.trim() === code}
                className='h-11 rounded-xl bg-[#2B2B2B] px-4 text-sm font-primary-medium text-white transition-colors hover:bg-black disabled:opacity-40'
              >
                Aplicar
              </button>
            </div>
            {codeMsg && (
              <p
                role='status'
                className={`mt-2 text-sm flex items-center gap-1.5 ${
                  codeMsg.ok ? 'text-[#2B2B2B]/75 dark:text-foreground/80' : 'text-[#8b1538] dark:text-[#F9BBC4]'
                }`}
              >
                {codeMsg.ok && <Check className='w-4 h-4 text-[#EBA2A8]' aria-hidden='true' />}
                {codeMsg.text}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Medio de pago */}
      <fieldset>
        <legend className='text-xs uppercase tracking-[0.16em] text-[#2B2B2B]/55 dark:text-muted-foreground mb-2'>
          Cómo pagás
        </legend>
        {currency === 'USD' ? (
          <div className='rounded-2xl ring-1 ring-[#EBA2A8] bg-[#FBE8EA]/50 dark:bg-[#3d2f31]/60 px-4 py-3 flex gap-3'>
            <Globe className='w-5 h-5 shrink-0 text-[#8b1538] dark:text-[#F9BBC4] mt-0.5' aria-hidden='true' />
            <div className='text-sm'>
              <p className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>Desde el exterior (USD)</p>
              <p className='mt-0.5 text-[#2B2B2B]/65 dark:text-muted-foreground'>
                Te pasamos los datos para transferir en dólares y validamos el pago.
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            {METHODS.map((m) => {
              const active = paymentMethod === m.value;
              const Icon = m.icon;
              return (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 transition-colors ${
                    active
                      ? 'ring-2 ring-[#EBA2A8] bg-[#FBE8EA]/50 dark:bg-[#3d2f31]/60'
                      : 'ring-1 ring-[#2B2B2B]/10 dark:ring-border hover:ring-[#EBA2A8]/60'
                  }`}
                >
                  <input
                    type='radio'
                    name='shop-payment'
                    value={m.value}
                    checked={active}
                    onChange={() => setPaymentMethod(m.value)}
                    className='sr-only'
                  />
                  <Icon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${active ? 'text-[#8b1538] dark:text-[#F9BBC4]' : 'text-[#2B2B2B]/45 dark:text-muted-foreground'}`}
                    aria-hidden='true'
                  />
                  <span className='min-w-0 flex-1 text-sm'>
                    <span className='block font-primary-medium text-[#2B2B2B] dark:text-foreground'>{m.title}</span>
                    <span className='block mt-0.5 text-[#2B2B2B]/60 dark:text-muted-foreground'>{m.detail}</span>
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      active ? 'bg-[#EBA2A8] text-white' : 'ring-1 ring-[#2B2B2B]/20 dark:ring-border'
                    }`}
                    aria-hidden='true'
                  >
                    {active && <Check className='w-3 h-3' />}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* Totales */}
      <div className='space-y-1.5 text-sm'>
        {error ? (
          <p role='alert' className='rounded-xl bg-[#FBE8EA] dark:bg-[#3d2f31] px-3.5 py-2.5 text-[#8b1538] dark:text-[#F9BBC4]'>
            {error}
          </p>
        ) : (
          <>
            <div className='flex justify-between text-[#2B2B2B]/65 dark:text-muted-foreground'>
              <span>Subtotal</span>
              <span className='tabular-nums'>{quote ? formatPrice(quote.subtotal, currency) : '—'}</span>
            </div>
            {!!quote?.discount && (
              <div className='flex justify-between text-[#8b1538] dark:text-[#F9BBC4]'>
                <span>Descuento</span>
                <span className='tabular-nums'>− {formatPrice(quote.discount, currency)}</span>
              </div>
            )}
            <div className='flex items-baseline justify-between pt-2 border-t border-[#2B2B2B]/8 dark:border-border'>
              <span className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>Total</span>
              <span className='text-2xl font-primary-medium tabular-nums text-[#2B2B2B] dark:text-foreground'>
                {quote ? formatPrice(quote.total, currency) : '—'}
                {loading && <Loader2 className='inline ml-2 w-4 h-4 animate-spin text-[#EBA2A8] align-middle' />}
              </span>
            </div>
          </>
        )}
      </div>

      {showCheckout && (
        <CheckoutButton disabled={!canCheckout} submitting={submitting} onClick={onCheckout} method={paymentMethod} />
      )}
      <p className='text-xs leading-relaxed text-[#2B2B2B]/50 dark:text-muted-foreground text-center'>
        Cada mentoría se reserva cuando quieras dentro de los 12 meses desde la compra.
      </p>
    </div>
  );
}

export function CheckoutButton({
  disabled,
  submitting,
  onClick,
  method,
}: Readonly<{ disabled: boolean; submitting: boolean; onClick: () => void; method: ShopPaymentMethod }>) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#2B2B2B] px-6 text-[15px] font-primary-medium text-white transition-all hover:bg-black active:scale-[0.99] disabled:opacity-45 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBA2A8] focus-visible:ring-offset-2'
    >
      {submitting ? <Loader2 className='w-5 h-5 animate-spin' aria-hidden='true' /> : null}
      {method === 'MERCADOPAGO' ? 'Pagar con Mercado Pago' : 'Confirmar compra'}
    </button>
  );
}
