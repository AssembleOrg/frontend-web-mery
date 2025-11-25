'use client';

import { CourseCreateInput, CourseIncludeItem } from '@/types/course';
import Image from 'next/image';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

interface BasicInfoStepProps {
  formData: Partial<CourseCreateInput>;
  updateFormData: (updates: Partial<CourseCreateInput>) => void;
  errors: Record<string, string>;
}

export function BasicInfoStep({
  formData,
  updateFormData,
  errors,
}: BasicInfoStepProps) {
  const { showError } = useModal();

  // Helper functions for includes_category management
  const addIncludeItem = (language: 'es' | 'en') => {
    const field =
      language === 'es' ? 'includes_category' : 'includes_category_en';
    const currentItems = formData[field] || [];
    updateFormData({
      [field]: [...currentItems, { texto: '', url_icon: '' }],
    });
  };

  const updateIncludeItem = (
    language: 'es' | 'en',
    index: number,
    updates: Partial<CourseIncludeItem>
  ) => {
    const field =
      language === 'es' ? 'includes_category' : 'includes_category_en';
    const currentItems = [...(formData[field] || [])];
    currentItems[index] = { ...currentItems[index], ...updates };
    updateFormData({ [field]: currentItems });
  };

  const removeIncludeItem = (language: 'es' | 'en', index: number) => {
    const field =
      language === 'es' ? 'includes_category' : 'includes_category_en';
    const currentItems = formData[field] || [];
    updateFormData({
      [field]: currentItems.filter((_, i) => i !== index),
    });
  };
  const handlePriceARSChange = (value: string) => {
    const priceARS = parseFloat(value) || 0;
    updateFormData({ priceARS });
  };

  const handlePriceUSDChange = (value: string) => {
    const priceUSD = parseFloat(value) || 0;
    updateFormData({ priceUSD });
  };

  const handleSlugGenerate = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      updateFormData({ slug });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(
        'Por favor selecciona un archivo de imagen válido',
        'Formato inválido'
      );
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('La imagen no puede superar los 2MB', 'Archivo muy grande');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateFormData({ image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateFormData({ image: '' });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
          Información Básica del Curso
        </h3>
        <p className='text-gray-600'>
          Completa los datos principales que se mostrarán en la tarjeta del
          curso
        </p>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor='title'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Título del Curso *
        </label>
        <input
          type='text'
          id='title'
          value={formData.title || ''}
          onChange={(e) => updateFormData({ title: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Ej: ESTILISMO DE CEJAS ® - MÓDULO 1'
        />
        {errors.title && (
          <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor='slug'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Slug (URL amigable) *
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            id='slug'
            value={formData.slug || ''}
            onChange={(e) => updateFormData({ slug: e.target.value })}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='estilismo-cejas'
          />
          <button
            type='button'
            onClick={handleSlugGenerate}
            className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors'
          >
            Generar
          </button>
        </div>
        {errors.slug && (
          <p className='mt-1 text-sm text-red-600'>{errors.slug}</p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          URL: /cursos/{formData.slug || 'slug-del-curso'}
        </p>
      </div>

      <div>
        <label
          htmlFor='order'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Orden de Aparición en Formaciones
        </label>
        <input
          type='number'
          id='order'
          name='order'
          value={formData.order ?? 0}
          onChange={(e) =>
            updateFormData({ order: parseInt(e.target.value, 10) || 0 })
          }
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          min='0'
        />
        <p className='mt-1 text-xs text-gray-500'>
          Define la posición del curso en la página de Formaciones. El número
          más bajo (ej: 1) aparece primero. Si no estás seguro, déjalo en 0.
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor='description'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Descripción Corta *
        </label>
        <textarea
          id='description'
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Descripción que aparecerá en la tarjeta del curso'
        />
        {errors.description && (
          <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          {formData.description?.length || 0} caracteres
        </p>
      </div>

      {/* Long Description */}
      <div>
        <label
          htmlFor='long_description'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Descripción Detallada
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Opcional - Se mostrará en el modal del curso)
          </span>
        </label>
        <textarea
          id='long_description'
          value={formData.long_description || ''}
          onChange={(e) => updateFormData({ long_description: e.target.value })}
          rows={6}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Descripción completa que aparecerá cuando se abra el modal del curso. Puedes usar dobles saltos de línea para separar párrafos.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.long_description?.length || 0} caracteres • Tip: Usa dobles
          saltos de línea para crear párrafos
        </p>
      </div>

      {/* Target Audience */}
      <div>
        <label
          htmlFor='target'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Público Objetivo (ES)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Opcional - ¿A quién está dirigido?)
          </span>
        </label>
        <textarea
          id='target'
          value={formData.target || ''}
          onChange={(e) => updateFormData({ target: e.target.value })}
          rows={4}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Ej: Este curso está diseñado para profesionales de la belleza que desean perfeccionar sus técnicas, desde principiantes con conocimientos básicos hasta expertos que buscan actualizar sus métodos...'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.target?.length || 0} caracteres
        </p>
      </div>

      {/* Target Audience EN */}
      <div>
        <label
          htmlFor='target_en'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Target Audience (EN)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Optional - Who is it for?)
          </span>
        </label>
        <textarea
          id='target_en'
          value={formData.target_en || ''}
          onChange={(e) => updateFormData({ target_en: e.target.value })}
          rows={4}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Ex: This course is designed for beauty professionals who want to perfect their techniques, from beginners with basic knowledge to experts looking to update their methods...'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.target_en?.length || 0} caracteres
        </p>
      </div>

      {/* Long Description EN */}
      <div>
        <label
          htmlFor='long_description_en'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Detailed Description (EN)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Optional - Will be shown in course modal)
          </span>
        </label>
        <textarea
          id='long_description_en'
          value={formData.long_description_en || ''}
          onChange={(e) =>
            updateFormData({ long_description_en: e.target.value })
          }
          rows={6}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Complete description that will appear when opening the course modal. You can use double line breaks to separate paragraphs. Use **text** for bold.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.long_description_en?.length || 0} characters • Tip: Use
          double line breaks for paragraphs, **text** for bold
        </p>
      </div>

      {/* Modalidad */}
      <div>
        <label
          htmlFor='modalidad'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Modalidad (ES)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Opcional)
          </span>
        </label>
        <textarea
          id='modalidad'
          value={formData.modalidad || ''}
          onChange={(e) => updateFormData({ modalidad: e.target.value })}
          rows={3}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Ej: Formación **100% online** con acceso inmediato. Puedes usar dobles saltos de línea para párrafos y **texto** para negritas.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.modalidad?.length || 0} caracteres • Tip: Usa dobles saltos
          de línea para párrafos, **texto** para negritas
        </p>
      </div>

      {/* Modalidad EN */}
      <div>
        <label
          htmlFor='modalidad_en'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Modality (EN)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Optional)
          </span>
        </label>
        <textarea
          id='modalidad_en'
          value={formData.modalidad_en || ''}
          onChange={(e) => updateFormData({ modalidad_en: e.target.value })}
          rows={3}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Ex: **100% online** training with immediate access. Use double line breaks for paragraphs and **text** for bold.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.modalidad_en?.length || 0} characters • Tip: Use double line
          breaks for paragraphs, **text** for bold
        </p>
      </div>

      {/* Learn */}
      <div>
        <label
          htmlFor='learn'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          ¿Qué vas a aprender? (ES)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Opcional)
          </span>
        </label>
        <textarea
          id='learn'
          value={formData.learn || ''}
          onChange={(e) => updateFormData({ learn: e.target.value })}
          rows={5}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Técnicas **avanzadas** de aplicación de pigmento. Cada línea será un punto separado. Usa **texto** para negritas y dobles saltos de línea para párrafos.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.learn?.length || 0} caracteres • Tip: Usa saltos de línea
          simples para listas, **texto** para negritas
        </p>
      </div>

      {/* Learn EN */}
      <div>
        <label
          htmlFor='learn_en'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          What will you learn? (EN)
          <span className='ml-2 text-xs font-normal text-gray-500'>
            (Optional)
          </span>
        </label>
        <textarea
          id='learn_en'
          value={formData.learn_en || ''}
          onChange={(e) => updateFormData({ learn_en: e.target.value })}
          rows={5}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='**Advanced** pigment application techniques. Each line will be a separate point. Use **text** for bold and double line breaks for paragraphs.'
        />
        <p className='mt-1 text-xs text-gray-500'>
          {formData.learn_en?.length || 0} characters • Tip: Use single line
          breaks for lists, **text** for bold
        </p>
      </div>

      {/* Includes Category (ES) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <label className='block text-sm font-medium text-gray-700'>
            ¿Qué incluye el curso? (ES)
            <span className='ml-2 text-xs font-normal text-gray-500'>
              (Opcional - Lista estructurada)
            </span>
          </label>
          <button
            type='button'
            onClick={() => addIncludeItem('es')}
            className='flex items-center gap-1 px-3 py-1 text-sm bg-[#660e1b] text-white rounded-lg hover:bg-[#4a0a13] transition-colors'
          >
            <Plus className='w-4 h-4' />
            Agregar ítem
          </button>
        </div>

        {formData.includes_category && formData.includes_category.length > 0 ? (
          <div className='space-y-2'>
            {formData.includes_category.map((item, index) => (
              <div
                key={index}
                className='flex gap-2 items-start p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex-1 space-y-2'>
                  <input
                    type='text'
                    value={item.texto || item.text || ''}
                    onChange={(e) =>
                      updateIncludeItem('es', index, {
                        texto: e.target.value,
                        text: e.target.value,
                      })
                    }
                    placeholder='Texto del ítem (ej: Videos HD de alta calidad)'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                  />
                  <input
                    type='text'
                    value={item.url_icon || ''}
                    onChange={(e) =>
                      updateIncludeItem('es', index, {
                        url_icon: e.target.value,
                      })
                    }
                    placeholder='URL del icono (opcional, ej: /icons/video.svg)'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => removeIncludeItem('es', index)}
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  title='Eliminar ítem'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-500 italic'>
            No hay ítems agregados. Haz clic en &quot;Agregar ítem&quot; para
            empezar.
          </p>
        )}
      </div>

      {/* Includes Category (EN) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <label className='block text-sm font-medium text-gray-700'>
            What does the course include? (EN)
            <span className='ml-2 text-xs font-normal text-gray-500'>
              (Optional - Structured list)
            </span>
          </label>
          <button
            type='button'
            onClick={() => addIncludeItem('en')}
            className='flex items-center gap-1 px-3 py-1 text-sm bg-[#660e1b] text-white rounded-lg hover:bg-[#4a0a13] transition-colors'
          >
            <Plus className='w-4 h-4' />
            Add item
          </button>
        </div>

        {formData.includes_category_en &&
        formData.includes_category_en.length > 0 ? (
          <div className='space-y-2'>
            {formData.includes_category_en.map((item, index) => (
              <div
                key={index}
                className='flex gap-2 items-start p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex-1 space-y-2'>
                  <input
                    type='text'
                    value={item.texto || item.text || ''}
                    onChange={(e) =>
                      updateIncludeItem('en', index, {
                        texto: e.target.value,
                        text: e.target.value,
                      })
                    }
                    placeholder='Item text (ex: High-quality HD videos)'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                  />
                  <input
                    type='text'
                    value={item.url_icon || ''}
                    onChange={(e) =>
                      updateIncludeItem('en', index, {
                        url_icon: e.target.value,
                      })
                    }
                    placeholder='Icon URL (optional, ex: /icons/video.svg)'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => removeIncludeItem('en', index)}
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  title='Remove item'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-500 italic'>
            No items added. Click &quot;Add item&quot; to start.
          </p>
        )}
      </div>

      {/* Precios Bimonetarios */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-2'>
          <h4 className='text-sm font-semibold text-gray-900'>
            Precios (Sistema Bimonetario)
          </h4>
          <span className='text-xs bg-[#FBE8EA] text-[#660e1b] px-2 py-1 rounded'>
            Ambos precios coexisten
          </span>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Precio ARS */}
          <div>
            <label
              htmlFor='priceARS'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Precio en Pesos (ARS) *
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                $
              </span>
              <input
                type='number'
                id='priceARS'
                value={formData.priceARS || ''}
                onChange={(e) => handlePriceARSChange(e.target.value)}
                min='0'
                step='1'
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                  errors.priceARS ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='280000'
              />
            </div>
            {errors.priceARS && (
              <p className='mt-1 text-sm text-red-600'>{errors.priceARS}</p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              Vista: ${(formData.priceARS || 0).toLocaleString('es-AR')} ARS
            </p>
          </div>

          {/* Precio USD */}
          <div>
            <label
              htmlFor='priceUSD'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Precio en Dólares (USD) *
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                U$S
              </span>
              <input
                type='number'
                id='priceUSD'
                value={formData.priceUSD || ''}
                onChange={(e) => handlePriceUSDChange(e.target.value)}
                min='0'
                step='0.01'
                className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                  errors.priceUSD ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='200'
              />
            </div>
            {errors.priceUSD && (
              <p className='mt-1 text-sm text-red-600'>{errors.priceUSD}</p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              Vista: U$S {(formData.priceUSD || 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {/* Curso Gratuito */}
        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
          <input
            type='checkbox'
            id='isFree'
            checked={formData.isFree || false}
            onChange={(e) => {
              const isFree = e.target.checked;
              updateFormData({
                isFree,
                priceARS: isFree ? 0 : formData.priceARS,
                priceUSD: isFree ? 0 : formData.priceUSD,
              });
            }}
            className='w-4 h-4 text-[#660e1b] border-gray-300 rounded focus:ring-[#660e1b]'
          />
          <label
            htmlFor='isFree'
            className='text-sm font-medium text-gray-700'
          >
            Curso 'informativo' (establece ambos precios en 0)
          </label>
        </div>

        {/* Info sobre precios */}
        <div className='p-4 bg-[#FBE8EA] rounded-lg border border-[#F7CBCB]'>
          <div className='flex gap-3'>
            <div className='flex-shrink-0'>
              <svg
                className='w-5 h-5 text-[#EBA2A8]'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-[#660e1b] mb-1'>
                Sistema Bimonetario
              </h4>
              <p className='text-sm text-[#2B2B2B]'>
                Los usuarios argentinos verán el precio en ARS (pesos) por
                defecto y podrán comprar directamente. Los usuarios de otros
                países verán el precio en USD.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Imagen del Curso *
        </label>

        {!formData.image ? (
          <div className='relative'>
            <input
              type='file'
              id='image-upload'
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
            />
            <label
              htmlFor='image-upload'
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                errors.image
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <Upload className='w-10 h-10 mb-3 text-gray-400' />
                <p className='mb-2 text-sm text-gray-600'>
                  <span className='font-semibold'>Haz clic para subir</span> o
                  arrastra una imagen
                </p>
                <p className='text-xs text-gray-500'>
                  PNG, JPG, WEBP (máx. 2MB)
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className='relative'>
            <div className='p-4 bg-gray-50 rounded-lg border-2 border-gray-200'>
              <div className='flex items-start gap-4'>
                <Image
                  src={formData.image || ''}
                  alt='Preview'
                  width={192}
                  height={192}
                  className='w-48 h-48 object-cover rounded-lg'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400x300?text=Error+al+cargar+imagen';
                  }}
                />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700 mb-2'>
                    ✓ Imagen cargada
                  </p>
                  <p className='text-xs text-gray-500 mb-4'>
                    La imagen se mostrará en la tarjeta del curso
                  </p>
                  <div className='flex gap-2'>
                    <label
                      htmlFor='image-upload-change'
                      className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm'
                    >
                      Cambiar imagen
                    </label>
                    <input
                      type='file'
                      id='image-upload-change'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='px-4 py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm'
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {errors.image && (
          <p className='mt-2 text-sm text-red-600'>{errors.image}</p>
        )}
      </div>

      {/* Published Status */}
      <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
        <input
          type='checkbox'
          id='isPublished'
          checked={formData.isPublished ?? true}
          onChange={(e) => updateFormData({ isPublished: e.target.checked })}
          className='w-4 h-4 text-[#660e1b] border-gray-300 rounded focus:ring-[#660e1b]'
        />
        <label
          htmlFor='isPublished'
          className='text-sm font-medium text-gray-700'
        >
          Publicar curso inmediatamente
        </label>
        <span className='ml-auto text-xs text-gray-500'>
          {formData.isPublished
            ? '✓ Visible para usuarios'
            : 'Guardado como borrador'}
        </span>
      </div>
    </div>
  );
}
