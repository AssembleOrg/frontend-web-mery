'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Edit,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getFormAnalytics,
  getFormResponses,
  downloadFormResponsesCsv,
  type FormAnalytics,
  type FormField,
  type FormResponseDto,
  type YesNoAnswer,
} from '@/lib/forms-api';

const PAGE_SIZE = 25;

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

/** Formatea el valor de una respuesta según la definición del campo. */
function formatAnswer(field: FormField, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';

  if (field.type === 'yesno') {
    const v = value as YesNoAnswer;
    return `${v.value ? 'Sí' : 'No'}${v.context ? ` — ${v.context}` : ''}`;
  }
  if (Array.isArray(value)) {
    return value
      .map((optId) => field.options?.find((o) => o.id === optId)?.label || String(optId))
      .join(', ');
  }
  if (field.type === 'select' || field.type === 'radio') {
    return field.options?.find((o) => o.id === value)?.label || String(value);
  }
  return String(value);
}

export default function RespuestasFormularioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1] || 'es';
  const formId = params.id as string;

  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [responses, setResponses] = useState<FormResponseDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsData, responsesData] = await Promise.all([
        getFormAnalytics(formId),
        getFormResponses(formId, { page, limit: PAGE_SIZE }),
      ]);
      setAnalytics(analyticsData);
      setFields((responsesData.data.form.fields || []).filter((f) => f.type !== 'info'));
      setResponses(responsesData.data.responses);
      setTotalPages(responsesData.meta.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las respuestas');
      router.push(`/${locale}/admin/formularios`);
    } finally {
      setIsLoading(false);
    }
  }, [formId, page, locale, router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFormResponsesCsv(formId, `${analytics?.form.slug || 'formulario'}-respuestas.csv`);
      toast.success('CSV descargado');
    } catch {
      toast.error('No se pudo exportar');
    } finally {
      setExporting(false);
    }
  };

  const maxByDay = useMemo(
    () => Math.max(1, ...(analytics?.byDay.map((d) => d.count) || [1])),
    [analytics],
  );

  // Solo los últimos 30 días con actividad para que el gráfico no explote
  const byDayVisible = useMemo(() => (analytics?.byDay || []).slice(-30), [analytics]);

  if (isLoading && !analytics) {
    return (
      <div className='space-y-4 animate-pulse font-admin'>
        <div className='h-8 bg-gray-100 rounded w-1/2' />
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-24 bg-gray-100 rounded-xl' />
          ))}
        </div>
        <div className='h-64 bg-gray-100 rounded-xl' />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className='space-y-6 font-admin pb-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-start gap-3 min-w-0'>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios`)}
            className='p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0'
            title='Volver'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='min-w-0'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 leading-snug'>
              {analytics.form.title}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>Respuestas y analítica · /f/{analytics.form.slug}</p>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios/${formId}`)}
            className='inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <Edit className='w-4 h-4' />
            <span className='hidden sm:inline'>Editar</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || analytics.total === 0}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#660e1b] text-white text-sm font-medium hover:bg-[#7a1220] transition-colors disabled:opacity-50'
          >
            <Download className='w-4 h-4' />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        <StatTile
          icon={Users}
          label='Total de respuestas'
          value={String(analytics.total)}
        />
        <StatTile icon={TrendingUp} label='Hoy' value={String(analytics.today)} />
        <StatTile icon={CalendarDays} label='Últimos 7 días' value={String(analytics.last7Days)} />
        <StatTile
          icon={Clock}
          label='Última respuesta'
          value={analytics.lastResponseAt ? formatDateTime(analytics.lastResponseAt) : '—'}
          small
        />
      </div>

      {/* Respuestas por día */}
      {byDayVisible.length > 0 && (
        <section className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6'>
          <h2 className='text-sm font-semibold text-gray-800 mb-4'>Respuestas por día</h2>
          <div className='overflow-x-auto'>
            <div className='flex items-end gap-1.5 h-36 min-w-fit pr-2'>
              {byDayVisible.map((d) => (
                <div key={d.date} className='flex flex-col items-center gap-1 flex-1 min-w-[26px] group'>
                  <span className='text-[10px] text-gray-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity'>
                    {d.count}
                  </span>
                  <div
                    className='w-full max-w-[30px] bg-[#660e1b]/85 group-hover:bg-[#660e1b] rounded-t transition-colors'
                    style={{ height: `${Math.max(6, (d.count / maxByDay) * 100)}px` }}
                    title={`${formatDayLabel(d.date)}: ${d.count} respuesta${d.count === 1 ? '' : 's'}`}
                  />
                  <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                    {formatDayLabel(d.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Distribuciones (radio/select/checkbox/yesno) */}
      {analytics.distributions.length > 0 && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {analytics.distributions.map((dist) => (
            <section
              key={dist.fieldId}
              className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6'
            >
              <h2 className='text-sm font-semibold text-gray-800 leading-snug'>{dist.label}</h2>
              <p className='text-xs text-gray-400 mb-4'>{dist.answered} respondieron</p>
              <div className='space-y-3'>
                {dist.options.map((opt) => (
                  <div key={opt.id}>
                    <div className='flex items-baseline justify-between gap-2 mb-1'>
                      <span className='text-sm text-gray-700 truncate'>{opt.label}</span>
                      <span className='text-xs text-gray-500 tabular-nums flex-shrink-0'>
                        {opt.count} · {opt.percent}%
                      </span>
                    </div>
                    <div className='h-2.5 rounded-full bg-[#FBE8EA] overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-[#660e1b] transition-all'
                        style={{ width: `${opt.percent}%` }}
                        title={`${opt.label}: ${opt.count} (${opt.percent}%)`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Tabla de respuestas */}
      <section className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
        <div className='px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-gray-800'>
            Respuestas individuales ({analytics.total})
          </h2>
          {totalPages > 1 && (
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className='p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='tabular-nums'>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className='p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </div>

        {responses.length === 0 ? (
          <div className='p-10 text-center text-sm text-gray-400'>
            Todavía no hay respuestas. Compartí el link público para empezar a recibirlas.
          </div>
        ) : (
          <ul className='divide-y divide-gray-50'>
            {responses.map((response, idx) => {
              const expanded = expandedId === response.id;
              // Resumen: primeros 2 campos con respuesta
              const summaryParts = fields
                .map((f) => ({ field: f, value: response.answers[f.id] }))
                .filter(({ value }) => value !== undefined && value !== null && value !== '')
                .slice(0, 2)
                .map(({ field, value }) => formatAnswer(field, value));

              return (
                <li key={response.id}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : response.id)}
                    className='w-full flex items-center gap-3 px-5 sm:px-6 py-3.5 text-left hover:bg-gray-50/60 transition-colors'
                  >
                    <span className='w-7 h-7 rounded-full bg-[#FBE8EA] text-[#660e1b] text-xs font-semibold flex items-center justify-center flex-shrink-0'>
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-gray-800 truncate'>
                        {summaryParts.join(' · ') || 'Respuesta'}
                      </p>
                      <p className='text-xs text-gray-400'>{formatDateTime(response.createdAt)}</p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div className='px-5 sm:px-6 pb-5 pt-1'>
                      <dl className='bg-gray-50/70 rounded-xl p-4 sm:p-5 space-y-3'>
                        {fields.map((field) => (
                          <div key={field.id}>
                            <dt className='text-xs font-medium text-gray-500'>{field.label}</dt>
                            <dd className='text-sm text-gray-800 whitespace-pre-line mt-0.5'>
                              {formatAnswer(field, response.answers[field.id])}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5'>
      <div className='flex items-center gap-2 mb-2'>
        <span className='w-7 h-7 rounded-lg bg-[#FBE8EA] flex items-center justify-center'>
          <Icon className='w-3.5 h-3.5 text-[#660e1b]' />
        </span>
        <span className='text-xs text-gray-500 font-medium'>{label}</span>
      </div>
      <p className={`font-bold text-gray-900 tabular-nums ${small ? 'text-sm' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
  );
}
