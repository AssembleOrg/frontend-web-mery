'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  HOUR_OPTIONS,
  hourLabel,
  formatPriceLabel,
  type PresencialClass,
  type PresencialPrice,
} from '@/lib/presencial-api';
import { getCategories, type Category } from '@/lib/api-client';

/** Alta / edición de una clase presencial (fecha tentativa, horario 09–18). */
export function PresencialClassForm({
  initial,
  defaultDate,
  onClose,
  onSaved,
}: Readonly<{
  initial?: PresencialClass | null;
  /** YYYY-MM-DD para precargar al crear desde un día del calendario. */
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
}>) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? '');
  const [startHour, setStartHour] = useState(initial?.startHour ?? 10);
  const [endHour, setEndHour] = useState(initial?.endHour ?? 18);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initial?.categories.map((c) => c.id) ?? []),
  );
  const [restrict, setRestrict] = useState(initial?.restrictToStudents ?? false);
  const [prices, setPrices] = useState<PresencialPrice[]>([]);
  const [priceId, setPriceId] = useState(initial?.price?.id ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories({ isActive: true, limit: 100 })
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
    presencialApi
      .adminPrices()
      .then(setPrices)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Límite de 6 meses hacia adelante (mismo criterio que el backend).
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const max = new Date();
  max.setMonth(max.getMonth() + 6);
  const maxDate = max.toISOString().slice(0, 10);

  const toggleCat = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function save() {
    if (!title.trim()) return toast.error('Poné un título');
    if (!date) return toast.error('Elegí una fecha');
    if (endHour <= startHour) return toast.error('El fin debe ser posterior al inicio');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        date,
        startHour,
        endHour,
        categoryIds: Array.from(selected),
        restrictToStudents: restrict,
        priceId: priceId || null,
      };
      if (initial) {
        await presencialApi.adminUpdate(initial.id, payload);
        toast.success('Clase actualizada');
      } else {
        await presencialApi.adminCreate(payload);
        toast.success('Clase creada');
      }
      window.dispatchEvent(new CustomEvent('presencial:changed'));
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4'>
      <button type='button' aria-label='Cerrar' onClick={onClose} className='absolute inset-0 bg-black/40' />
      <div className='relative w-full sm:max-w-lg bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]'>
        <div className='flex items-center justify-between px-5 py-4 bg-[#2B2B2B] text-white rounded-t-2xl shrink-0'>
          <h3 className='font-semibold'>
            {initial ? 'Editar clase presencial' : 'Nueva clase presencial'}
          </h3>
          <button type='button' onClick={onClose} className='p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
          <div>
            <label className='block text-xs font-medium text-muted-foreground mb-1'>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Presencial Estilismo (Módulo I)'
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-muted-foreground mb-1'>
              Descripción (opcional, la ve la alumna)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-muted-foreground mb-1'>
              Seña
            </label>
            <select
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
            >
              <option value=''>Sin seña — no se puede reservar</option>
              {prices
                .filter((p) => p.isActive || p.id === priceId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatPriceLabel(p)}
                    {p.isActive ? '' : ' (inactivo)'}
                  </option>
                ))}
            </select>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              {priceId
                ? 'La alumna acepta el disclaimer y paga por Mercado Pago para reservar.'
                : 'Sin seña la fecha se muestra en el calendario pero no se puede reservar.'}
            </p>
          </div>

          <div className='grid grid-cols-3 gap-2'>
            <div className='col-span-3 sm:col-span-1'>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>Fecha</label>
              <input
                type='date'
                value={date}
                min={minDate}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>Desde</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
              >
                {HOUR_OPTIONS.filter((h) => h < 18).map((h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-muted-foreground mb-1'>Hasta</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background'
              >
                {HOUR_OPTIONS.filter((h) => h > 9).map((h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </div>
          </div>
          <p className='text-[11px] text-muted-foreground -mt-2'>
            Horario 24 hs, de 09:00 a 18:00. Hasta 6 meses hacia adelante.
          </p>

          <div>
            <label className='block text-xs font-medium text-muted-foreground mb-2'>Formaciones</label>
            <div className='flex flex-wrap gap-2'>
              {categories.map((c) => {
                const on = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    type='button'
                    onClick={() => toggleCat(c.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      on
                        ? 'bg-[#2B2B2B] text-white border-[#2B2B2B]'
                        : 'border-border text-foreground hover:border-[#EBA2A8]'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className='flex items-start gap-2 text-sm'>
            <input
              type='checkbox'
              checked={restrict}
              onChange={(e) => setRestrict(e.target.checked)}
              className='mt-0.5'
            />
            <span>
              Solo alumnas de esas formaciones
              <span className='block text-[11px] text-muted-foreground'>
                Si está apagado, cualquier usuaria logueada puede anotarse.
              </span>
            </span>
          </label>
        </div>

        <div className='p-4 border-t border-border flex gap-2 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:border-[#EBA2A8]'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={save}
            disabled={saving}
            className='flex-1 py-2.5 rounded-lg bg-[#2B2B2B] text-white text-sm font-semibold hover:bg-[#1f1f1f] disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {saving && <Loader2 className='w-4 h-4 animate-spin' />}
            {initial ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}
