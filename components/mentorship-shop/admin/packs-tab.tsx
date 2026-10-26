'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Boxes, Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import {
  formatPrice,
  shopApi,
  type AdminShopPack,
  type AdminShopProduct,
} from '@/lib/mentorship-shop-api';
import { Sheet } from '@/components/mentorship-shop/sheet';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import {
  EmptyState,
  Field,
  ghostBtn,
  ImageField,
  inputCls,
  MoneyInput,
  moneyToInput,
  parseMoney,
  primaryBtn,
  Switch,
  TextInput,
} from './admin-ui';

export function PacksTab({
  packs,
  products,
  onChanged,
}: Readonly<{ packs: AdminShopPack[]; products: AdminShopProduct[]; onChanged: () => void }>) {
  const [editing, setEditing] = useState<AdminShopPack | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminShopPack | null>(null);

  const remove = async (p: AdminShopPack) => {
    try {
      await shopApi.adminDeletePack(p.id);
      toast.success('Pack borrado');
      setDeleting(null);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className='mb-4 flex justify-end'>
        <button type='button' onClick={() => setEditing('new')} className={primaryBtn}>
          <Plus className='w-4 h-4' /> Nuevo pack
        </button>
      </div>
      {packs.length === 0 ? (
        <EmptyState
          icon={<Boxes className='w-9 h-9' />}
          title='Todavía no hay packs'
          text='Combiná mentorías con un precio especial (ej. Módulo 1 + Módulo 2).'
        />
      ) : (
        <div className='space-y-3'>
          {packs.map((p) => (
            <article key={p.id} className='rounded-2xl border border-border bg-white dark:bg-card p-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='flex items-center gap-1.5 font-semibold text-foreground'>
                    {p.featured && <Star className='w-4 h-4 shrink-0 fill-[#EBA2A8] text-[#EBA2A8]' aria-label='Destacado' />}
                    <span className='truncate'>{p.name}</span>
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {p.items.map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}`).join(' · ')}
                  </p>
                  <p className='mt-2 text-sm tabular-nums text-foreground'>
                    {[p.priceARS != null && formatPrice(p.priceARS, 'ARS'), p.priceUSD != null && formatPrice(p.priceUSD, 'USD')]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    p.isActive ? 'bg-[#EBA2A8] text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {p.isActive ? 'Activo' : 'Pausado'}
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
          ))}
        </div>
      )}

      {editing && (
        <PackSheet
          pack={editing === 'new' ? null : editing}
          products={products}
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
          description='Deja de verse en la tienda. Las compras ya hechas no cambian.'
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

type ItemRow = { productId: string; quantity: number };

function PackSheet({
  pack,
  products,
  onClose,
  onSaved,
}: Readonly<{ pack: AdminShopPack | null; products: AdminShopProduct[]; onClose: () => void; onSaved: () => void }>) {
  const selectable = products.filter((p) => p.isActive && (p.type === 'ONE_TO_ONE' || p.category));
  const [name, setName] = useState(pack?.name ?? '');
  const [tagline, setTagline] = useState(pack?.tagline ?? '');
  const [priceARS, setPriceARS] = useState(moneyToInput(pack?.priceARS ?? null));
  const [priceUSD, setPriceUSD] = useState(moneyToInput(pack?.priceUSD ?? null));
  const [imageUrl, setImageUrl] = useState<string | null>(pack?.imageUrl ?? null);
  const [isActive, setIsActive] = useState(pack?.isActive ?? true);
  const [featured, setFeatured] = useState(pack?.featured ?? false);
  const [items, setItems] = useState<ItemRow[]>(
    pack?.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) ?? [{ productId: '', quantity: 1 }],
  );
  const [saving, setSaving] = useState(false);

  const setItem = (idx: number, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  // Referencia: lo que costarían sueltas (solo con precio de tienda).
  const sum = (key: 'shopPriceARS' | 'shopPriceUSD') => {
    let total = 0;
    for (const r of items) {
      const p = products.find((x) => x.id === r.productId);
      if (!p || p[key] == null) return null;
      total += (p[key] as number) * r.quantity;
    }
    return items.length ? total : null;
  };
  const sumARS = sum('shopPriceARS');
  const sumUSD = sum('shopPriceUSD');

  const save = async () => {
    const valid = items.filter((r) => r.productId);
    if (!name.trim()) return toast.error('Poné un nombre');
    if (valid.length === 0) return toast.error('Agregá al menos una mentoría');
    if (new Set(valid.map((r) => r.productId)).size !== valid.length) {
      return toast.error('Hay mentorías repetidas: usá la cantidad');
    }
    let ars: number | null;
    let usd: number | null;
    try {
      ars = parseMoney(priceARS);
      usd = parseMoney(priceUSD);
    } catch (e) {
      return toast.error((e as Error).message);
    }
    if (ars == null && usd == null) return toast.error('Cargá al menos un precio');
    setSaving(true);
    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || null,
      description: null,
      imageUrl,
      priceARS: ars,
      priceUSD: usd,
      isActive,
      featured,
      sortOrder: pack?.sortOrder ?? 0,
      items: valid,
    };
    try {
      if (pack) await shopApi.adminUpdatePack(pack.id, payload);
      else await shopApi.adminCreatePack(payload);
      toast.success(pack ? 'Pack guardado' : 'Pack creado');
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <Sheet
      title={pack ? 'Editar pack' : 'Nuevo pack'}
      icon={<Boxes className='w-5 h-5' />}
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
        <Field label='Nombre' htmlFor='pack-name'>
          <TextInput id='pack-name' value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder='Pack Módulos' />
        </Field>
        <Field label='Frase corta' htmlFor='pack-tagline'>
          <TextInput
            id='pack-tagline'
            value={tagline}
            maxLength={140}
            onChange={(e) => setTagline(e.target.value)}
            placeholder='Las dos mentorías con precio especial'
          />
        </Field>

        <div>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>Mentorías incluidas</p>
          <div className='space-y-2'>
            {items.map((r, idx) => (
              <div key={idx} className='flex gap-2'>
                <select
                  value={r.productId}
                  onChange={(e) => setItem(idx, { productId: e.target.value })}
                  aria-label={`Mentoría ${idx + 1}`}
                  className={`${inputCls} flex-1 min-w-0`}
                >
                  <option value=''>Elegí una mentoría</option>
                  {selectable.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className='w-20 shrink-0'>
                  <select
                    value={r.quantity}
                    onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                    aria-label='Cantidad'
                    className={inputCls}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}×
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type='button'
                  onClick={() => setItems((rows) => rows.filter((_, i) => i !== idx))}
                  disabled={items.length === 1}
                  aria-label='Quitar'
                  className='w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
          <button
            type='button'
            onClick={() => setItems((rows) => [...rows, { productId: '', quantity: 1 }])}
            className='mt-2 inline-flex min-h-10 items-center gap-1.5 text-sm text-[#8b1538] dark:text-[#F9BBC4]'
          >
            <Plus className='w-4 h-4' /> Agregar mentoría
          </button>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <Field
            label='Precio del pack en pesos'
            htmlFor='pack-ars'
            hint={sumARS != null ? `Sueltas: ${formatPrice(sumARS, 'ARS')}` : undefined}
          >
            <MoneyInput id='pack-ars' currency='ARS' value={priceARS} onChange={setPriceARS} />
          </Field>
          <Field
            label='Precio del pack en dólares'
            htmlFor='pack-usd'
            hint={sumUSD != null ? `Sueltas: ${formatPrice(sumUSD, 'USD')}` : undefined}
          >
            <MoneyInput id='pack-usd' currency='USD' value={priceUSD} onChange={setPriceUSD} />
          </Field>
        </div>
        <ImageField value={imageUrl} onChange={setImageUrl} label='Imagen (opcional)' />
        <Switch checked={featured} onChange={setFeatured} label='Destacado' description='Aparece primero en la tienda.' />
        <Switch checked={isActive} onChange={setIsActive} label='Activo' description='Si lo pausás, deja de verse en la tienda.' />
      </div>
    </Sheet>
  );
}
