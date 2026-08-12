'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Gift,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  Send,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import {
  getPromoCampaigns,
  createPromoCampaign,
  updatePromoCampaign,
  deletePromoCampaign,
  getPromoEligible,
  issuePromoRewards,
  type PromoCampaign,
} from '@/lib/api-client';

type Draft = {
  id: string | null;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  rewardDiscountPercent: string;
  rewardValidityDays: string;
  rewardExcludeOwned: boolean;
};

const EMPTY: Draft = {
  id: null,
  name: '',
  description: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  rewardDiscountPercent: '20',
  rewardValidityDays: '90',
  rewardExcludeOwned: true,
};

function toDateInput(iso: string): string {
  return iso ? iso.slice(0, 10) : '';
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export default function AdminPromosPage() {
  const [items, setItems] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getPromoCampaigns());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => setDraft({ ...EMPTY });
  const openEdit = (c: PromoCampaign) =>
    setDraft({
      id: c.id,
      name: c.name,
      description: c.description ?? '',
      startsAt: toDateInput(c.startsAt),
      endsAt: toDateInput(c.endsAt),
      isActive: c.isActive,
      rewardDiscountPercent: c.rewardDiscountPercent?.toString() ?? '',
      rewardValidityDays: c.rewardValidityDays.toString(),
      rewardExcludeOwned: c.rewardExcludeOwned,
    });

  async function save() {
    if (!draft) return;
    if (!draft.name.trim() || !draft.startsAt || !draft.endsAt) {
      toast.error('Completá nombre, inicio y fin');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        isActive: draft.isActive,
        rewardDiscountPercent: draft.rewardDiscountPercent
          ? Number(draft.rewardDiscountPercent)
          : undefined,
        rewardValidityDays: draft.rewardValidityDays
          ? Number(draft.rewardValidityDays)
          : undefined,
        rewardExcludeOwned: draft.rewardExcludeOwned,
      };
      if (draft.id) await updatePromoCampaign(draft.id, payload);
      else await createPromoCampaign(payload);
      toast.success('Campaña guardada');
      setDraft(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: PromoCampaign) {
    if (!confirm(`¿Eliminar la campaña "${c.name}"?`)) return;
    try {
      await deletePromoCampaign(c.id);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      toast.success('Campaña eliminada');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function preview(c: PromoCampaign) {
    setBusyId(c.id);
    try {
      const r = await getPromoEligible(c.id);
      toast(
        `${r.eligibleCount} alumna(s) elegibles${r.alreadyIssued ? ' · ya emitido' : ''}`,
        { icon: '👥' },
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function issue(c: PromoCampaign) {
    const ended = new Date(c.endsAt) < new Date();
    const force = !ended;
    const msg = force
      ? `La promo "${c.name}" todavía no terminó. ¿Emitir igual (forzar) los cupones-regalo?`
      : `Emitir los cupones-regalo de "${c.name}" a quienes compraron en la ventana?`;
    if (!confirm(msg)) return;
    setBusyId(c.id);
    try {
      const r = await issuePromoRewards(c.id, force);
      toast.success(
        `${r.issued} emitido(s), ${r.emailed} email(s)${r.skipped ? `, ${r.skipped} ya tenían` : ''}`,
      );
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-xl font-bold text-foreground flex items-center gap-2'>
          <Gift className='w-6 h-6 text-[#eba2a8]' />
          Promos
        </h1>
        <button
          type='button'
          onClick={openNew}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f9bbc4] text-white font-semibold hover:bg-[#eba2a8]'
        >
          <PlusCircle className='w-4 h-4' /> Nueva campaña
        </button>
      </div>

      <p className='text-xs text-muted-foreground mb-4'>
        El descuento general (ej. 40%) se crea en{' '}
        <span className='font-medium'>Cupones</span>. Acá gestionás la campaña y
        el <span className='font-medium'>cupón-regalo</span> que reciben quienes
        compran en la ventana, emitido al cerrar la promo.
      </p>

      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      ) : items.length === 0 ? (
        <p className='text-center text-sm text-muted-foreground py-10'>
          Todavía no hay campañas.
        </p>
      ) : (
        <div className='space-y-3'>
          {items.map((c) => {
            const ended = new Date(c.endsAt) < new Date();
            return (
              <div
                key={c.id}
                className='rounded-xl border border-border bg-white dark:bg-card p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='font-semibold text-foreground'>{c.name}</span>
                      {!c.isActive && (
                        <span className='text-[10px] rounded-full px-1.5 py-0.5 bg-gray-100 text-gray-500'>
                          inactiva
                        </span>
                      )}
                      {c.rewardsIssuedAt && (
                        <span className='text-[10px] rounded-full px-1.5 py-0.5 bg-green-100 text-green-700'>
                          regalos emitidos
                        </span>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {fmt(c.startsAt)} → {fmt(c.endsAt)}
                      {c.rewardDiscountPercent
                        ? ` · regalo ${c.rewardDiscountPercent}% (${c.rewardValidityDays}d${c.rewardExcludeOwned ? ', otra formación' : ''})`
                        : ' · sin recompensa'}
                      {typeof c.issuedCouponsCount === 'number' &&
                        c.issuedCouponsCount > 0 &&
                        ` · ${c.issuedCouponsCount} cupón(es)`}
                    </div>
                  </div>
                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      type='button'
                      onClick={() => openEdit(c)}
                      title='Editar'
                      className='p-2 rounded-md hover:bg-muted text-muted-foreground'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => void remove(c)}
                      title='Eliminar'
                      className='p-2 rounded-md hover:bg-red-50 text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {c.rewardDiscountPercent && (
                  <div className='flex items-center gap-2 mt-3 pt-3 border-t border-border/60'>
                    <button
                      type='button'
                      disabled={busyId === c.id}
                      onClick={() => void preview(c)}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:border-[#f9bbc4] disabled:opacity-50'
                    >
                      <Users className='w-3.5 h-3.5' /> Ver elegibles
                    </button>
                    <button
                      type='button'
                      disabled={busyId === c.id || !!c.rewardsIssuedAt}
                      onClick={() => void issue(c)}
                      title={ended ? 'Emitir cupones-regalo' : 'La promo no terminó (se emite forzado)'}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#660e1b] text-white hover:opacity-90 disabled:opacity-40'
                    >
                      {busyId === c.id ? (
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      ) : (
                        <Send className='w-3.5 h-3.5' />
                      )}
                      {c.rewardsIssuedAt ? 'Ya emitido' : ended ? 'Emitir cupones' : 'Emitir (forzar)'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {draft && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='Cerrar'
            onClick={() => setDraft(null)}
            className='absolute inset-0 bg-black/40'
          />
          <div className='relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
              <h3 className='font-bold text-foreground'>
                {draft.id ? 'Editar campaña' : 'Nueva campaña'}
              </h3>
              <button
                type='button'
                onClick={() => setDraft(null)}
                className='p-1.5 rounded-full hover:bg-muted text-muted-foreground'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='p-4 space-y-3'>
              <Field label='Nombre'>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={inputCls}
                  placeholder='Bienvenida 40% agosto'
                />
              </Field>
              <Field label='Descripción (opcional)'>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Inicio'>
                  <input
                    type='date'
                    value={draft.startsAt}
                    onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label='Fin'>
                  <input
                    type='date'
                    value={draft.endsAt}
                    onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Regalo % (vacío = sin regalo)'>
                  <input
                    type='number'
                    value={draft.rewardDiscountPercent}
                    onChange={(e) =>
                      setDraft({ ...draft, rewardDiscountPercent: e.target.value })
                    }
                    className={inputCls}
                    placeholder='20'
                  />
                </Field>
                <Field label='Validez (días)'>
                  <input
                    type='number'
                    value={draft.rewardValidityDays}
                    onChange={(e) =>
                      setDraft({ ...draft, rewardValidityDays: e.target.value })
                    }
                    className={inputCls}
                    placeholder='90'
                  />
                </Field>
              </div>
              <label className='flex items-center gap-2 text-sm text-foreground'>
                <input
                  type='checkbox'
                  checked={draft.rewardExcludeOwned}
                  onChange={(e) =>
                    setDraft({ ...draft, rewardExcludeOwned: e.target.checked })
                  }
                />
                El regalo excluye formaciones ya compradas (otra formación)
              </label>
              <label className='flex items-center gap-2 text-sm text-foreground'>
                <input
                  type='checkbox'
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                />
                Campaña activa
              </label>
            </div>
            <div className='flex items-center justify-end gap-2 px-4 py-3 border-t border-border'>
              <button
                type='button'
                onClick={() => setDraft(null)}
                className='px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={() => void save()}
                disabled={saving}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#f9bbc4] text-white hover:bg-[#eba2a8] disabled:opacity-50'
              >
                {saving ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Check className='w-4 h-4' />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]';

function Field({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className='block'>
      <span className='block text-xs font-medium text-muted-foreground mb-1'>
        {label}
      </span>
      {children}
    </label>
  );
}
