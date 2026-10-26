'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import { Ban, CalendarCheck, Check, CheckCircle2, Copy, CreditCard, Hourglass, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BackButton } from '@/components/ui/back-button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { BANK_DATA, WA_URL } from '@/components/bank-transfer-modal';
import { OrderSummary } from '@/components/mentorship-shop/order-summary';
import { formatPrice, shopApi, type ShopOrder } from '@/lib/mentorship-shop-api';

/** Tras volver de MP el webhook puede tardar unos segundos: se consulta hasta 2 min. */
const POLL_MS = 3000;
const POLL_MAX_MS = 120_000;

export default function MentorshipOrderPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const id = params?.id as string;

  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [waitingMp, setWaitingMp] = useState(false);
  const pollStart = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const o = await shopApi.order(id);
      setOrder(o);
      return o;
    } catch {
      setNotFound(true);
      return null;
    }
  }, [id]);

  useEffect(() => {
    // MP vuelve con ?status=approved (o collection_status). Mientras el webhook
    // no confirme, mostramos "confirmando" en vez de "pendiente".
    const q = new URLSearchParams(window.location.search);
    const mpStatus = q.get('status') ?? q.get('collection_status');
    if (mpStatus === 'approved') {
      setWaitingMp(true);
      pollStart.current = Date.now();
    }
    void load();
  }, [load]);

  useEffect(() => {
    if (!waitingMp || !order) return;
    if (order.status !== 'PENDING') {
      setWaitingMp(false);
      return;
    }
    if (Date.now() - (pollStart.current ?? 0) > POLL_MAX_MS) {
      setWaitingMp(false);
      return;
    }
    const t = setTimeout(() => void load(), POLL_MS);
    return () => clearTimeout(t);
  }, [waitingMp, order, load]);

  const pay = async () => {
    setPaying(true);
    try {
      const { initPoint } = await shopApi.payOrder(id);
      window.location.href = initPoint;
    } catch (e) {
      toast.error((e as Error).message);
      setPaying(false);
    }
  };

  const cancel = async () => {
    try {
      setOrder(await shopApi.cancelOrder(id));
      setConfirmCancel(false);
      toast.success('Compra cancelada');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <ProtectedRoute>
      <div className='min-h-[100dvh] bg-[#FAFAFA] dark:bg-background'>
        <Navigation />
        <main className='mx-auto max-w-2xl px-4 pt-6 pb-[calc(4rem+env(safe-area-inset-bottom))]'>
          <BackButton href={`/${locale}/mentorias/mis-mentorias`} label='Mis mentorías' className='mb-6' />

          {notFound ? (
            <div className='rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-8 text-center'>
              <p className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>No encontramos esta compra</p>
              <Link
                href={`/${locale}/mentorias`}
                className='mt-5 inline-flex min-h-11 items-center rounded-full bg-[#2B2B2B] px-6 text-sm font-primary-medium text-white'
              >
                Ir a la tienda
              </Link>
            </div>
          ) : !order ? (
            <div className='space-y-4' aria-hidden='true'>
              <div className='h-36 rounded-3xl bg-[#2B2B2B]/8 animate-pulse' />
              <div className='h-56 rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 animate-pulse' />
            </div>
          ) : (
            <div className='space-y-5'>
              <StatusHero order={order} waitingMp={waitingMp} locale={locale} />

              {order.status === 'PENDING' && !waitingMp && order.paymentMethod === 'MERCADOPAGO' && (
                <Card>
                  <p className='text-sm text-[#2B2B2B]/70 dark:text-foreground/80'>
                    Si el pago no se completó, podés intentarlo de nuevo. El link de Mercado Pago dura 24 horas.
                  </p>
                  <button
                    type='button'
                    onClick={() => void pay()}
                    disabled={paying}
                    className='mt-4 w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#2B2B2B] text-[15px] font-primary-medium text-white transition-colors hover:bg-black disabled:opacity-50'
                  >
                    {paying ? <Loader2 className='w-5 h-5 animate-spin' /> : <CreditCard className='w-5 h-5' />}
                    Pagar {formatPrice(order.total, order.currency)}
                  </button>
                </Card>
              )}

              {order.status === 'PENDING' && order.paymentMethod !== 'MERCADOPAGO' && (
                <ManualInstructions order={order} />
              )}

              <Card>
                <div className='mb-1 flex items-baseline justify-between gap-3'>
                  <h2 className='text-xs uppercase tracking-[0.2em] text-[#2B2B2B]/55 dark:text-muted-foreground'>
                    Compra #{order.number}
                  </h2>
                  <span className='text-xs text-[#2B2B2B]/45 dark:text-muted-foreground'>{order.paymentMethodLabel}</span>
                </div>
                <OrderSummary order={order} />
              </Card>

              {order.status === 'PENDING' && (
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => setConfirmCancel(true)}
                    className='min-h-11 px-4 text-sm text-[#2B2B2B]/55 underline-offset-4 hover:underline hover:text-[#8b1538] dark:text-muted-foreground'
                  >
                    Cancelar esta compra
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>

      {confirmCancel && (
        <ConfirmDialog
          title='¿Cancelar la compra?'
          description='Si ya pagaste, no la canceles: escribinos por WhatsApp y lo revisamos.'
          confirmLabel='Sí, cancelar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => void cancel()}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </ProtectedRoute>
  );
}

function Card({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className='rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-5 sm:p-6'>
      {children}
    </section>
  );
}

function StatusHero({ order, waitingMp, locale }: Readonly<{ order: ShopOrder; waitingMp: boolean; locale: string }>) {
  if (order.status === 'PAID') {
    return (
      <section className='rounded-3xl bg-[#2B2B2B] text-white p-6 sm:p-8'>
        <span className='w-12 h-12 rounded-2xl bg-[#EBA2A8] flex items-center justify-center'>
          <CheckCircle2 className='w-6 h-6' aria-hidden='true' />
        </span>
        <h1 className='mt-5 text-2xl sm:text-3xl font-primary uppercase tracking-[0.12em]'>¡Listo!</h1>
        <p className='mt-2 text-white/75 leading-relaxed'>
          Tu compra está confirmada.{' '}
          {order.creditsCount === 1
            ? 'Ya podés reservar tu mentoría.'
            : `Ya podés reservar tus ${order.creditsCount} mentorías.`}
        </p>
        <Link
          href={`/${locale}/mentorias/mis-mentorias`}
          className='mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#EBA2A8] px-6 text-[15px] font-primary-medium text-white transition-colors hover:bg-[#d89196]'
        >
          <CalendarCheck className='w-5 h-5' aria-hidden='true' /> Reservar horario
        </Link>
      </section>
    );
  }
  if (waitingMp) {
    return (
      <section className='rounded-3xl bg-[#FBE8EA] dark:bg-[#3d2f31] p-6 sm:p-8' role='status'>
        <Loader2 className='w-8 h-8 animate-spin text-[#EBA2A8]' aria-hidden='true' />
        <h1 className='mt-4 text-2xl font-primary-medium text-[#2B2B2B] dark:text-foreground'>Confirmando tu pago…</h1>
        <p className='mt-2 text-[#2B2B2B]/70 dark:text-foreground/80'>
          Mercado Pago nos está avisando. No cierres esta pantalla, tarda unos segundos.
        </p>
      </section>
    );
  }
  if (order.status === 'PENDING') {
    const manual = order.paymentMethod !== 'MERCADOPAGO';
    return (
      <section className='rounded-3xl bg-[#FBE8EA] dark:bg-[#3d2f31] p-6 sm:p-8'>
        <span className='w-12 h-12 rounded-2xl bg-[#EBA2A8] text-white flex items-center justify-center'>
          <Hourglass className='w-6 h-6' aria-hidden='true' />
        </span>
        <h1 className='mt-5 text-2xl font-primary-medium text-[#8b1538] dark:text-[#F9BBC4]'>
          {manual ? 'Falta validar tu pago' : 'Tu pago está pendiente'}
        </h1>
        <p className='mt-2 text-[#2B2B2B]/70 dark:text-foreground/80 leading-relaxed'>
          {manual
            ? 'Apenas lo confirmemos te avisamos y vas a poder reservar tus mentorías.'
            : 'Cuando Mercado Pago lo apruebe, tus mentorías se habilitan solas.'}
        </p>
      </section>
    );
  }
  return (
    <section className='rounded-3xl bg-white dark:bg-card ring-1 ring-[#8b1538]/25 p-6 sm:p-8'>
      <span className='w-12 h-12 rounded-2xl bg-[#5c0e24] text-white flex items-center justify-center'>
        <Ban className='w-6 h-6' aria-hidden='true' />
      </span>
      <h1 className='mt-5 text-2xl font-primary-medium text-[#5c0e24] dark:text-[#F9BBC4]'>
        {order.status === 'REJECTED' ? 'No pudimos validar el pago' : 'Compra cancelada'}
      </h1>
      <p className='mt-2 text-[#2B2B2B]/70 dark:text-foreground/80'>
        {order.status === 'REJECTED'
          ? 'Escribinos por WhatsApp y lo resolvemos.'
          : 'Podés volver a la tienda cuando quieras.'}
      </p>
    </section>
  );
}

function ManualInstructions({ order }: Readonly<{ order: ShopOrder }>) {
  const amount = formatPrice(order.total, order.currency);
  const message =
    order.paymentMethod === 'CASH'
      ? `Hola! Hice la compra de mentorías #${order.number} (${amount}) y quiero pagar en efectivo.`
      : `Hola! Te mando el comprobante de la compra de mentorías #${order.number} (${amount}).`;
  const waHref = `${WA_URL}?text=${encodeURIComponent(message)}`;

  if (order.paymentMethod === 'CASH') {
    return (
      <Card>
        <h2 className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>Pago en efectivo</h2>
        <p className='mt-1.5 text-sm leading-relaxed text-[#2B2B2B]/70 dark:text-foreground/80'>
          Escribinos por WhatsApp y coordinamos el pago en el estudio.
        </p>
        <WhatsappButton href={waHref} label='Coordinar por WhatsApp' />
      </Card>
    );
  }

  const bank = BANK_DATA[order.currency];
  return (
    <Card>
      <h2 className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>{bank.label}</h2>
      <p className='mt-1 text-sm text-[#2B2B2B]/65 dark:text-muted-foreground'>
        Transferí el total y mandanos el comprobante por WhatsApp.
      </p>
      <dl className='mt-4 divide-y divide-[#2B2B2B]/8 dark:divide-border rounded-2xl bg-[#FAFAFA] dark:bg-background ring-1 ring-[#2B2B2B]/8 dark:ring-border'>
        <CopyRow label='Monto' value={String(order.total)} display={amount} />
        <CopyRow label='Alias' value={bank.alias} />
        <CopyRow label='CBU' value={bank.cbu} mono />
        <Row label='Titular' value={bank.titular} />
        <Row label='Banco' value={bank.banco} />
      </dl>
      <WhatsappButton href={waHref} label='Enviar comprobante' />
    </Card>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className='flex items-center justify-between gap-4 px-4 py-3'>
      <dt className='text-xs uppercase tracking-[0.16em] text-[#2B2B2B]/50 dark:text-muted-foreground'>{label}</dt>
      <dd className='text-sm text-right text-[#2B2B2B] dark:text-foreground'>{value}</dd>
    </div>
  );
}

function CopyRow({
  label,
  value,
  display,
  mono,
}: Readonly<{ label: string; value: string; display?: string; mono?: boolean }>) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Safari viejo / contexto no seguro: fallback con textarea.
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className='flex items-center justify-between gap-3 pl-4 pr-1.5 py-1.5'>
      <dt className='text-xs uppercase tracking-[0.16em] text-[#2B2B2B]/50 dark:text-muted-foreground'>{label}</dt>
      <dd className='flex min-w-0 items-center gap-1'>
        <span
          className={`min-w-0 truncate text-sm text-[#2B2B2B] dark:text-foreground ${mono ? 'font-mono tracking-tight' : 'font-primary-medium'}`}
        >
          {display ?? value}
        </span>
        <button
          type='button'
          onClick={() => void copy()}
          aria-label={`Copiar ${label.toLowerCase()}`}
          className='shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[#2B2B2B]/45 hover:text-[#2B2B2B] hover:bg-[#2B2B2B]/5 dark:text-muted-foreground dark:hover:bg-muted transition-colors'
        >
          {copied ? <Check className='w-4 h-4 text-[#EBA2A8]' /> : <Copy className='w-4 h-4' />}
        </button>
      </dd>
    </div>
  );
}

function WhatsappButton({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='mt-5 w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#2B2B2B] text-[15px] font-primary-medium text-white transition-colors hover:bg-black'
    >
      <FaWhatsapp className='w-5 h-5 text-[#EBA2A8]' aria-hidden='true' />
      {label}
    </a>
  );
}
