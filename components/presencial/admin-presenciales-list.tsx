'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  presencialApi,
  hourLabel,
  CLASS_STATUS_LABEL,
  type PresencialClassAdmin,
} from '@/lib/presencial-api';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { PresencialClassForm } from './presencial-class-form';
import { RescheduleClassModal } from './reschedule-class-modal';

const TZ = 'America/Argentina/Buenos_Aires';
const PAGE_SIZE = 30;

const STATUS_STYLE: Record<PresencialClassAdmin['status'], string> = {
  TENTATIVE: 'border border-dashed border-[#F59E0B] text-[#92400E] bg-[#FEF3C7]',
  CONFIRMED: 'bg-[#DCFCE7] text-[#166534]',
  CANCELLED: 'bg-muted text-muted-foreground line-through',
  COMPLETED: 'bg-muted text-muted-foreground',
};

function fmtDate(dateStr: string) {
  return DateTime.fromISO(dateStr, { zone: TZ }).setLocale('es');
}

/** CRUD de clases presenciales. Próximas (default) o solo pasadas; de a 30. */
export function AdminPresencialesList() {
  const [rows, setRows] = useState<PresencialClassAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; initial: PresencialClassAdmin | null }>({
    open: false,
    initial: null,
  });
  const [confirmFor, setConfirmFor] = useState<PresencialClassAdmin | null>(null);
  const [cancelFor, setCancelFor] = useState<PresencialClassAdmin | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<PresencialClassAdmin | null>(
    null,
  );
  const [deleteFor, setDeleteFor] = useState<PresencialClassAdmin | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startOfToday = DateTime.now().setZone(TZ).startOf('day').toUTC().toISO()!;
      // Próximas: desde hoy, ascendente. Pasadas: hasta hoy, más reciente primero.
      const data = showPast
        ? (await presencialApi.adminCalendar({ to: startOfToday })).reverse()
        : await presencialApi.adminCalendar({ from: startOfToday });
      setRows(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showPast]);

  useEffect(() => {
    setPage(1);
  }, [showPast]);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener('presencial:changed', onChanged);
    return () => window.removeEventListener('presencial:changed', onChanged);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

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
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-2'>
        <div className='inline-flex rounded-lg bg-muted/60 p-0.5 text-xs'>
          <button
            type='button'
            onClick={() => setShowPast(false)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              !showPast ? 'bg-[#2B2B2B] text-white' : 'text-muted-foreground'
            }`}
          >
            Próximas
          </button>
          <button
            type='button'
            onClick={() => setShowPast(true)}
            className={`px-3 py-1.5 rounded-md font-medium inline-flex items-center gap-1 transition-colors ${
              showPast ? 'bg-[#2B2B2B] text-white' : 'text-muted-foreground'
            }`}
          >
            <History className='w-3.5 h-3.5' /> Pasadas
          </button>
        </div>
        <button
          type='button'
          onClick={() => setForm({ open: true, initial: null })}
          className='inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-sm font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
        >
          <Plus className='w-4 h-4 text-[#EBA2A8]' />
          <span className='hidden sm:inline'>Nueva clase presencial</span>
          <span className='sm:hidden'>Nueva</span>
        </button>
      </div>

      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      ) : rows.length === 0 ? (
        <div className='text-center py-12'>
          <MapPin className='w-10 h-10 mx-auto mb-3 text-muted-foreground/40' />
          <p className='text-sm font-medium'>
            {showPast ? 'No hay clases pasadas.' : 'No hay clases próximas.'}
          </p>
          {!showPast && (
            <p className='text-xs text-muted-foreground mt-1'>Creá la primera con el botón de arriba.</p>
          )}
        </div>
      ) : (
        <>
          <p className='text-[11px] text-muted-foreground'>
            {rows.length} clase{rows.length === 1 ? '' : 's'}
            {totalPages > 1 && ` · página ${page} de ${totalPages}`}
          </p>

          <div className='space-y-2'>
            {pageRows.map((c) => {
              const active = c.status === 'TENTATIVE' || c.status === 'CONFIRMED';
              const d = fmtDate(c.date);
              return (
                <div
                  key={c.id}
                  className='rounded-xl border border-border bg-white dark:bg-card overflow-hidden'
                >
                  <div className='flex gap-3 p-3'>
                    {/* Fecha compacta */}
                    <div className='shrink-0 w-12 rounded-lg bg-[#FBE8EA] text-[#8b1538] flex flex-col items-center justify-center py-1.5'>
                      <span className='text-[10px] uppercase leading-none'>{d.toFormat('LLL')}</span>
                      <span className='text-lg font-bold leading-tight'>{d.day}</span>
                      <span className='text-[10px] leading-none capitalize'>{d.toFormat('ccc')}</span>
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-1.5'>
                        <p className='text-sm font-semibold leading-tight'>{c.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                          {CLASS_STATUS_LABEL[c.status]}
                        </span>
                        {c.restrictToStudents && (
                          <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground'>
                            solo alumnas
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {hourLabel(c.startHour)}–{hourLabel(c.endHour)} hs · {d.toFormat('yyyy')}
                      </p>
                      {c.categories.length > 0 && (
                        <p className='text-[11px] text-muted-foreground truncate'>
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
                  </div>

                  {/* Acciones: fila propia, cómoda en mobile */}
                  <div className='flex items-center gap-1.5 px-3 py-2 border-t border-border/60 bg-muted/20'>
                    {c.status === 'TENTATIVE' && (
                      <button
                        type='button'
                        onClick={() => setConfirmFor(c)}
                        className='flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f]'
                      >
                        Confirmar
                      </button>
                    )}
                    {active && (
                      <button
                        type='button'
                        onClick={() => setRescheduleFor(c)}
                        className='flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#EBA2A8] text-[#8b1538] hover:bg-[#FBE8EA]'
                      >
                        Reprogramar
                      </button>
                    )}
                    {active && (
                      <button
                        type='button'
                        onClick={() => setCancelFor(c)}
                        className='flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-[#8b1538] hover:border-[#EBA2A8]'
                      >
                        Cancelar
                      </button>
                    )}
                    <div className='ml-auto flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => setForm({ open: true, initial: c })}
                        className='p-2 rounded-lg hover:bg-muted text-muted-foreground'
                        title='Editar'
                        aria-label='Editar'
                      >
                        <Pencil className='w-4 h-4' />
                      </button>
                      <button
                        type='button'
                        onClick={() => setDeleteFor(c)}
                        className='p-2 rounded-lg hover:bg-red-50 text-red-500'
                        title='Borrar'
                        aria-label='Borrar'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-2'>
              <button
                type='button'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className='p-2 rounded-lg border border-border disabled:opacity-40'
                aria-label='Página anterior'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-xs text-muted-foreground'>
                {page} / {totalPages}
              </span>
              <button
                type='button'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className='p-2 rounded-lg border border-border disabled:opacity-40'
                aria-label='Página siguiente'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </>
      )}

      {rescheduleFor && (

        <RescheduleClassModal

          klass={rescheduleFor}

          onClose={() => setRescheduleFor(null)}

          onDone={() => setRescheduleFor(null)}

        />

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
          description={`${confirmFor.title} · ${fmtDate(confirmFor.date).toFormat("cccc d 'de' LLLL")}. Se confirma el lugar de las ${confirmFor.counts.pending} pendientes y se les avisa por email y en la app.`}
          confirmLabel='Sí, confirmar'
          onConfirm={() => confirm(confirmFor)}
          onClose={() => setConfirmFor(null)}
        />
      )}
      {cancelFor && (
        <ConfirmDialog
          title='¿Cancelar la clase presencial?'
          description={`${cancelFor.title} · ${fmtDate(cancelFor.date).toFormat("cccc d 'de' LLLL")}. Las ${cancelFor.counts.active} inscriptas quedan canceladas y se les avisa.`}
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
