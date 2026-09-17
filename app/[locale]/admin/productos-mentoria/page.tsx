'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Package } from 'lucide-react';
import {
  mentorshipApi,
  type MentorshipProduct,
  type MentorshipProductType,
} from '@/lib/mentorship-api';
import { getCategories, type Category } from '@/lib/api-client';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';

const TYPE_LABEL: Record<MentorshipProductType, string> = {
  MENTORSHIP: 'Mentoría online',
  ONE_TO_ONE: 'Clase one-to-one',
};

export default function ProductosMentoriaPage() {
  const [products, setProducts] = useState<MentorshipProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form de nuevo producto
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<MentorshipProductType>('MENTORSHIP');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteFor, setDeleteFor] = useState<MentorshipProduct | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, catRes] = await Promise.all([
        mentorshipApi.adminProducts(),
        getCategories({ isActive: true }),
      ]);
      setProducts(prods);
      setCategories(catRes.data.data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createProduct = async () => {
    if (!newName.trim()) {
      toast.error('Poné un nombre');
      return;
    }
    setCreating(true);
    try {
      await mentorshipApi.adminCreateProduct({
        name: newName.trim(),
        type: newType,
        categoryId: newCategoryId || null,
      });
      setNewName('');
      setNewCategoryId('');
      setNewType('MENTORSHIP');
      toast.success('Producto creado');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const toggleProduct = async (p: MentorshipProduct) => {
    try {
      await mentorshipApi.adminUpdateProduct(p.id, { isActive: !p.isActive });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const deleteProduct = async (p: MentorshipProduct) => {
    try {
      await mentorshipApi.adminDeleteProduct(p.id);
      setDeleteFor(null);
      toast.success('Producto borrado');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-6 min-h-[100dvh]'>
      <h1 className='mb-6 flex items-center gap-2 text-lg sm:text-xl font-primary-medium font-bold text-foreground'>
        <Package className='h-5 w-5 sm:h-6 sm:w-6 text-[#EBA2A8]' />
        Productos de mentoría
      </h1>

      {/* Nuevo producto */}
      <div className='mb-6 overflow-hidden rounded-2xl border border-border shadow-sm'>
        <div className='flex items-center gap-1.5 bg-[#1c1c1e] px-4 py-2.5 text-xs font-semibold text-[#EBA2A8]'>
          <Plus className='h-3.5 w-3.5' /> Nuevo producto
        </div>
        <div className='flex flex-col gap-3 bg-white p-4 dark:bg-card sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label className='mb-1 block text-xs text-muted-foreground'>Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Mentoría Estilismo'
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-muted-foreground'>Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as MentorshipProductType)}
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none sm:w-auto'
            >
              <option value='MENTORSHIP'>Mentoría online</option>
              <option value='ONE_TO_ONE'>Clase one-to-one</option>
            </select>
          </div>
          <div>
            <label className='mb-1 block text-xs text-muted-foreground'>Curso</label>
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none sm:w-auto'
            >
              <option value=''>Sin curso</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={createProduct}
            disabled={creating}
            className='flex items-center justify-center gap-2 rounded-lg bg-[#2B2B2B] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1f1f1f] active:scale-[0.98] disabled:opacity-50'
          >
            {creating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4 text-[#EBA2A8]' />}
            Crear
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className='space-y-4'>
        {products.length === 0 ? (
          <div className='py-12 text-center'>
            <Package className='mx-auto mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm font-medium text-foreground'>No hay productos todavía.</p>
            <p className='mt-1 text-xs text-muted-foreground'>Creá el primero con el formulario de arriba.</p>
          </div>
        ) : (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onChanged={load}
              onToggle={() => toggleProduct(p)}
              onDelete={() => setDeleteFor(p)}
            />
          ))
        )}
      </div>

      {deleteFor && (
        <ConfirmDialog
          title={`¿Borrar "${deleteFor.name}"?`}
          description='Se elimina el producto y todas sus variantes de precio. No se puede deshacer.'
          confirmLabel='Sí, borrar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => deleteProduct(deleteFor)}
          onClose={() => setDeleteFor(null)}
        />
      )}
    </div>
  );
}

function ProductCard({
  product,
  onChanged,
  onToggle,
  onDelete,
}: Readonly<{
  product: MentorshipProduct;
  onChanged: () => Promise<void>;
  onToggle: () => void;
  onDelete: () => void;
}>) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [adding, setAdding] = useState(false);
  const [deleteVariantFor, setDeleteVariantFor] =
    useState<MentorshipProduct['variants'][number] | null>(null);

  const addVariant = async () => {
    const amt = Number(amount);
    if (!label.trim() || !Number.isFinite(amt) || amt < 0) {
      toast.error('Completá etiqueta y monto');
      return;
    }
    setAdding(true);
    try {
      await mentorshipApi.adminAddVariant(product.id, {
        label: label.trim(),
        amount: amt,
        currency,
      });
      setLabel('');
      setAmount('');
      await onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const deleteVariant = async (id: string) => {
    try {
      await mentorshipApi.adminDeleteVariant(id);
      setDeleteVariantFor(null);
      await onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-white shadow-sm shadow-black/[0.04] dark:bg-card'>
      {/* Barra de status: indicador + switch explícito (no togglea al tocar la card) */}
      <div
        className={`flex w-full items-center gap-1.5 px-4 py-2 text-xs font-semibold ${
          product.isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-muted text-muted-foreground'
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${product.isActive ? 'bg-[#16A34A]' : 'bg-muted-foreground/50'}`} />
        {product.isActive ? 'Activo' : 'Inactivo'}
        <button
          type='button'
          role='switch'
          aria-checked={product.isActive}
          onClick={onToggle}
          aria-label={product.isActive ? 'Desactivar producto' : 'Activar producto'}
          className={`ml-auto relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            product.isActive ? 'bg-[#16A34A]' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              product.isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-base font-primary-medium leading-snug text-[#2B2B2B] dark:text-foreground'>
            {product.name}
          </h3>
          <button
            onClick={onDelete}
            className='-mr-1 shrink-0 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10 active:scale-95'
            aria-label='Borrar producto'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
        {/* Flag con tipo + curso */}
        <span className='mt-2 -ml-4 inline-flex items-center gap-1.5 rounded-r-full bg-[#8b1538] py-1 pl-3 pr-3 text-xs font-medium text-white shadow-sm'>
          <Package className='h-3.5 w-3.5' />
          {TYPE_LABEL[product.type]}
          {product.category ? ` · ${product.category.name}` : ' · sin curso'}
        </span>

        {/* Variantes */}
        <div className='mt-3 space-y-2'>
          {product.variants.length === 0 ? (
            <p className='text-xs text-muted-foreground'>Sin variantes de precio.</p>
          ) : (
            product.variants.map((v) => (
              <div
                key={v.id}
                className='flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm'
              >
                <span className='min-w-0'>
                  <span className='text-muted-foreground'>{v.label}:</span>{' '}
                  <span className='font-primary-medium text-[#8b1538] dark:text-[#EBA2A8]'>
                    {v.currency === 'USD'
                      ? `USD ${Math.round(Number(v.amount)).toLocaleString('en-US')}`
                      : `$${Math.round(Number(v.amount)).toLocaleString('es-AR')}`}
                  </span>
                  {!v.isActive && (
                    <span className='ml-2 text-xs text-muted-foreground'>(inactiva)</span>
                  )}
                </span>
                <button
                  onClick={() => setDeleteVariantFor(v)}
                  className='shrink-0 rounded p-1 text-red-500 transition-colors hover:bg-red-500/10 active:scale-95'
                  aria-label='Borrar variante'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Agregar variante */}
        <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Transferencia / Efectivo / Exterior'
            className='flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none'
          />
          <div className='flex gap-2'>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type='number'
              min={0}
              placeholder='Monto'
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none sm:w-28'
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'ARS' | 'USD')}
              className='rounded-lg border border-border bg-background px-2 py-2 text-sm transition-colors focus:border-[#EBA2A8] focus:outline-none'
            >
              <option value='ARS'>ARS</option>
              <option value='USD'>USD</option>
            </select>
          </div>
          <button
            onClick={addVariant}
            disabled={adding}
            className='flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-all hover:border-[#EBA2A8] active:scale-[0.98] disabled:opacity-50'
          >
            {adding ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4 text-[#8b1538]' />}
            Variante
          </button>
        </div>
      </div>

      {deleteVariantFor && (
        <ConfirmDialog
          title='¿Borrar esta variante?'
          description={`Se elimina "${deleteVariantFor.label}". No se puede deshacer.`}
          confirmLabel='Sí, borrar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => deleteVariant(deleteVariantFor.id)}
          onClose={() => setDeleteVariantFor(null)}
        />
      )}
    </div>
  );
}
