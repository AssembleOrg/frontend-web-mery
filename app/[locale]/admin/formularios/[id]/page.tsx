'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Link2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FormBuilder, type FormBuilderValue } from '@/components/admin/form-builder';
import {
  getForm,
  updateForm,
  getPublicFormUrl,
  FormsApiError,
  type FormDto,
  type FormStatus,
} from '@/lib/forms-api';

const STATUS_LABEL: Record<FormStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  closed: 'Cerrado',
};

export default function EditarFormularioPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const formId = params.id as string;

  const [form, setForm] = useState<FormDto | null>(null);
  const [value, setValue] = useState<FormBuilderValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchForm = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getForm(formId);
      setForm(data);
      setValue({
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        fields: data.fields || [],
        successMessage: data.successMessage || '',
        closedMessage: data.closedMessage || '',
        submitLabel: data.submitLabel || '',
      });
    } catch {
      toast.error('No se pudo cargar el formulario');
      router.push(`/${locale}/admin/formularios`);
    } finally {
      setIsLoading(false);
    }
  }, [formId, locale, router]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const validate = (): boolean => {
    if (!value) return false;
    if (!value.title.trim()) {
      toast.error('El formulario necesita un título');
      return false;
    }
    if (value.fields.length === 0) {
      toast.error('Agregá al menos un campo');
      return false;
    }
    if (value.fields.some((f) => f.type !== 'info' && !f.label.trim())) {
      toast.error('Hay campos sin pregunta / etiqueta');
      return false;
    }
    return true;
  };

  const handleSave = async (status?: FormStatus) => {
    if (!value || !validate()) return;
    setSaving(true);
    try {
      const updated = await updateForm(formId, {
        title: value.title.trim(),
        slug: value.slug || undefined,
        description: value.description.trim() || undefined,
        fields: value.fields,
        successMessage: value.successMessage.trim() || undefined,
        closedMessage: value.closedMessage.trim() || undefined,
        submitLabel: value.submitLabel.trim() || undefined,
        ...(status && { status }),
      });
      setForm(updated);
      setValue((prev) => (prev ? { ...prev, slug: updated.slug } : prev));
      toast.success(
        status === 'published'
          ? '¡Formulario publicado!'
          : status === 'closed'
            ? 'Formulario cerrado'
            : 'Cambios guardados',
      );
    } catch (error) {
      toast.error(error instanceof FormsApiError ? error.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!form) return;
    navigator.clipboard.writeText(getPublicFormUrl(value?.slug || form.slug));
    toast.success('Link copiado al portapapeles');
  };

  if (isLoading || !value || !form) {
    return (
      <div className='space-y-4 animate-pulse font-admin'>
        <div className='h-8 bg-gray-100 rounded w-1/2' />
        <div className='h-64 bg-gray-100 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='space-y-6 font-admin pb-10'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div className='flex items-start gap-3 min-w-0'>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios`)}
            className='p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0'
            title='Volver'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900 truncate'>
                Editar formulario
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  form.status === 'published'
                    ? 'bg-green-50 text-green-700'
                    : form.status === 'closed'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {STATUS_LABEL[form.status]}
              </span>
            </div>
            <p className='text-sm text-gray-500 mt-0.5'>
              {form._count?.responses ?? 0} respuestas · /f/{value.slug}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            onClick={copyLink}
            className='inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
            title='Copiar link público'
          >
            <Link2 className='w-4 h-4' />
            <span className='hidden sm:inline'>Copiar link</span>
          </button>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios/${formId}/respuestas`)}
            className='inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
          >
            <BarChart3 className='w-4 h-4' />
            <span className='hidden sm:inline'>Respuestas</span>
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
          >
            <Save className='w-4 h-4' />
            Guardar
          </button>
          {form.status !== 'published' ? (
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#660e1b] text-white text-sm font-medium hover:bg-[#7a1220] transition-colors disabled:opacity-60'
            >
              Publicar
            </button>
          ) : (
            <button
              onClick={() => handleSave('closed')}
              disabled={saving}
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-60'
            >
              Cerrar formulario
            </button>
          )}
        </div>
      </div>

      {form.status === 'published' && (form._count?.responses ?? 0) > 0 && (
        <div className='bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800'>
          Este formulario ya tiene respuestas. Si eliminás o cambiás opciones de un campo, las
          respuestas anteriores conservan su valor original.
        </div>
      )}

      <FormBuilder value={value} onChange={setValue} />
    </div>
  );
}
