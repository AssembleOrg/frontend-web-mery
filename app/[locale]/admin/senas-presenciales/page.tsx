'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import {
  presencialApi,
  type PresencialPrice,
} from '@/lib/presencial-api';

/**
 * Listado de señas de clases presenciales. Cada fecha del calendario apunta a
 * una de estas; una fecha sin seña no se puede reservar.
 */
export default function SenasPresencialesPage() {
  const [prices, setPrices] = useState<PresencialPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newUSD, setNewUSD] = useState('');
  const [newARS, setNewARS] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPrices(await presencialApi.adminPrices());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    if (!newName.trim()) return toast.error('Poné un nombre');
    const usd = newUSD ? Number(newUSD) : null;
    const ars = newARS ? Number(newARS) : null;
    if (!usd && !ars) return toast.error('Cargá un monto en dólares o en pesos');
    setCreating(true);
    try {
      await presencialApi.adminCreatePrice({
        name: newName.trim(),
        amountUSD: usd,
        amountARS: ars,
        sortOrder: prices.length + 1,
      });
      toast.success('Seña creada');
      setNewName('');
      setNewUSD('');
      setNewARS('');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function patch(p: PresencialPrice, data: Partial<PresencialPrice>) {
    try {
      await presencialApi.adminUpdatePrice(p.id, data);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
      await load();
    }
  }

  async function remove(p: PresencialPrice) {
    try {
      const res = await presencialApi.adminDeletePrice(p.id);
      toast.success(
        res.classesLeftWithoutPrice > 0
          ? `Seña borrada · ${res.classesLeftWithoutPrice} fecha(s) quedaron sin seña`
          : 'Seña borrada',
      );
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className='max-w-3xl'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
          <Wallet className='w-6 h-6 text-[var(--mg-pink)]' />
          Señas de presenciales
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Cada fecha del calendario apunta a una de estas señas. Una fecha sin seña
          se muestra pero no se puede reservar. Si cargás monto en pesos, se cobra
          ese; si solo hay dólares, se convierte con la cotización del panel de
          configuración.
        </p>
      </div>

      {/* Alta */}
      <div className='bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6'>
        <h2 className='font-semibold text-gray-900 mb-3'>Nueva seña</h2>
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-2'>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='Nombre (ej. Nanoblading)'
            className='sm:col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm'
          />
          <input
            value={newUSD}
            onChange={(e) => setNewUSD(e.target.value)}
            type='number'
            min={0}
            placeholder='USD'
            className='px-3 py-2 rounded-lg border border-gray-200 text-sm'
          />
          <input
            value={newARS}
            onChange={(e) => setNewARS(e.target.value)}
            type='number'
            min={0}
            placeholder='ARS (opcional)'
            className='px-3 py-2 rounded-lg border border-gray-200 text-sm'
          />
        </div>
        <button
          onClick={() => void create()}
          disabled={creating}
          className='mt-3 px-4 py-2 rounded-lg bg-[#f9bbc4] text-[#660e1b] font-medium text-sm disabled:opacity-40 flex items-center gap-2'
        >
          {creating ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Plus className='w-4 h-4' />
          )}
          Agregar
        </button>
      </div>

      {/* Listado */}
      {loading ? (
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Loader2 className='w-4 h-4 animate-spin' /> Cargando…
        </div>
      ) : prices.length === 0 ? (
        <p className='text-sm text-gray-500'>
          Todavía no hay señas cargadas.
        </p>
      ) : (
        <div className='space-y-3'>
          {prices.map((p) => (
            <div
              key={p.id}
              className='bg-white border border-gray-100 rounded-xl p-4 shadow-sm'
            >
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <input
                  defaultValue={p.name}
                  onBlur={(e) => {
                    const name = e.target.value.trim();
                    if (name && name !== p.name) void patch(p, { name });
                  }}
                  className='flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium'
                />
                <div className='flex items-center gap-2'>
                  <label className='text-xs text-gray-500'>USD</label>
                  <input
                    defaultValue={p.amountUSD ?? ''}
                    type='number'
                    min={0}
                    onBlur={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null;
                      if (v !== p.amountUSD) void patch(p, { amountUSD: v });
                    }}
                    className='w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm'
                  />
                  <label className='text-xs text-gray-500'>ARS</label>
                  <input
                    defaultValue={p.amountARS ?? ''}
                    type='number'
                    min={0}
                    onBlur={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null;
                      if (v !== p.amountARS) void patch(p, { amountARS: v });
                    }}
                    className='w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm'
                  />
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    onClick={() => void patch(p, { isActive: !p.isActive })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      p.isActive
                        ? 'bg-[var(--mg-pink-light)] text-[#660e1b]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                  <button
                    onClick={() => void remove(p)}
                    title='Borrar'
                    className='p-2 rounded-lg text-[#8b1538] hover:bg-[var(--mg-pink-light)]'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
              {p.amountARS != null && p.amountUSD != null && (
                <p className='mt-2 text-[11px] text-gray-500'>
                  Tiene los dos montos cargados: se cobra el de pesos y se ignora el
                  de dólares.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
