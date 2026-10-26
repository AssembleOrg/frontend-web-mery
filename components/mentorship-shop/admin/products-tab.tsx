'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, Package, Save } from 'lucide-react';
import { shopApi, type AdminShopProduct } from '@/lib/mentorship-shop-api';
import {
  EmptyState,
  Field,
  ImageField,
  MoneyInput,
  moneyToInput,
  parseMoney,
  primaryBtn,
  Switch,
  TextInput,
} from './admin-ui';

export function ProductsTab({
  products,
  onSaved,
}: Readonly<{ products: AdminShopProduct[]; onSaved: (p: AdminShopProduct) => void }>) {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className='w-9 h-9' />}
        title='No hay productos de mentoría'
        text='Crealos en "Productos mentoría" y después configuralos acá para la tienda.'
      />
    );
  }
  return (
    <div className='space-y-4'>
      <p className='text-xs leading-relaxed text-muted-foreground'>
        Los productos se crean en{' '}
        <Link href={`/${locale}/admin/productos-mentoria`} className='underline underline-offset-2 hover:text-foreground'>
          Productos mentoría
        </Link>
        . Acá definís cómo se ven y cuánto cuestan en la tienda.
      </p>
      {products.map((p) => (
        <ProductShopCard key={p.id} product={p} onSaved={onSaved} />
      ))}
    </div>
  );
}

function ProductShopCard({
  product,
  onSaved,
}: Readonly<{ product: AdminShopProduct; onSaved: (p: AdminShopProduct) => void }>) {
  const initial = {
    shopEnabled: product.shopEnabled,
    shopOnly: product.shopOnly,
    priceARS: moneyToInput(product.shopPriceARS),
    priceUSD: moneyToInput(product.shopPriceUSD),
    tagline: product.shopTagline ?? '',
    imageUrl: product.shopImageUrl,
    duration: product.shopDurationMin ? String(product.shopDurationMin) : '',
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Si cambia desde afuera (recarga), resincronizar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setForm(initial), [product]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    let priceARS: number | null;
    let priceUSD: number | null;
    try {
      priceARS = parseMoney(form.priceARS);
      priceUSD = parseMoney(form.priceUSD);
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
    const duration = form.duration.trim() ? Number.parseInt(form.duration, 10) : null;
    if (duration != null && (!Number.isFinite(duration) || duration < 5 || duration > 600)) {
      toast.error('La duración va de 5 a 600 minutos');
      return;
    }
    setSaving(true);
    try {
      const saved = await shopApi.adminUpdateProduct(product.id, {
        shopEnabled: form.shopEnabled,
        shopOnly: form.shopOnly,
        shopPriceARS: priceARS,
        shopPriceUSD: priceUSD,
        shopTagline: form.tagline.trim() || null,
        shopImageUrl: form.imageUrl,
        shopDurationMin: duration,
      });
      toast.success('Guardado');
      onSaved(saved);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const id = (k: string) => `${product.id}-${k}`;

  return (
    <article
      className={`rounded-2xl border bg-white dark:bg-card overflow-hidden ${
        form.shopEnabled ? 'border-[#EBA2A8]/60' : 'border-border'
      }`}
    >
      <div className='flex items-start justify-between gap-3 px-4 py-3 bg-[#1c1c1e] text-white'>
        <div className='min-w-0'>
          <p className='font-semibold leading-snug'>{product.name}</p>
          <p className='text-xs text-white/55'>
            {product.type === 'ONE_TO_ONE' ? 'Clase one-to-one' : 'Mentoría online'}
            {product.category ? ` · ${product.category.name}` : ' · sin curso'}
            {!product.isActive && ' · desactivado'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            product.shopEnabled ? 'bg-[#EBA2A8] text-white' : 'bg-white/10 text-white/60'
          }`}
        >
          {product.shopEnabled ? 'En la tienda' : 'Oculto'}
        </span>
      </div>

      <div className='p-4 space-y-4'>
        <Switch
          checked={form.shopEnabled}
          onChange={(v) => set('shopEnabled', v)}
          label='Mostrar en la tienda'
          description={
            product.type === 'MENTORSHIP' && !product.category
              ? 'Asignale un curso en "Productos mentoría" antes de publicarla.'
              : undefined
          }
        />
        <Switch
          checked={form.shopOnly}
          onChange={(v) => set('shopOnly', v)}
          label='Solo en la tienda'
          description='No aparece en el aviso de compra que ve la alumna dentro del curso.'
        />
        <div className='grid gap-3 sm:grid-cols-2'>
          <Field label='Precio en pesos' htmlFor={id('ars')}>
            <MoneyInput id={id('ars')} currency='ARS' value={form.priceARS} onChange={(v) => set('priceARS', v)} />
          </Field>
          <Field label='Precio en dólares (exterior)' htmlFor={id('usd')}>
            <MoneyInput id={id('usd')} currency='USD' value={form.priceUSD} onChange={(v) => set('priceUSD', v)} />
          </Field>
        </div>
        <div className='grid gap-3 sm:grid-cols-[1fr_140px]'>
          <Field label='Frase corta' htmlFor={id('tagline')}>
            <TextInput
              id={id('tagline')}
              value={form.tagline}
              maxLength={140}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder='Revisamos tus trabajos y armamos un plan'
            />
          </Field>
          <Field label='Duración (min)' htmlFor={id('duration')}>
            <TextInput
              id={id('duration')}
              inputMode='numeric'
              value={form.duration}
              onChange={(e) => set('duration', e.target.value.replace(/\D/g, ''))}
              placeholder='60'
            />
          </Field>
        </div>
        <ImageField value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />
        <div className='flex justify-end'>
          <button type='button' onClick={() => void save()} disabled={!dirty || saving} className={primaryBtn}>
            {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
            Guardar
          </button>
        </div>
      </div>
    </article>
  );
}
