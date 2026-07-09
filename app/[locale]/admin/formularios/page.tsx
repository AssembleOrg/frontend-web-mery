'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  PlusCircle,
  Edit,
  Trash2,
  Copy,
  Link2,
  BarChart3,
  Globe,
  Lock,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/modal-context';
import {
  getForms,
  deleteForm,
  duplicateForm,
  updateForm,
  getPublicFormUrl,
  type FormDto,
  type FormStatus,
} from '@/lib/forms-api';

const STATUS_CONFIG: Record<FormStatus, { label: string; classes: string; icon: typeof Globe }> = {
  draft: { label: 'Borrador', classes: 'bg-gray-100 text-gray-600', icon: FileText },
  published: { label: 'Publicado', classes: 'bg-green-50 text-green-700', icon: Globe },
  closed: { label: 'Cerrado', classes: 'bg-amber-50 text-amber-700', icon: Lock },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminFormulariosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const { showConfirm } = useModal();

  const [forms, setForms] = useState<FormDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getForms({ limit: 100 });
      setForms(result.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('No se pudieron cargar los formularios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const copyLink = (form: FormDto) => {
    navigator.clipboard.writeText(getPublicFormUrl(form.slug));
    toast.success('Link copiado al portapapeles');
  };

  const handleToggleStatus = async (form: FormDto) => {
    const nextStatus: FormStatus = form.status === 'published' ? 'closed' : 'published';
    const verb = nextStatus === 'published' ? 'publicar' : 'cerrar';

    const confirmed = await showConfirm({
      title: `¿${verb === 'publicar' ? 'Publicar' : 'Cerrar'} formulario?`,
      message:
        nextStatus === 'published'
          ? `"${form.title}" quedará accesible públicamente en ${getPublicFormUrl(form.slug)}`
          : `"${form.title}" dejará de aceptar respuestas.`,
      type: nextStatus === 'published' ? 'info' : 'warning',
      confirmText: verb === 'publicar' ? 'Publicar' : 'Cerrar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    setBusyId(form.id);
    try {
      await updateForm(form.id, { status: nextStatus });
      toast.success(nextStatus === 'published' ? 'Formulario publicado' : 'Formulario cerrado');
      await fetchForms();
    } catch {
      toast.error('No se pudo actualizar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (form: FormDto) => {
    setBusyId(form.id);
    try {
      const copy = await duplicateForm(form.id);
      toast.success('Formulario duplicado (queda como borrador)');
      router.push(`/${locale}/admin/formularios/${copy.id}`);
    } catch {
      toast.error('No se pudo duplicar');
      setBusyId(null);
    }
  };

  const handleDelete = async (form: FormDto) => {
    const confirmed = await showConfirm({
      title: '¿Eliminar formulario?',
      message: `Se eliminará "${form.title}" y dejará de estar accesible. Las respuestas ya recibidas se conservan en la base de datos.`,
      type: 'error',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    setBusyId(form.id);
    try {
      await deleteForm(form.id);
      toast.success('Formulario eliminado');
      await fetchForms();
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className='space-y-6 font-admin'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Formularios</h1>
          <p className='mt-1 text-sm text-gray-600'>
            Creá formularios públicos, compartí el link y mirá las respuestas.
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/admin/formularios/nuevo`)}
          className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#660e1b] text-white text-sm font-medium hover:bg-[#7a1220] transition-colors'
        >
          <PlusCircle className='w-4 h-4' />
          Nuevo formulario
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='bg-white rounded-xl border border-gray-100 p-5 animate-pulse'>
              <div className='h-5 bg-gray-100 rounded w-2/3 mb-3' />
              <div className='h-4 bg-gray-100 rounded w-1/3' />
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
          <div className='mx-auto w-14 h-14 rounded-full bg-[#FBE8EA] flex items-center justify-center mb-4'>
            <ClipboardList className='w-6 h-6 text-[#660e1b]' />
          </div>
          <p className='text-gray-800 font-medium mb-1'>Todavía no hay formularios</p>
          <p className='text-sm text-gray-500 mb-5'>
            Creá el primero y compartí el link público con quien quieras.
          </p>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios/nuevo`)}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#660e1b] text-white text-sm font-medium hover:bg-[#7a1220] transition-colors'
          >
            <PlusCircle className='w-4 h-4' />
            Crear formulario
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          {forms.map((form) => {
            const status = STATUS_CONFIG[form.status];
            const StatusIcon = status.icon;
            const busy = busyId === form.id;
            return (
              <div
                key={form.id}
                className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-opacity ${
                  busy ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${status.classes}`}
                      >
                        <StatusIcon className='w-3 h-3' />
                        {status.label}
                      </span>
                      <span className='text-xs text-gray-400'>
                        Creado el {formatDate(form.createdAt)}
                      </span>
                    </div>
                    <h3 className='font-semibold text-gray-900 leading-snug line-clamp-2'>
                      {form.title}
                    </h3>
                    <p className='text-xs text-gray-400 mt-0.5 truncate'>/f/{form.slug}</p>
                  </div>

                  {/* Respuestas */}
                  <button
                    onClick={() => router.push(`/${locale}/admin/formularios/${form.id}/respuestas`)}
                    className='flex lg:flex-col items-center lg:items-center gap-2 lg:gap-0 px-4 py-2 rounded-lg bg-[#FBE8EA]/60 hover:bg-[#FBE8EA] transition-colors self-start lg:self-auto'
                    title='Ver respuestas y analítica'
                  >
                    <span className='text-xl font-bold text-[#660e1b]'>
                      {form._count?.responses ?? 0}
                    </span>
                    <span className='text-[11px] text-[#660e1b]/70 font-medium'>respuestas</span>
                  </button>

                  {/* Acciones */}
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <ActionButton
                      title='Ver analítica y respuestas'
                      onClick={() => router.push(`/${locale}/admin/formularios/${form.id}/respuestas`)}
                    >
                      <BarChart3 className='w-4 h-4' />
                    </ActionButton>
                    <ActionButton
                      title='Editar'
                      onClick={() => router.push(`/${locale}/admin/formularios/${form.id}`)}
                    >
                      <Edit className='w-4 h-4' />
                    </ActionButton>
                    <ActionButton title='Copiar link público' onClick={() => copyLink(form)}>
                      <Link2 className='w-4 h-4' />
                    </ActionButton>
                    <ActionButton title='Duplicar' onClick={() => handleDuplicate(form)}>
                      <Copy className='w-4 h-4' />
                    </ActionButton>
                    <button
                      onClick={() => handleToggleStatus(form)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        form.status === 'published'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {form.status === 'published' ? 'Cerrar' : 'Publicar'}
                    </button>
                    <ActionButton title='Eliminar' onClick={() => handleDelete(form)} danger>
                      <Trash2 className='w-4 h-4' />
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        danger
          ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-400 hover:text-[#660e1b] hover:bg-[#FBE8EA]/60'
      }`}
    >
      {children}
    </button>
  );
}
