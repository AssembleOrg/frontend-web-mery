'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import {
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Gift,
  Hourglass,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Video,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BackButton } from '@/components/ui/back-button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { SlotPickerModal } from '@/components/mentorship/slot-picker-modal';
import { WA_URL } from '@/components/bank-transfer-modal';
import { Sheet } from '@/components/mentorship-shop/sheet';
import { ShopCover } from '@/components/mentorship-shop/product-card';
import { useAuth } from '@/hooks/useAuth';
import { mentorshipApi } from '@/lib/mentorship-api';
import {
  formatPrice,
  ORDER_STATUS_LABEL,
  shopApi,
  type MyShop,
  type ShopCredit,
} from '@/lib/mentorship-shop-api';

const TZ = 'America/Argentina/Buenos_Aires';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
const capFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const fmtSlot = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  });

export default function MisMentoriasPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const { user } = useAuth();

  const [data, setData] = useState<MyShop | null>(null);
  const [error, setError] = useState(false);
  const [bookFor, setBookFor] = useState<ShopCredit | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<ShopCredit | null>(null);
  const [cancelFor, setCancelFor] = useState<ShopCredit | null>(null);
  const [giftFor, setGiftFor] = useState<ShopCredit | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await shopApi.mine());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('mentorship:changed', onChanged);
    return () => window.removeEventListener('mentorship:changed', onChanged);
  }, [load]);

  const groups = useMemo(() => {
    const credits = data?.credits ?? [];
    return {
      available: credits.filter((c) => c.status === 'AVAILABLE'),
      scheduled: credits
        .filter((c) => c.status === 'USED' && c.mentorship?.status === 'SCHEDULED')
        .sort((a, b) => a.mentorship!.scheduledStart.localeCompare(b.mentorship!.scheduledStart)),
      done: credits.filter((c) => c.status === 'USED' && c.mentorship?.status === 'COMPLETED'),
      expired: credits.filter((c) => c.status === 'EXPIRED'),
    };
  }, [data]);

  const pendingOrders = data?.orders.filter((o) => o.status === 'PENDING') ?? [];

  const cancelMentorship = async (c: ShopCredit) => {
    if (!c.mentorship) return;
    try {
      await mentorshipApi.cancel(c.mentorship.id);
      toast.success('Mentoría cancelada. Podés reservar otro horario cuando quieras.');
      setCancelFor(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <ProtectedRoute>
      <div className='min-h-[100dvh] bg-[#FAFAFA] dark:bg-background'>
        <Navigation />
        <main className='mx-auto max-w-3xl px-4 pt-6 pb-[calc(4rem+env(safe-area-inset-bottom))]'>
          <BackButton href={`/${locale}/mentorias`} label='Tienda' className='mb-6' />

          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
              <span className='block h-px w-10 bg-[#EBA2A8]' aria-hidden='true' />
              <h1 className='mt-4 text-3xl sm:text-4xl font-primary uppercase tracking-[0.14em] text-[#2B2B2B] dark:text-foreground'>
                Mis mentorías
              </h1>
            </div>
            <Link
              href={`/${locale}/mentorias`}
              className='inline-flex min-h-11 items-center gap-2 rounded-full bg-white dark:bg-card px-5 text-sm font-primary-medium text-[#2B2B2B] dark:text-foreground ring-1 ring-[#2B2B2B]/10 dark:ring-border transition-colors hover:ring-[#EBA2A8]'
            >
              <ShoppingBag className='w-4 h-4 text-[#EBA2A8]' aria-hidden='true' /> Comprar mentorías
            </Link>
          </div>

          {error && (
            <div className='mt-8 rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-8 text-center'>
              <p className='font-primary-medium text-[#2B2B2B] dark:text-foreground'>No pudimos cargar tus mentorías</p>
              <button
                type='button'
                onClick={() => void load()}
                className='mt-5 min-h-11 rounded-full bg-[#2B2B2B] px-6 text-sm font-primary-medium text-white'
              >
                Reintentar
              </button>
            </div>
          )}

          {!data && !error && (
            <div className='mt-8 space-y-4' aria-hidden='true'>
              {[0, 1].map((i) => (
                <div key={i} className='h-32 rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 animate-pulse' />
              ))}
            </div>
          )}

          {data && (
            <div className='mt-8 space-y-10'>
              {pendingOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/${locale}/mentorias/compra/${o.id}`}
                  className='flex items-center gap-3 rounded-2xl bg-[#FBE8EA] dark:bg-[#3d2f31] px-4 py-3.5 ring-1 ring-[#EBA2A8]/60 transition-colors hover:ring-[#EBA2A8]'
                >
                  <Hourglass className='w-5 h-5 shrink-0 text-[#8b1538] dark:text-[#F9BBC4]' aria-hidden='true' />
                  <span className='min-w-0 flex-1 text-sm'>
                    <span className='block font-primary-medium text-[#8b1538] dark:text-[#F9BBC4]'>
                      Compra #{o.number} pendiente de pago
                    </span>
                    <span className='block text-[#2B2B2B]/65 dark:text-foreground/75'>
                      {formatPrice(o.total, o.currency)} · {o.paymentMethodLabel}
                    </span>
                  </span>
                  <ChevronRight className='w-5 h-5 shrink-0 text-[#2B2B2B]/40' aria-hidden='true' />
                </Link>
              ))}

              {data.credits.length === 0 && pendingOrders.length === 0 && (
                <div className='rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-10 text-center'>
                  <Sparkles className='mx-auto w-6 h-6 text-[#EBA2A8]' aria-hidden='true' />
                  <p className='mt-3 font-primary-medium text-[#2B2B2B] dark:text-foreground'>Todavía no compraste mentorías</p>
                  <p className='mt-1 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>
                    Cuando compres, acá las reservás y ves tus encuentros.
                  </p>
                  <Link
                    href={`/${locale}/mentorias`}
                    className='mt-6 inline-flex min-h-11 items-center rounded-full bg-[#EBA2A8] px-6 text-sm font-primary-medium text-white hover:bg-[#d89196]'
                  >
                    Ver mentorías
                  </Link>
                </div>
              )}

              {groups.scheduled.length > 0 && (
                <Group title='Agendadas'>
                  {groups.scheduled.map((c) => (
                    <ScheduledCard
                      key={c.id}
                      credit={c}
                      onReschedule={() => setRescheduleFor(c)}
                      onCancel={() => setCancelFor(c)}
                    />
                  ))}
                </Group>
              )}

              {groups.available.length > 0 && (
                <Group title='Para reservar' count={groups.available.length}>
                  {groups.available.map((c) => (
                    <AvailableCard
                      key={c.id}
                      credit={c}
                      giftsEnabled={data.giftsEnabled}
                      onBook={() => setBookFor(c)}
                      onGift={() => setGiftFor(c)}
                    />
                  ))}
                </Group>
              )}

              {groups.done.length > 0 && (
                <Group title='Realizadas'>
                  {groups.done.map((c) => (
                    <PastRow key={c.id} credit={c} label={c.mentorship ? `${capFirst(fmtSlot(c.mentorship.scheduledStart))} hs` : ''} />
                  ))}
                </Group>
              )}

              {groups.expired.length > 0 && (
                <Group title='Vencidas'>
                  {groups.expired.map((c) => (
                    <PastRow key={c.id} credit={c} label={c.expiresAt ? `Venció el ${fmtDate(c.expiresAt)}` : ''} muted />
                  ))}
                </Group>
              )}

              {data.orders.length > 0 && (
                <Group title='Compras'>
                  <ul className='divide-y divide-[#2B2B2B]/8 dark:divide-border rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border overflow-hidden'>
                    {data.orders.map((o) => (
                      <li key={o.id}>
                        <Link
                          href={`/${locale}/mentorias/compra/${o.id}`}
                          className='flex items-center gap-3 px-4 py-3 min-h-14 transition-colors hover:bg-[#FAFAFA] dark:hover:bg-muted'
                        >
                          <span className='min-w-0 flex-1'>
                            <span className='block text-sm text-[#2B2B2B] dark:text-foreground'>
                              #{o.number} · {fmtDate(o.createdAt)}
                            </span>
                            <span className='block text-xs text-[#2B2B2B]/55 dark:text-muted-foreground'>
                              {ORDER_STATUS_LABEL[o.status]}
                            </span>
                          </span>
                          <span className='text-sm tabular-nums text-[#2B2B2B]/75 dark:text-foreground/80'>
                            {formatPrice(o.total, o.currency)}
                          </span>
                          <ChevronRight className='w-4 h-4 text-[#2B2B2B]/30' aria-hidden='true' />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>

      {bookFor && bookFor.category && (
        <SlotPickerModal
          mode='book'
          categoryId={bookFor.category.id}
          creditId={bookFor.id}
          defaultEmail={user?.email ?? ''}
          subtitle={bookFor.product?.name}
          onClose={() => setBookFor(null)}
          onDone={() => {
            setBookFor(null);
            void load();
          }}
        />
      )}
      {rescheduleFor?.mentorship && rescheduleFor.category && (
        <SlotPickerModal
          mode='reschedule'
          categoryId={rescheduleFor.category.id}
          mentorshipId={rescheduleFor.mentorship.id}
          defaultEmail={user?.email ?? ''}
          subtitle={rescheduleFor.product?.name}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            void load();
          }}
        />
      )}
      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar la mentoría?'
          description='Se libera el horario y la mentoría vuelve a quedar disponible para reservar otro día. Se puede cancelar hasta 72 h antes.'
          confirmLabel='Sí, cancelar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => cancelMentorship(cancelFor)}
          onClose={() => setCancelFor(null)}
        />
      )}
      {giftFor && (
        <GiftSheet
          credit={giftFor}
          onClose={() => setGiftFor(null)}
          onDone={() => {
            setGiftFor(null);
            void load();
          }}
        />
      )}
    </ProtectedRoute>
  );
}

function Group({ title, count, children }: Readonly<{ title: string; count?: number; children: React.ReactNode }>) {
  return (
    <section>
      <h2 className='mb-3 flex items-baseline gap-2 text-xs uppercase tracking-[0.24em] text-[#2B2B2B]/60 dark:text-muted-foreground'>
        {title}
        {count != null && <span className='tabular-nums text-[#EBA2A8]'>{count}</span>}
      </h2>
      <div className='space-y-3'>{children}</div>
    </section>
  );
}

function CreditHeader({ credit }: Readonly<{ credit: ShopCredit }>) {
  return (
    <div className='flex items-center gap-3.5 min-w-0'>
      <div className='w-14 h-14 shrink-0 overflow-hidden rounded-2xl'>
        <ShopCover name={credit.product?.name ?? 'Mentoría'} imageUrl={credit.product?.imageUrl ?? null} compact />
      </div>
      <div className='min-w-0'>
        {credit.category && (
          <p className='text-[11px] uppercase tracking-[0.18em] text-[#8b1538] dark:text-[#F9BBC4] truncate'>
            {credit.category.name}
          </p>
        )}
        <p className='font-primary-medium leading-snug text-[#2B2B2B] dark:text-foreground'>
          {credit.product?.name ?? 'Mentoría'}
        </p>
      </div>
    </div>
  );
}

function AvailableCard({
  credit,
  giftsEnabled,
  onBook,
  onGift,
}: Readonly<{ credit: ShopCredit; giftsEnabled: boolean; onBook: () => void; onGift: () => void }>) {
  const isOneToOne = credit.type === 'ONE_TO_ONE';
  const waText = `Hola! Compré la clase "${credit.product?.name ?? 'one-to-one'}" (compra #${credit.orderNumber}) y quiero coordinar la fecha.`;
  return (
    <article className='rounded-3xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border p-4 sm:p-5'>
      <CreditHeader credit={credit} />
      <p className='mt-3 text-sm text-[#2B2B2B]/60 dark:text-muted-foreground'>
        {credit.giftedFrom && <span className='text-[#8b1538] dark:text-[#F9BBC4]'>Regalo de {credit.giftedFrom} · </span>}
        {credit.expiresAt ? `Reservala antes del ${fmtDate(credit.expiresAt)}` : 'Sin vencimiento'}
      </p>
      <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
        {isOneToOne ? (
          <a
            href={`${WA_URL}?text=${encodeURIComponent(waText)}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#2B2B2B] px-5 text-[15px] font-primary-medium text-white hover:bg-black transition-colors'
          >
            <FaWhatsapp className='w-5 h-5 text-[#EBA2A8]' aria-hidden='true' /> Coordinar fecha
          </a>
        ) : (
          <button
            type='button'
            onClick={onBook}
            disabled={!credit.category}
            className='flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#EBA2A8] px-5 text-[15px] font-primary-medium text-white hover:bg-[#d89196] transition-colors disabled:opacity-50'
          >
            <CalendarCheck className='w-5 h-5' aria-hidden='true' /> Reservar horario
          </button>
        )}
        {giftsEnabled && !credit.giftedFrom && (
          <button
            type='button'
            onClick={onGift}
            className='min-h-12 inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-primary-medium text-[#2B2B2B] dark:text-foreground ring-1 ring-[#2B2B2B]/12 dark:ring-border hover:ring-[#EBA2A8] transition-colors'
          >
            <Gift className='w-4 h-4 text-[#EBA2A8]' aria-hidden='true' /> Regalar
          </button>
        )}
      </div>
    </article>
  );
}

function ScheduledCard({
  credit,
  onReschedule,
  onCancel,
}: Readonly<{ credit: ShopCredit; onReschedule: () => void; onCancel: () => void }>) {
  const m = credit.mentorship!;
  const hoursLeft = (new Date(m.scheduledStart).getTime() - Date.now()) / 3_600_000;
  const canChange = hoursLeft >= 72;
  return (
    <article className='rounded-3xl bg-[#2B2B2B] text-white p-4 sm:p-5'>
      <div className='flex items-start gap-3'>
        <span className='w-11 h-11 shrink-0 rounded-2xl bg-[#EBA2A8] flex items-center justify-center'>
          <CalendarClock className='w-5 h-5' aria-hidden='true' />
        </span>
        <div className='min-w-0'>
          <p className='text-[11px] uppercase tracking-[0.18em] text-[#F9BBC4] truncate'>{credit.product?.name ?? 'Mentoría'}</p>
          <p className='mt-0.5 text-lg font-primary-medium leading-snug'>{capFirst(fmtSlot(m.scheduledStart))} hs</p>
          <p className='mt-0.5 text-sm text-white/55'>Hora de Argentina · sujeta a confirmación de Mery</p>
        </div>
      </div>
      <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
        {m.meetLink && (
          <a
            href={m.meetLink}
            target='_blank'
            rel='noopener noreferrer'
            className='flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#EBA2A8] px-5 text-[15px] font-primary-medium text-white hover:bg-[#d89196] transition-colors'
          >
            <Video className='w-5 h-5' aria-hidden='true' /> Entrar a la Meet
          </a>
        )}
        {canChange && m.canReschedule && (
          <button
            type='button'
            onClick={onReschedule}
            className='min-h-12 inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-primary-medium text-white ring-1 ring-white/20 hover:bg-white/10 transition-colors'
          >
            <RefreshCw className='w-4 h-4' aria-hidden='true' /> Reprogramar
          </button>
        )}
        {canChange && (
          <button
            type='button'
            onClick={onCancel}
            className='min-h-12 inline-flex items-center justify-center rounded-full px-5 text-sm text-white/60 hover:text-white transition-colors'
          >
            Cancelar
          </button>
        )}
      </div>
    </article>
  );
}

function PastRow({ credit, label, muted }: Readonly<{ credit: ShopCredit; label: string; muted?: boolean }>) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-card ring-1 ring-[#2B2B2B]/8 dark:ring-border px-4 py-3 ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <span className='min-w-0'>
        <span className='block text-sm text-[#2B2B2B] dark:text-foreground truncate'>{credit.product?.name ?? 'Mentoría'}</span>
        <span className='block text-xs text-[#2B2B2B]/55 dark:text-muted-foreground'>{label}</span>
      </span>
    </div>
  );
}

function GiftSheet({
  credit,
  onClose,
  onDone,
}: Readonly<{ credit: ShopCredit; onClose: () => void; onDone: () => void }>) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const r = await shopApi.gift(credit.id, email.trim());
      toast.success(`Le regalaste la mentoría a ${r.recipient}`);
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
      setSending(false);
    }
  };
  return (
    <Sheet
      title='Regalar mentoría'
      subtitle={credit.product?.name}
      icon={<Gift className='w-5 h-5' />}
      onClose={onClose}
    >
      <form onSubmit={(e) => void submit(e)} className='pb-[env(safe-area-inset-bottom)]'>
        <p className='text-sm leading-relaxed text-[#2B2B2B]/70 dark:text-foreground/80'>
          Pasá esta mentoría a otra cuenta. La persona tiene que estar registrada en la academia con ese email.
          Una vez regalada, deja de estar en tu cuenta.
        </p>
        <label htmlFor='gift-email' className='mt-5 block text-xs uppercase tracking-[0.16em] text-[#2B2B2B]/55 dark:text-muted-foreground mb-1.5'>
          Email de quien la recibe
        </label>
        <input
          id='gift-email'
          type='email'
          required
          autoComplete='email'
          inputMode='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full h-12 rounded-xl border border-[#2B2B2B]/15 dark:border-border bg-white dark:bg-background px-3.5 text-base text-[#2B2B2B] dark:text-foreground focus:border-[#EBA2A8] focus:outline-none focus:ring-2 focus:ring-[#EBA2A8]/30'
        />
        <button
          type='submit'
          disabled={sending || !email.trim()}
          className='mt-5 mb-2 w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#2B2B2B] text-[15px] font-primary-medium text-white hover:bg-black disabled:opacity-45 transition-colors'
        >
          {sending ? <Loader2 className='w-5 h-5 animate-spin' /> : <Gift className='w-5 h-5 text-[#EBA2A8]' />}
          Regalar
        </button>
      </form>
    </Sheet>
  );
}
