'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CalendarCheck, ChevronUp, CreditCard, ShoppingBag, Sparkles, Video } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useAuth } from '@/hooks/useAuth';
import {
  formatPrice,
  METHOD_CURRENCY,
  shopApi,
  type ShopCatalog,
  type ShopCurrency,
} from '@/lib/mentorship-shop-api';
import { cartCount, useMentorshipCart } from '@/stores/mentorship-cart-store';
import { ProductCard } from '@/components/mentorship-shop/product-card';
import { PackCard } from '@/components/mentorship-shop/pack-card';
import { CartPanel, CheckoutButton } from '@/components/mentorship-shop/cart-panel';
import { Sheet } from '@/components/mentorship-shop/sheet';
import { useShopQuote } from '@/components/mentorship-shop/use-shop-quote';

const STEPS = [
  { icon: CreditCard, title: 'Comprás', text: 'Sueltas o en pack, con la promo vigente aplicada sola.' },
  { icon: CalendarCheck, title: 'Reservás', text: 'Elegís día y horario desde "Mis mentorías", cuando quieras.' },
  { icon: Video, title: 'Te conectás', text: 'Te llega el link de Google Meet para el encuentro con Mery.' },
];

function promoUntil(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export default function MentoriasShopPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const { isAuthenticated } = useAuth();

  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // El carrito vive en localStorage: no se lee hasta montar (evita desfasaje SSR).
  const [mounted, setMounted] = useState(false);

  const lines = useMentorshipCart((s) => s.lines);
  const paymentMethod = useMentorshipCart((s) => s.paymentMethod);
  const code = useMentorshipCart((s) => s.code);
  const add = useMentorshipCart((s) => s.add);
  const setQuantity = useMentorshipCart((s) => s.setQuantity);
  const setPaymentMethod = useMentorshipCart((s) => s.setPaymentMethod);
  const clear = useMentorshipCart((s) => s.clear);
  const prune = useMentorshipCart((s) => s.prune);
  const currency: ShopCurrency = METHOD_CURRENCY[paymentMethod];

  const visibleLines = mounted ? lines : [];
  const { quote, loading, error } = useShopQuote(visibleLines, paymentMethod, code);
  const count = cartCount(visibleLines);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const c = await shopApi.catalog();
      setCatalog(c);
      prune({ products: new Set(c.products.map((p) => p.id)), packs: new Set(c.packs.map((p) => p.id)) });
    } catch {
      setLoadError(true);
    }
  }, [prune]);

  useEffect(() => {
    setMounted(true);
    void load();
  }, [load]);

  // Si se vacía el carrito con la hoja abierta, cerrarla.
  useEffect(() => {
    if (count === 0) setSheetOpen(false);
  }, [count]);

  const qtyOf = (kind: 'PRODUCT' | 'PACK', id: string) =>
    visibleLines.find((l) => l.kind === kind && l.id === id)?.quantity ?? 0;

  const handleAdd = (kind: 'PRODUCT' | 'PACK', id: string, name: string) => {
    add(kind, id);
    toast.success(`${name} en tu carrito`, { id: `add-${id}`, duration: 1800 });
  };

  const setCurrency = (c: ShopCurrency) => {
    if (c === currency) return;
    setPaymentMethod(c === 'USD' ? 'FOREIGN' : 'MERCADOPAGO');
  };

  const checkout = async () => {
    if (!isAuthenticated) {
      toast('Ingresá a tu cuenta para terminar la compra. Tu carrito te espera.', { icon: '🛍️' });
      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/mentorias`)}`);
      return;
    }
    setSubmitting(true);
    try {
      const { order, initPoint } = await shopApi.createOrder({
        lines,
        paymentMethod,
        ...(code ? { code } : {}),
      });
      clear();
      if (initPoint) {
        window.location.href = initPoint;
        return;
      }
      router.push(`/${locale}/mentorias/compra/${order.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(false);
    }
  };

  const autoPromo = catalog?.promos[0];
  const products = catalog?.products ?? [];
  const packs = catalog?.packs ?? [];
  const isEmpty = catalog && products.length === 0 && packs.length === 0;

  const cartPanel = (showCheckout: boolean) => (
    <CartPanel
      quote={quote}
      loading={loading}
      error={error}
      submitting={submitting}
      onCheckout={() => void checkout()}
      showCheckout={showCheckout}
    />
  );

  const hasUsd = useMemo(
    () => products.some((p) => p.priceUSD != null) || packs.some((p) => p.priceUSD != null),
    [products, packs],
  );

  return (
    <div className='min-h-[100dvh] bg-[#FAFAFA] dark:bg-background'>
      <Navigation />

      <main
        className={`container mx-auto px-4 pt-4 sm:pt-6 ${
          count > 0 ? 'pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-16' : 'pb-16'
        }`}
      >
        {/* Portada */}
        <section className='overflow-hidden rounded-3xl bg-[#FBE8EA] dark:bg-[#3d2f31] px-6 py-10 sm:px-12 sm:py-14 lg:py-16'>
          <div className='max-w-2xl'>
            <span className='block h-px w-10 bg-[#EBA2A8]' aria-hidden='true' />
            <h1 className='mt-5 text-[40px] leading-none sm:text-6xl font-primary uppercase tracking-[0.16em] text-[#2B2B2B] dark:text-foreground'>
              Mentorías
            </h1>
            <p className='mt-3 text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#EBA2A8]'>Mery García</p>
            <p className='mt-6 text-base sm:text-lg leading-relaxed text-[#2B2B2B]/75 dark:text-foreground/80 text-pretty max-w-xl'>
              Encuentros uno a uno con Mery para destrabar tu técnica, revisar tus trabajos y crecer en
              tu negocio. Elegí la mentoría que necesitás y reservá el horario cuando quieras.
            </p>
            {isAuthenticated && (
              <Link
                href={`/${locale}/mentorias/mis-mentorias`}
                className='mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-5 text-sm font-primary-medium text-[#2B2B2B] dark:text-foreground ring-1 ring-[#2B2B2B]/10 dark:ring-white/15 transition-colors hover:bg-white dark:hover:bg-white/15'
              >
                <CalendarCheck className='w-4 h-4 text-[#8b1538] dark:text-[#F9BBC4]' aria-hidden='true' />
                Mis mentorías
              </Link>
            )}
          </div>
          {autoPromo && (
            <div className='mt-8 inline-flex max-w-full items-center gap-3 rounded-2xl bg-[#2B2B2B] py-3 pl-3 pr-5 text-white shadow-lg'>
              <span className='shrink-0 rounded-xl bg-[#EBA2A8] px-2.5 py-2 text-sm font-primary-medium uppercase tracking-[0.08em]'>
                {autoPromo.label}
              </span>
              <span className='min-w-0 text-sm leading-snug'>
                <span className='block font-primary-medium'>{autoPromo.name}</span>
                <span className='block text-white/60 text-xs'>
                  {autoPromo.kind === 'BUY_X_PAY_Y' ? 'Se aplica sola en el carrito' : 'Descuento automático'}
                  {autoPromo.validTo && ` · hasta el ${promoUntil(autoPromo.validTo)}`}
                </span>
              </span>
            </div>
          )}
        </section>

        <div className='mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 xl:gap-14'>
          <div className='min-w-0'>
            {/* Moneda */}
            {hasUsd && (
              <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>¿Desde dónde pagás?</p>
                <div
                  role='radiogroup'
                  aria-label='Moneda'
                  className='grid grid-cols-2 rounded-full bg-white dark:bg-card p-1 ring-1 ring-[#2B2B2B]/10 dark:ring-border sm:w-auto'
                >
                  {(
                    [
                      ['ARS', 'Argentina · $'],
                      ['USD', 'Exterior · USD'],
                    ] as const
                  ).map(([c, label]) => (
                    <button
                      key={c}
                      type='button'
                      role='radio'
                      aria-checked={currency === c}
                      onClick={() => setCurrency(c)}
                      className={`min-h-10 rounded-full px-5 text-sm font-primary-medium transition-colors whitespace-nowrap ${
                        currency === c
                          ? 'bg-[#2B2B2B] text-white dark:bg-[#F9BBC4] dark:text-[#2B2B2B]'
                          : 'text-[#2B2B2B]/60 hover:text-[#2B2B2B] dark:text-muted-foreground dark:hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadError && (
              <div className='rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-8 text-center'>
                <p className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>No pudimos cargar las mentorías</p>
                <p className='mt-1 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>Revisá tu conexión y probá de nuevo.</p>
                <button
                  type='button'
                  onClick={() => void load()}
                  className='mt-5 min-h-11 rounded-full bg-[#2B2B2B] px-6 text-sm font-primary-medium text-white'
                >
                  Reintentar
                </button>
              </div>
            )}

            {!catalog && !loadError && <ShopSkeleton />}

            {isEmpty && (
              <div className='rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-10 text-center'>
                <Sparkles className='mx-auto w-6 h-6 text-[#EBA2A8]' aria-hidden='true' />
                <p className='mt-3 font-primary-medium text-[#2B2B2B] dark:text-foreground'>Muy pronto vas a encontrar mentorías acá</p>
                <p className='mt-1 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>Estamos preparando los próximos encuentros.</p>
              </div>
            )}

            {packs.length > 0 && (
              <section aria-labelledby='packs-title' className='mb-12'>
                <SectionTitle id='packs-title' eyebrow='Combiná y ahorrá' title='Packs' />
                <div className='space-y-5'>
                  {packs.map((p) => (
                    <PackCard
                      key={p.id}
                      pack={p}
                      currency={currency}
                      quantity={qtyOf('PACK', p.id)}
                      onAdd={() => handleAdd('PACK', p.id, p.name)}
                      onQuantity={(n) => setQuantity('PACK', p.id, n)}
                    />
                  ))}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section aria-labelledby='products-title'>
                <SectionTitle id='products-title' eyebrow='Una por tema' title='Mentorías' />
                <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currency={currency}
                      promos={catalog?.promos ?? []}
                      quantity={qtyOf('PRODUCT', p.id)}
                      onAdd={() => handleAdd('PRODUCT', p.id, p.name)}
                      onQuantity={(n) => setQuantity('PRODUCT', p.id, n)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cómo funciona */}
            <section aria-labelledby='how-title' className='mt-14'>
              <SectionTitle id='how-title' eyebrow='Simple' title='Cómo funciona' />
              <ol className='grid gap-4 sm:grid-cols-3'>
                {STEPS.map((s, i) => (
                  <li key={s.title} className='rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-5'>
                    <div className='flex items-center gap-3'>
                      <span className='w-10 h-10 rounded-2xl bg-[#FBE8EA] dark:bg-[#3d2f31] text-[#8b1538] dark:text-[#F9BBC4] flex items-center justify-center'>
                        <s.icon className='w-5 h-5' aria-hidden='true' />
                      </span>
                      <span className='text-xs uppercase tracking-[0.2em] text-[#2B2B2B]/40 dark:text-muted-foreground tabular-nums'>
                        Paso {i + 1}
                      </span>
                    </div>
                    <p className='mt-4 font-primary-medium text-[#2B2B2B] dark:text-foreground'>{s.title}</p>
                    <p className='mt-1 text-sm leading-relaxed text-[#2B2B2B]/60 dark:text-muted-foreground'>{s.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Carrito: columna fija en desktop */}
          <aside className='hidden lg:block' aria-label='Carrito'>
            <div className='sticky top-28 rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border shadow-[0_18px_40px_-28px_rgba(43,43,43,0.35)] p-6'>
              <h2 className='mb-5 flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[#2B2B2B] dark:text-foreground'>
                <ShoppingBag className='w-4 h-4 text-[#EBA2A8]' aria-hidden='true' />
                Tu carrito
                {count > 0 && <span className='ml-auto tabular-nums text-[#2B2B2B]/45 dark:text-muted-foreground normal-case tracking-normal'>{count}</span>}
              </h2>
              {cartPanel(true)}
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Barra del carrito (mobile / tablet) */}
      {count > 0 && (
        <div className='lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent dark:from-background dark:via-background/95'>
          <button
            type='button'
            onClick={() => setSheetOpen(true)}
            className='mx-auto flex w-full max-w-xl min-h-14 items-center gap-3 rounded-full bg-[#2B2B2B] pl-2 pr-5 text-white shadow-[0_12px_30px_-10px_rgba(43,43,43,0.6)] active:scale-[0.99] transition-transform'
            aria-haspopup='dialog'
          >
            <span className='relative w-10 h-10 rounded-full bg-[#EBA2A8] flex items-center justify-center'>
              <ShoppingBag className='w-[18px] h-[18px]' aria-hidden='true' />
              <span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-[#2B2B2B] text-[11px] font-primary-medium flex items-center justify-center tabular-nums'>
                {count}
              </span>
            </span>
            <span className='flex-1 text-left text-sm font-primary-medium'>Ver carrito</span>
            <span className='text-base font-primary-medium tabular-nums'>
              {quote ? formatPrice(quote.total, currency) : '…'}
            </span>
            <ChevronUp className='w-4 h-4 text-white/60' aria-hidden='true' />
          </button>
        </div>
      )}

      {sheetOpen && (
        <Sheet
          title='Tu carrito'
          subtitle={`${count} ${count === 1 ? 'producto' : 'productos'}`}
          icon={<ShoppingBag className='w-5 h-5' />}
          onClose={() => setSheetOpen(false)}
          footer={
            <div className='flex items-center gap-4'>
              <div className='shrink-0'>
                <p className='text-xs text-[#2B2B2B]/55 dark:text-muted-foreground'>Total</p>
                <p className='text-xl font-primary-medium tabular-nums text-[#2B2B2B] dark:text-foreground'>
                  {quote ? formatPrice(quote.total, currency) : '—'}
                </p>
              </div>
              <div className='flex-1'>
                <CheckoutButton
                  disabled={!quote || loading || !!error || submitting}
                  submitting={submitting}
                  onClick={() => void checkout()}
                  method={paymentMethod}
                />
              </div>
            </div>
          }
        >
          {cartPanel(false)}
        </Sheet>
      )}
    </div>
  );
}

function SectionTitle({ id, eyebrow, title }: Readonly<{ id: string; eyebrow: string; title: string }>) {
  return (
    <div className='mb-5'>
      <p className='text-[11px] uppercase tracking-[0.3em] text-[#8b1538] dark:text-[#F9BBC4]'>{eyebrow}</p>
      <h2 id={id} className='mt-1 text-2xl sm:text-[28px] font-primary uppercase tracking-[0.14em] text-[#2B2B2B] dark:text-foreground'>
        {title}
      </h2>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div aria-hidden='true'>
      <div className='h-64 rounded-3xl bg-[#2B2B2B]/10 dark:bg-muted animate-pulse' />
      <div className='mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {[0, 1, 2].map((i) => (
          <div key={i} className='rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border overflow-hidden'>
            <div className='aspect-[4/3] bg-[#2B2B2B]/10 dark:bg-muted animate-pulse' />
            <div className='p-5 space-y-3'>
              <div className='h-3 w-24 rounded bg-[#2B2B2B]/10 animate-pulse' />
              <div className='h-5 w-40 rounded bg-[#2B2B2B]/10 animate-pulse' />
              <div className='h-4 w-full rounded bg-[#2B2B2B]/8 animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
