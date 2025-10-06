'use client';

import { CourseCreateInput } from '@/types/course';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface PreviewStepProps {
  formData: Partial<CourseCreateInput>;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  const modalContent = formData.modalContent || {
    detailedDescription: '',
    includes: [],
    targetAudience: '',
    specialNotes: '',
    additionalInfo: '',
    duration: '',
    level: '',
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
          Vista Previa del Curso
        </h3>
        <p className='text-gray-600'>
          Revisa toda la información antes de crear el curso
        </p>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg border-2 ${
        formData.isPublished
          ? 'bg-green-50 border-green-200'
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className='flex items-center gap-2'>
          {formData.isPublished ? (
            <>
              <CheckCircle className='w-5 h-5 text-green-600' />
              <span className='font-semibold text-green-900'>
                Este curso será publicado inmediatamente
              </span>
            </>
          ) : (
            <>
              <AlertCircle className='w-5 h-5 text-orange-600' />
              <span className='font-semibold text-orange-900'>
                Este curso se guardará como borrador
              </span>
            </>
          )}
        </div>
      </div>

      {/* Course Card Preview */}
      <div>
        <h4 className='text-lg font-semibold text-gray-900 mb-3'>
          Vista de Tarjeta (en /formaciones)
        </h4>
        <div className='max-w-sm bg-white rounded-lg shadow-md overflow-hidden'>
          {formData.image && (
            <div className='relative h-48 w-full'>
              <Image
                src={formData.image}
                alt={formData.title || 'Curso'}
                fill
                className='object-cover'
              />
            </div>
          )}
          <div className='p-4'>
            <p className='text-sm text-gray-600 mb-2'>
              {formData.description}
            </p>
            <p className='text-lg font-semibold text-gray-900 mb-3'>
              {formData.priceDisplay}
            </p>
            <button className='w-full bg-[#f9bbc4] text-white py-2 px-4 rounded text-sm font-medium'>
              Más información
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        <h4 className='text-lg font-semibold text-gray-900 border-b pb-2'>
          Información Básica
        </h4>

        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-gray-600'>Título:</span>
            <p className='font-medium text-gray-900'>{formData.title || '-'}</p>
          </div>
          <div>
            <span className='text-gray-600'>Slug:</span>
            <p className='font-medium text-gray-900'>{formData.slug || '-'}</p>
          </div>
          <div>
            <span className='text-gray-600'>Precio:</span>
            <p className='font-medium text-gray-900'>{formData.priceDisplay || '-'}</p>
          </div>
          <div>
            <span className='text-gray-600'>Moneda:</span>
            <p className='font-medium text-gray-900'>{formData.currency || '-'}</p>
          </div>
        </div>

        <div>
          <span className='text-sm text-gray-600'>Descripción Corta:</span>
          <p className='mt-1 text-gray-900'>{formData.description || '-'}</p>
        </div>
      </div>

      {/* Modal Content */}
      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        <h4 className='text-lg font-semibold text-gray-900 border-b pb-2'>
          Contenido del Modal
        </h4>

        <div>
          <span className='text-sm font-medium text-gray-700'>Descripción Detallada:</span>
          <div className='mt-2 prose prose-sm max-w-none'>
            {modalContent.detailedDescription?.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className='text-gray-900 mb-3'>
                {paragraph}
              </p>
            )) || <p className='text-gray-400 italic'>Sin descripción detallada</p>}
          </div>
        </div>

        {modalContent.includes && modalContent.includes.length > 0 && (
          <div>
            <span className='text-sm font-medium text-gray-700'>¿Qué incluye?</span>
            <ul className='mt-2 space-y-2'>
              {modalContent.includes.map((item: { iconImage?: string; text: string }, index: number) => (
                <li key={index} className='flex items-center gap-2 text-sm text-gray-900'>
                  {item.iconImage && (
                    <img src={item.iconImage} alt='' className='w-5 h-5' />
                  )}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <span className='text-sm font-medium text-gray-700'>Público Objetivo:</span>
          <p className='mt-1 text-gray-900'>{modalContent.targetAudience || '-'}</p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {modalContent.duration && (
            <div>
              <span className='text-sm text-gray-600'>Duración:</span>
              <p className='font-medium text-gray-900'>{modalContent.duration}</p>
            </div>
          )}
          {modalContent.level && (
            <div>
              <span className='text-sm text-gray-600'>Nivel:</span>
              <p className='font-medium text-gray-900'>{modalContent.level}</p>
            </div>
          )}
        </div>

        {modalContent.specialNotes && (
          <div className='p-3 bg-[#f9bbc4]/10 rounded-lg'>
            <span className='text-sm font-medium text-gray-700'>Notas Especiales:</span>
            <p className='mt-1 text-gray-900'>{modalContent.specialNotes}</p>
          </div>
        )}

        {modalContent.additionalInfo && (
          <div>
            <span className='text-sm font-medium text-gray-700'>Información Adicional:</span>
            <p className='mt-1 text-gray-900'>{modalContent.additionalInfo}</p>
          </div>
        )}
      </div>

      {/* Lessons */}
      <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
        <h4 className='text-lg font-semibold text-gray-900 border-b pb-2'>
          Lecciones ({formData.lessons?.length || 0})
        </h4>

        {formData.lessons && formData.lessons.length > 0 ? (
          <div className='space-y-3'>
            {formData.lessons.map((lesson, index) => (
              <div key={lesson.id} className='flex gap-3 p-3 bg-gray-50 rounded-lg'>
                <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#660e1b] text-white rounded-full font-semibold text-sm'>
                  {index + 1}
                </div>
                <div className='flex-1'>
                  <h5 className='font-medium text-gray-900'>{lesson.title}</h5>
                  {lesson.description && (
                    <p className='text-sm text-gray-600 mt-1'>{lesson.description}</p>
                  )}
                  <div className='flex gap-3 mt-2 text-xs text-gray-500'>
                    <span>Vimeo: {lesson.vimeoVideoId}</span>
                    {lesson.duration && <span>⏱️ {lesson.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-400 italic text-sm'>No hay lecciones agregadas</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200'>
          <p className='text-sm text-blue-800 font-medium'>Total de Lecciones</p>
          <p className='text-3xl font-bold text-blue-900 mt-1'>
            {formData.lessons?.length || 0}
          </p>
        </div>
        <div className='p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200'>
          <p className='text-sm text-purple-800 font-medium'>Incluye</p>
          <p className='text-3xl font-bold text-purple-900 mt-1'>
            {modalContent.includes?.length || 0}
          </p>
        </div>
        <div className='p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200'>
          <p className='text-sm text-green-800 font-medium'>Estado</p>
          <p className='text-lg font-bold text-green-900 mt-1'>
            {formData.isPublished ? 'Público' : 'Borrador'}
          </p>
        </div>
      </div>
    </div>
  );
}
