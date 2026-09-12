'use client';

import { useCallback, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Plus, Pencil, Trash2, Loader2, Users, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  hourLabel,
  formatPresencialDate,
  CLASS_STATUS_LABEL,
  type PresencialClassAdmin,
} from '@/lib/presencial-api';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { PresencialClassForm } from './presencial-class-form';

const STATUS_STYLE: Record<PresencialClassAdmin['status'], string> = {
  TENTATIVE: 'border border-dashed border-[#EBA2A8] text-[#8b1538] bg-[#fbe8ea]/60',
  CONFIRMED: 'bg-[#EBA2A8] text-[#2B2B2B]',
  CANCELLED: 'bg-muted text-muted-foreground line-through',
  COMPLETED: 'bg-muted text-muted-foreground',
};

/** CRUD de clases presenciales (lista). Confirmar/cancelar también desde acá. */
export function AdminPresencialesList() {
  const [rows, setRows] = useState<PresencialClassAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [form, setForm] = useState<{ open: boolean; initial: PresencialClassAdmin | null }>({
    open: false,
    initial: null,
  });
  const [confirmFor, setConfirmFor] = useState<PresencialClassAdmin | null>(null);
  const [cancelFor, setCancelFor] = useState<PresencialClassAdmin | null>(null);
  const [deleteFor, setDeleteFor] = useState<PresencialClassAdmin | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = showPast
        ? undefined
        : DateTime.now().setZone('America/Argentina/Buenos_Aires').startOf('day').toUTC().toISO()!;
      setRows(await presencialApi.adminCalendar({ from }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showPast]);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('presencial:changed', onChanged);
    return () => window.removeEventListener('presencial:changed', onChanged);
  }, [load]);

  const emit = () => window.dispatchEvent(new CustomEvent('presencial:changed'));

  async function confirm(c: PresencialClassAdmin) {
    const r = await presencialApi.adminConfirmClass(c.id);
    setConfirmFor(null);
    toast.success(`Clase confirmada · ${r.notified} alumna(s) avisadas`);
    emit();
  }
  async function cancel(c: PresencialClassAdmin) {
    const r = await presencialApi.adminCancelClass(c.id);
    setCancelFor(null);
    toast.success(`Clase cancelada · ${r.notified} alumna(s) avisadas`);
    emit();
  }
  async function remove(c: PresencialClassAdmin) {
    try {
      await presencialApi.adminDelete(c.id);
      setDeleteFor(null);
      toast.success('Clase borrada');
      emit();
    } catch (e) {
      setDeleteFor(null);
      toast.error((e as Error).message);
    }
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <label className='flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer'>
          <input type='checkbox' checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
          Mostrar pasadas
        </label>
        <button
          type='button'
          onClick={() => setForm({ open: true, initial: null })}
          className='inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
        >
          <Plus className='w-4 h-4 text-[#EBA2A8]' /> Nueva clase presencial
        </button>
      </div>

      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      ) : rows.length === 0 ? (
        <div className='text-center py-12'>
          <MapPin className='w-10 h-10 mx-auto mb-3 text-muted-foreground/40' />
          <p className='text-sm font-medium'>No hay clases presenciales.</p>
          <p className='text-xs text-muted-foreground mt-1'>Creá la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {rows.map((c) => {
            const active = c.status === 'TENTATIVE' || c.status === 'CONFIRMED';
            return (
              <div
                key={c.id}
                className='rounded-xl border border-border bg-white dark:bg-card p-3 flex flex-wrap items-start gap-3'
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-sm font-semibold'>{c.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                      {CLASS_STATUS_LABEL[c.status]}
                    </span>
                    {c.restrictToStudents && (
                      <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground'>
                        solo alumnas
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground capitalize'>
                    {formatPresencialDate(c.date)} · {hourLabel(c.startHour)}–{hourLabel(c.endHour)} hs
                  </p>
                  {c.categories.length > 0 && (
                    <p className='text-[11px] text-muted-foreground'>
                      {c.categories.map((x) => x.name).join(' · ')}
                    </p>
                  )}
                  <p className='mt-1 text-xs flex items-center gap-1.5'>
                    <Users className='w-3.5 h-3.5 text-[#8b1538]' />
                    <span className='font-semibold'>{c.counts.active}</span> inscriptas
                    <span className='text-muted-foreground'>
                      ({c.counts.pending} pend. · {c.counts.confirmed} conf.)
                    </span>
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-1.5'>
                  {c.status === 'TENTATIVE' && (
                    <button
                      type='button'
                      onClick={() => setConfirmFor(c)}
                      className='px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
                    >
                      Confirmar
                    </button>
                  )}
                  {active && (
                    <button
                      type='button'
                      onClick={() => setCancelFor(c)}
                      className='px-2.5 py-1.5 text-xs rounded-lg border border-border text-red-600 hover:border-red-400'
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={() => setForm({ open: true, initial: c })}
                    className='p-1.5 rounded-lg hover:bg-muted text-muted-foreground'
                    title='Editar'
                  >
                    <Pencil className='w-4 h-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeleteFor(c)}
                    className='p-1.5 rounded-lg hover:bg-red-50 text-red-500'
                    title='Borrar'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form.open && (
        <PresencialClassForm
          initial={form.initial}
          onClose={() => setForm({ open: false, initial: null })}
          onSaved={() => setForm({ open: false, initial: null })}
        />
      )}
      {confirmFor && (
        <ConfirmDialog
          title='¿Confirmar la clase presencial?'
          description={`${confirmFor.title} · ${formatPresencialDate(confirmFor.date)}. Se confirma el lugar de las ${confirmFor.counts.pending} pendientes y se les avisa por email y en la app.`}
          confirmLabel='Sí, confirmar'
          onConfirm={() => confirm(confirmFor)}
          onClose={() => setConfirmFor(null)}
        />
      )}
      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar la clase presencial?'
          description={`${cancelFor.title} · ${formatPresencialDate(cancelFor.date)}. Las ${cancelFor.counts.active} inscriptas quedan canceladas y se les avisa.`}
          confirmLabel='Sí, cancelar clase'
          destructive
          onConfirm={() => cancel(cancelFor)}
          onClose={() => setCancelFor(null)}
        />
      )}
      {deleteFor && (
        <ConfirmDialog
          title='¿Borrar esta clase?'
          description='Solo se puede borrar si no tiene inscriptas activas (si las tiene, cancelala para avisarles).'
          confirmLabel='Sí, borrar'
          destructive
          onConfirm={() => remove(deleteFor)}
          onClose={() => setDeleteFor(null)}
        />
      )}
    </div>
  );
}
