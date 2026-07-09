'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FormBuilder, slugify, type FormBuilderValue } from '@/components/admin/form-builder';
import { createForm, FormsApiError } from '@/lib/forms-api';

const emptyForm: FormBuilderValue = {
  title: '',
  slug: '',
  description: '',
  fields: [],
  successMessage: '',
  closedMessage: '',
  submitLabel: '',
};

export default function NuevoFormularioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  const [value, setValue] = useState<FormBuilderValue>(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (next: FormBuilderValue) => {
    if (next.slug !== value.slug) {
      setSlugEdited(true);
      setValue(next);
      return;
    }
    // Autogenerar slug desde el título mientras no lo hayan tocado
    setValue(slugEdited ? next : { ...next, slug: slugify(next.title) });
  };

  const validate = (): boolean => {
    if (!value.title.trim()) {
      toast.error('El formulario necesita un título');
      return false;
    }
    if (value.fields.length === 0) {
      toast.error('Agregá al menos un campo');
      return false;
    }
    const unnamed = value.fields.find((f) => f.type !== 'info' && !f.label.trim());
    if (unnamed) {
      toast.error('Hay campos sin pregunta / etiqueta');
      return false;
    }
    return true;
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const form = await createForm({
        title: value.title.trim(),
        slug: value.slug || undefined,
        description: value.description.trim() || undefined,
        fields: value.fields,
        successMessage: value.successMessage.trim() || undefined,
        closedMessage: value.closedMessage.trim() || undefined,
        submitLabel: value.submitLabel.trim() || undefined,
        status: publish ? 'published' : 'draft',
      });
      toast.success(publish ? '¡Formulario publicado!' : 'Formulario guardado como borrador');
      router.push(`/${locale}/admin/formularios/${form.id}`);
    } catch (error) {
      toast.error(error instanceof FormsApiError ? error.message : 'No se pudo guardar');
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6 font-admin pb-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.push(`/${locale}/admin/formularios`)}
            className='p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
            title='Volver'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Nuevo formulario</h1>
            <p className='text-sm text-gray-500'>Diseñá los campos y publicalo cuando esté listo.</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
          >
            <Save className='w-4 h-4' />
            Guardar borrador
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#660e1b] text-white text-sm font-medium hover:bg-[#7a1220] transition-colors disabled:opacity-60'
          >
            Publicar
          </button>
        </div>
      </div>

      <FormBuilder value={value} onChange={handleChange} />
    </div>
  );
}
