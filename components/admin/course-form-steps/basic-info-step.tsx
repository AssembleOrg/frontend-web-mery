'use client';

import { CourseCreateInput } from '@/types/course';
import { Upload } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

interface BasicInfoStepProps {
  formData: Partial<CourseCreateInput>;
  updateFormData: (updates: Partial<CourseCreateInput>) => void;
  errors: Record<string, string>;
}

export function BasicInfoStep({ formData, updateFormData, errors }: BasicInfoStepProps) {
  const { showError } = useModal();
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
      showError('Por favor selecciona un archivo de imagen válido', 'Formato inválido');
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
          Completa los datos principales que se mostrarán en la tarjeta del curso
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
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
        {errors.title && <p className='mt-1 text-sm text-red-600'>{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor='slug' className='block text-sm font-medium text-gray-700 mb-2'>
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
        {errors.slug && <p className='mt-1 text-sm text-red-600'>{errors.slug}</p>}
        <p className='mt-1 text-xs text-gray-500'>
          URL: /cursos/{formData.slug || 'slug-del-curso'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
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
        {errors.description && <p className='mt-1 text-sm text-red-600'>{errors.description}</p>}
        <p className='mt-1 text-xs text-gray-500'>
          {formData.description?.length || 0} caracteres
        </p>
      </div>

      {/* Precios Bimonetarios */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-2'>
          <h4 className='text-sm font-semibold text-gray-900'>Precios (Sistema Bimonetario)</h4>
          <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>Ambos precios coexisten</span>
        </div>
        
        <div className='grid grid-cols-2 gap-4'>
          {/* Precio ARS */}
          <div>
            <label htmlFor='priceARS' className='block text-sm font-medium text-gray-700 mb-2'>
              Precio en Pesos (ARS) *
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
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
            {errors.priceARS && <p className='mt-1 text-sm text-red-600'>{errors.priceARS}</p>}
            <p className='mt-1 text-xs text-gray-500'>
              Vista: ${(formData.priceARS || 0).toLocaleString('es-AR')} ARS
            </p>
          </div>

          {/* Precio USD */}
          <div>
            <label htmlFor='priceUSD' className='block text-sm font-medium text-gray-700 mb-2'>
              Precio en Dólares (USD) *
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>U$S</span>
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
            {errors.priceUSD && <p className='mt-1 text-sm text-red-600'>{errors.priceUSD}</p>}
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
                priceUSD: isFree ? 0 : formData.priceUSD
              });
            }}
            className='w-4 h-4 text-[#660e1b] border-gray-300 rounded focus:ring-[#660e1b]'
          />
          <label htmlFor='isFree' className='text-sm font-medium text-gray-700'>
            Curso gratuito (establece ambos precios en 0)
          </label>
        </div>

        {/* Info sobre precios */}
        <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='flex gap-3'>
            <div className='flex-shrink-0'>
              <svg className='w-5 h-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                Sistema Bimonetario
              </h4>
              <p className='text-sm text-blue-800'>
                Los usuarios argentinos verán el precio en ARS (pesos) por defecto y podrán comprar directamente.
                Los usuarios de otros países verán el precio en USD.
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
                  <span className='font-semibold'>Haz clic para subir</span> o arrastra una imagen
                </p>
                <p className='text-xs text-gray-500'>PNG, JPG, WEBP (máx. 2MB)</p>
              </div>
            </label>
          </div>
        ) : (
          <div className='relative'>
            <div className='p-4 bg-gray-50 rounded-lg border-2 border-gray-200'>
              <div className='flex items-start gap-4'>
                <img
                  src={formData.image}
                  alt='Preview'
                  className='w-48 h-48 object-cover rounded-lg'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Error+al+cargar+imagen';
                  }}
                />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700 mb-2'>✓ Imagen cargada</p>
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

        {errors.image && <p className='mt-2 text-sm text-red-600'>{errors.image}</p>}
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
        <label htmlFor='isPublished' className='text-sm font-medium text-gray-700'>
          Publicar curso inmediatamente
        </label>
        <span className='ml-auto text-xs text-gray-500'>
          {formData.isPublished ? '✓ Visible para usuarios' : 'Guardado como borrador'}
        </span>
      </div>
    </div>
  );
}
