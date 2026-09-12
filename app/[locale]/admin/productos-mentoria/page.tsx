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
    if (!window.confirm(`¿Borrar "${p.name}" y sus variantes?`)) return;
    try {
      await mentorshipApi.adminDeleteProduct(p.id);
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
    <div className='mx-auto max-w-4xl px-4 py-6'>
      <div className='mb-6 flex items-center gap-2'>
        <Package className='h-5 w-5 text-[#EBA2A8]' />
        <h1 className='text-xl font-semibold text-foreground'>
          Productos de mentoría
        </h1>
      </div>

      {/* Nuevo producto */}
      <div className='mb-6 rounded-xl border border-border p-4'>
        <p className='mb-3 text-sm font-medium text-foreground'>Nuevo producto</p>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label className='mb-1 block text-xs text-muted-foreground'>Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Mentoría Estilismo'
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-muted-foreground'>Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as MentorshipProductType)}
              className='rounded-lg border border-border bg-background px-3 py-2 text-sm'
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
              className='rounded-lg border border-border bg-background px-3 py-2 text-sm'
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
            className='flex items-center justify-center gap-2 rounded-lg bg-[#2B2B2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f1f1f] disabled:opacity-50'
          >
            {creating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
            Crear
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className='space-y-4'>
        {products.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No hay productos todavía.
          </p>
        ) : (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onChanged={load}
              onToggle={() => toggleProduct(p)}
              onDelete={() => deleteProduct(p)}
            />
          ))
        )}
      </div>
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
      await onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className='rounded-xl border border-border p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className='text-sm font-semibold text-foreground'>{product.name}</p>
          <p className='text-xs text-muted-foreground'>
            {TYPE_LABEL[product.type]}
            {product.category ? ` · ${product.category.name}` : ' · sin curso'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={onToggle}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              product.isActive
                ? 'bg-green-500/15 text-green-600'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {product.isActive ? 'Activo' : 'Inactivo'}
          </button>
          <button
            onClick={onDelete}
            className='rounded-lg p-1.5 text-red-500 hover:bg-red-500/10'
            aria-label='Borrar producto'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Variantes */}
      <div className='mt-3 space-y-2'>
        {product.variants.length === 0 ? (
          <p className='text-xs text-muted-foreground'>Sin variantes de precio.</p>
        ) : (
          product.variants.map((v) => (
            <div
              key={v.id}
              className='flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm'
            >
              <span>
                <span className='text-muted-foreground'>{v.label}:</span>{' '}
                <span className='font-semibold'>
                  {v.currency === 'USD'
                    ? `USD ${Math.round(Number(v.amount)).toLocaleString('en-US')}`
                    : `$${Math.round(Number(v.amount)).toLocaleString('es-AR')}`}
                </span>
                {!v.isActive && (
                  <span className='ml-2 text-xs text-muted-foreground'>(inactiva)</span>
                )}
              </span>
              <button
                onClick={() => deleteVariant(v.id)}
                className='rounded p-1 text-red-500 hover:bg-red-500/10'
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
          className='flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm'
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type='number'
          min={0}
          placeholder='Monto'
          className='w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-sm'
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'ARS' | 'USD')}
          className='rounded-lg border border-border bg-background px-2 py-1.5 text-sm'
        >
          <option value='ARS'>ARS</option>
          <option value='USD'>USD</option>
        </select>
        <button
          onClick={addVariant}
          disabled={adding}
          className='flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-[#EBA2A8] disabled:opacity-50'
        >
          {adding ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
          Variante
        </button>
      </div>
    </div>
  );
}
