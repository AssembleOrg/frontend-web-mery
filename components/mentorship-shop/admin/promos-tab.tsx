'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { BadgePercent, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  shopApi,
  type AdminShopProduct,
  type AdminShopPromo,
  type PromoInput,
  type ShopPromoKind,
} from '@/lib/mentorship-shop-api';
import { Sheet } from '@/components/mentorship-shop/sheet';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { EmptyState, Field, ghostBtn, inputCls, primaryBtn, Switch, TextInput } from './admin-ui';

const TZ = 'America/Argentina/Buenos_Aires';
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  const sameYear =
    d.toLocaleDateString('en-CA', { year: 'numeric', timeZone: TZ }) ===
    new Date().toLocaleDateString('en-CA', { year: 'numeric', timeZone: TZ });
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: TZ,
  });
};

/** ISO → 'YYYY-MM-DD' en hora de Argentina (para el input date). */
const isoToDay = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ }) : '';
/** Día AR → ISO: desde las 00:00, hasta las 23:59:59 (Argentina, UTC−3 sin horario de verano). */
const dayToIso = (day: string, end: boolean) =>
  day ? new Date(`${day}T${end ? '23:59:59.999' : '00:00:00.000'}-03:00`).toISOString() : null;

function promoState(p: AdminShopPromo): { label: string; active: boolean } {
  const now = Date.now();
  if (!p.isActive) return { label: 'Pausada', active: false };
  if (p.validFrom && new Date(p.validFrom).getTime() > now) return { label: `Arranca ${fmtDay(p.validFrom)}`, active: false };
  if (p.validTo && new Date(p.validTo).getTime() < now) return { label: 'Vencida', active: false };
  if (p.maxUses != null && p.uses >= p.maxUses) return { label: 'Sin cupo', active: false };
  return { label: 'Activa', active: true };
}

export function PromosTab({
  promos,
  products,
  onChanged,
}: Readonly<{ promos: AdminShopPromo[]; products: AdminShopProduct[]; onChanged: () => void }>) {
  const [editing, setEditing] = useState<AdminShopPromo | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminShopPromo | null>(null);
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? '—';

  const remove = async (p: AdminShopPromo) => {
    try {
      await shopApi.adminDeletePromo(p.id);
      toast.success('Promo borrada');
      setDeleting(null);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-xs leading-relaxed text-muted-foreground max-w-md'>
          Se aplica una sola promo por compra: la que más le conviene a la alumna. Las promos no se suman a los packs.
        </p>
        <button type='button' onClick={() => setEditing('new')} className={primaryBtn}>
          <Plus className='w-4 h-4' /> Nueva promo
        </button>
      </div>
      {promos.length === 0 ? (
        <EmptyState
          icon={<BadgePercent className='w-9 h-9' />}
          title='Todavía no hay promos'
          text='Armá un 3x2, un 3x1 o un descuento por porcentaje, automático o con código.'
        />
      ) : (
        <div className='space-y-3'>
          {promos.map((p) => {
            const st = promoState(p);
            return (
              <article key={p.id} className='rounded-2xl border border-border bg-white dark:bg-card p-4'>
                <div className='flex items-start gap-3'>
                  <span className='shrink-0 rounded-xl bg-[#2B2B2B] px-2.5 py-2 text-sm font-semibold text-[#F9BBC4] tabular-nums'>
                    {p.label}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='font-semibold text-foreground leading-snug'>{p.name}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {p.code ? (
                        <>
                          Código <span className='font-mono text-foreground'>{p.code}</span>
                        </>
                      ) : (
                        'Automática'
                      )}
                      {' · '}
                      {p.appliesToAll ? 'Todas las mentorías' : p.productIds.map(productName).join(', ')}
                    </p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {p.validFrom || p.validTo
                        ? `${p.validFrom ? `Desde ${fmtDay(p.validFrom)}` : ''}${p.validFrom && p.validTo ? ' · ' : ''}${p.validTo ? `Hasta ${fmtDay(p.validTo)}` : ''}`
                        : 'Sin fecha de fin'}
                      {' · '}
                      {p.uses} {p.uses === 1 ? 'uso' : 'usos'}
                      {p.maxUses != null && ` de ${p.maxUses}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      st.active ? 'bg-[#EBA2A8] text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className='mt-3 flex gap-2'>
                  <button type='button' onClick={() => setEditing(p)} className={ghostBtn}>
                    <Pencil className='w-4 h-4' /> Editar
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeleting(p)}
                    className={`${ghostBtn} text-muted-foreground`}
                    aria-label={`Borrar ${p.name}`}
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <PromoSheet
          promo={editing === 'new' ? null : editing}
          products={products.filter((p) => p.shopEnabled)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`¿Borrar "${deleting.name}"?`}
          description='Deja de aplicarse. Las compras ya hechas no cambian.'
          confirmLabel='Sí, borrar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function PromoSheet({
  promo,
  products,
  onClose,
  onSaved,
}: Readonly<{ promo: AdminShopPromo | null; products: AdminShopProduct[]; onClose: () => void; onSaved: () => void }>) {
  const [name, setName] = useState(promo?.name ?? '');
  const [kind, setKind] = useState<ShopPromoKind>(promo?.kind ?? 'BUY_X_PAY_Y');
  const [buyQty, setBuyQty] = useState(promo?.buyQty ?? 3);
  const [payQty, setPayQty] = useState(promo?.payQty ?? 2);
  const [percent, setPercent] = useState(promo?.percent ? String(promo.percent) : '');
  const [withCode, setWithCode] = useState(!!promo?.code);
  const [code, setCode] = useState(promo?.code ?? '');
  const [appliesToAll, setAppliesToAll] = useState(promo?.appliesToAll ?? true);
  const [productIds, setProductIds] = useState<string[]>(promo?.productIds ?? []);
  const [validFrom, setValidFrom] = useState(isoToDay(promo?.validFrom ?? null));
  const [validTo, setValidTo] = useState(isoToDay(promo?.validTo ?? null));
  const [maxUses, setMaxUses] = useState(promo?.maxUses ? String(promo.maxUses) : '');
  const [isActive, setIsActive] = useState(promo?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return toast.error('Poné un nombre');
    const pct = Number.parseInt(percent, 10);
    if (kind === 'PERCENT' && !(pct >= 1 && pct <= 100)) return toast.error('El porcentaje va de 1 a 100');
    if (withCode && !/^[A-Za-z0-9_-]{3,40}$/.test(code.trim())) {
      return toast.error('El código va sin espacios: letras, números, - o _ (3 a 40)');
    }
    if (!appliesToAll && productIds.length === 0) return toast.error('Elegí al menos una mentoría');
    if (validFrom && validTo && validFrom > validTo) return toast.error('La fecha de fin es anterior a la de inicio');
    const uses = maxUses.trim() ? Number.parseInt(maxUses, 10) : null;
    const payload: PromoInput = {
      name: name.trim(),
      kind,
      buyQty: kind === 'BUY_X_PAY_Y' ? buyQty : null,
      payQty: kind === 'BUY_X_PAY_Y' ? payQty : null,
      percent: kind === 'PERCENT' ? pct : null,
      code: withCode ? code.trim().toUpperCase() : null,
      appliesToAll,
      productIds: appliesToAll ? [] : productIds,
      validFrom: dayToIso(validFrom, false),
      validTo: dayToIso(validTo, true),
      maxUses: uses && uses > 0 ? uses : null,
      isActive,
    };
    setSaving(true);
    try {
      if (promo) await shopApi.adminUpdatePromo(promo.id, payload);
      else await shopApi.adminCreatePromo(payload);
      toast.success(promo ? 'Promo guardada' : 'Promo creada');
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  };

  const qtyOptions = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ));

  return (
    <Sheet
      title={promo ? 'Editar promo' : 'Nueva promo'}
      icon={<BadgePercent className='w-5 h-5' />}
      onClose={onClose}
      size='lg'
      footer={
        <div className='grid grid-cols-2 gap-2'>
          <button type='button' onClick={onClose} className={ghostBtn}>
            Cancelar
          </button>
          <button type='button' onClick={() => void save()} disabled={saving} className={primaryBtn}>
            {saving && <Loader2 className='w-4 h-4 animate-spin' />} Guardar
          </button>
        </div>
      }
    >
      <div className='space-y-4'>
        <Field label='Nombre (lo ve la alumna)' htmlFor='promo-name'>
          <TextInput id='promo-name' value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder='Promo primavera' />
        </Field>

        <div>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>Tipo</p>
          <div role='radiogroup' className='grid grid-cols-2 gap-2'>
            {(
              [
                ['BUY_X_PAY_Y', 'Llevás X, pagás Y'],
                ['PERCENT', '% de descuento'],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type='button'
                role='radio'
                aria-checked={kind === v}
                onClick={() => setKind(v)}
                className={`min-h-11 rounded-xl px-3 text-sm transition-colors ${
                  kind === v
                    ? 'bg-[#2B2B2B] text-white dark:bg-[#F9BBC4] dark:text-[#2B2B2B]'
                    : 'border border-border text-foreground hover:border-[#EBA2A8]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {kind === 'BUY_X_PAY_Y' ? (
          <div className='grid grid-cols-2 gap-3'>
            <Field label='Llevás' htmlFor='promo-buy'>
              <select
                id='promo-buy'
                value={buyQty}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setBuyQty(b);
                  if (payQty >= b) setPayQty(b - 1);
                }}
                className={inputCls}
              >
                {qtyOptions(2, 10)}
              </select>
            </Field>
            <Field label='Pagás' htmlFor='promo-pay'>
              <select id='promo-pay' value={payQty} onChange={(e) => setPayQty(Number(e.target.value))} className={inputCls}>
                {qtyOptions(1, buyQty - 1)}
              </select>
            </Field>
            <p className='col-span-2 -mt-1 text-xs text-muted-foreground'>
              {buyQty}x{payQty}: de cada {buyQty} mentorías, {buyQty - payQty === 1 ? 'la más barata sale' : `las ${buyQty - payQty} más baratas salen`} gratis.
            </p>
          </div>
        ) : (
          <Field label='Porcentaje' htmlFor='promo-pct'>
            <div className='relative w-32'>
              <TextInput
                id='promo-pct'
                inputMode='numeric'
                value={percent}
                onChange={(e) => setPercent(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder='15'
                className='pr-8'
              />
              <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>%</span>
            </div>
          </Field>
        )}

        <Switch
          checked={withCode}
          onChange={setWithCode}
          label='Con código'
          description='Si no tiene código, se aplica sola en el carrito.'
        />
        {withCode && (
          <Field label='Código' htmlFor='promo-code'>
            <TextInput
              id='promo-code'
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              autoCapitalize='characters'
              autoCorrect='off'
              spellCheck={false}
              placeholder='MERY10'
              className='font-mono uppercase'
            />
          </Field>
        )}

        <Switch checked={appliesToAll} onChange={setAppliesToAll} label='Todas las mentorías' />
        {!appliesToAll && (
          <fieldset className='rounded-xl border border-border divide-y divide-border'>
            <legend className='sr-only'>Mentorías de la promo</legend>
            {products.length === 0 ? (
              <p className='px-3 py-3 text-sm text-muted-foreground'>No hay mentorías publicadas en la tienda.</p>
            ) : (
              products.map((p) => (
                <label key={p.id} className='flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2'>
                  <input
                    type='checkbox'
                    checked={productIds.includes(p.id)}
                    onChange={(e) =>
                      setProductIds((ids) => (e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id)))
                    }
                    className='w-5 h-5 accent-[#EBA2A8]'
                  />
                  <span className='text-sm text-foreground'>{p.name}</span>
                </label>
              ))
            )}
          </fieldset>
        )}

        <div className='grid grid-cols-2 gap-3'>
          <Field label='Desde (opcional)' htmlFor='promo-from'>
            <input id='promo-from' type='date' value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputCls} />
          </Field>
          <Field label='Hasta (opcional)' htmlFor='promo-to'>
            <input id='promo-to' type='date' value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label='Usos máximos (opcional)' htmlFor='promo-max' hint='Cuenta compras pagadas. Vacío = sin límite.'>
          <div className='w-40'>
            <TextInput
              id='promo-max'
              inputMode='numeric'
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ''))}
              placeholder='Sin límite'
            />
          </div>
        </Field>
        <Switch checked={isActive} onChange={setIsActive} label='Activa' />
      </div>
    </Sheet>
  );
}
