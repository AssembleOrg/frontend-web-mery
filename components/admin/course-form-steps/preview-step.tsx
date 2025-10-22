'use client';

import { CourseCreateInput } from '@/types/course';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface PreviewStepProps {
  formData: Partial<CourseCreateInput>;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  // Helper to render text with bold markdown
  const renderPreviewText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
              <strong key={index} className='font-semibold'>
                {boldText}
              </strong>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
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
          ? 'bg-[#FBE8EA] border-[#EBA2A8]'
          : 'bg-[#F7CBCB]/50 border-[#EBA2A8]/50'
      }`}>
        <div className='flex items-center gap-2'>
          {formData.isPublished ? (
            <>
              <CheckCircle className='w-5 h-5 text-[#660e1b]' />
              <span className='font-semibold text-[#660e1b]'>
                Este curso será publicado inmediatamente
              </span>
            </>
          ) : (
            <>
              <AlertCircle className='w-5 h-5 text-[#660e1b]/70' />
              <span className='font-semibold text-[#660e1b]/70'>
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
            <div className='mb-3'>
              {formData.isFree ? (
                <p className='text-lg font-semibold text-green-600'>Gratis</p>
              ) : formData.priceARS === 99999999 ? (
                // Mostrar solo precio USD para placeholders
                <p className='text-lg font-semibold text-gray-900'>
                  USD {(formData.priceUSD || 0).toLocaleString('en-US')}
                </p>
              ) : (
                // Mostrar ambos precios normalmente
                <div className='space-y-1'>
                  <p className='text-lg font-semibold text-gray-900'>
                    $ {(formData.priceARS || 0).toLocaleString('es-AR')} ARS
                  </p>
                  <p className='text-sm text-gray-600'>
                    U$S {(formData.priceUSD || 0).toLocaleString('en-US')}
                  </p>
                </div>
              )}
            </div>
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
            <span className='text-gray-600'>Precio ARS:</span>
            <p className='font-medium text-gray-900'>
              {formData.isFree ? 'Gratis' : `$ ${(formData.priceARS || 0).toLocaleString('es-AR')}`}
            </p>
          </div>
          <div>
            <span className='text-gray-600'>Precio USD:</span>
            <p className='font-medium text-gray-900'>
              {formData.isFree ? 'Gratis' : `U$S ${(formData.priceUSD || 0).toLocaleString('en-US')}`}
            </p>
          </div>
        </div>

        <div>
          <span className='text-sm text-gray-600'>Descripción Corta:</span>
          <p className='mt-1 text-gray-900'>{formData.description || '-'}</p>
        </div>

        {formData.long_description && (
          <div>
            <span className='text-sm text-gray-600'>Descripción Detallada (ES):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.long_description)}
            </p>
          </div>
        )}

        {formData.long_description_en && (
          <div>
            <span className='text-sm text-gray-600'>Detailed Description (EN):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.long_description_en)}
            </p>
          </div>
        )}

        {formData.target && (
          <div>
            <span className='text-sm text-gray-600'>Público Objetivo (ES):</span>
            <p className='mt-1 text-gray-900'>{formData.target}</p>
          </div>
        )}

        {formData.target_en && (
          <div>
            <span className='text-sm text-gray-600'>Target Audience (EN):</span>
            <p className='mt-1 text-gray-900'>{formData.target_en}</p>
          </div>
        )}

        {formData.modalidad && (
          <div>
            <span className='text-sm text-gray-600'>Modalidad (ES):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.modalidad)}
            </p>
          </div>
        )}

        {formData.modalidad_en && (
          <div>
            <span className='text-sm text-gray-600'>Modality (EN):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.modalidad_en)}
            </p>
          </div>
        )}

        {formData.learn && (
          <div>
            <span className='text-sm text-gray-600'>¿Qué aprenderás? (ES):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.learn)}
            </p>
          </div>
        )}

        {formData.learn_en && (
          <div>
            <span className='text-sm text-gray-600'>What will you learn? (EN):</span>
            <p className='mt-1 text-gray-900 whitespace-pre-line'>
              {renderPreviewText(formData.learn_en)}
            </p>
          </div>
        )}

        {formData.includes_category && formData.includes_category.length > 0 && (
          <div>
            <span className='text-sm text-gray-600'>¿Qué incluye? (ES):</span>
            <div className='mt-2 space-y-2'>
              {formData.includes_category.map((item, index) => (
                <div key={index} className='flex items-start gap-2 p-2 bg-gray-50 rounded'>
                  {item.url_icon && (
                    <span className='text-xs text-gray-500'>🖼️</span>
                  )}
                  <p className='text-sm text-gray-900'>
                    {renderPreviewText(item.texto || item.text || '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.includes_category_en && formData.includes_category_en.length > 0 && (
          <div>
            <span className='text-sm text-gray-600'>What does it include? (EN):</span>
            <div className='mt-2 space-y-2'>
              {formData.includes_category_en.map((item, index) => (
                <div key={index} className='flex items-start gap-2 p-2 bg-gray-50 rounded'>
                  {item.url_icon && (
                    <span className='text-xs text-gray-500'>🖼️</span>
                  )}
                  <p className='text-sm text-gray-900'>
                    {renderPreviewText(item.texto || item.text || '')}
                  </p>
                </div>
              ))}
            </div>
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
      <div className='grid grid-cols-2 gap-4'>
        <div className='p-4 bg-gradient-to-br from-[#FBE8EA] to-[#F7CBCB] rounded-lg border border-[#EBA2A8]'>
          <p className='text-sm text-[#660e1b] font-medium'>Total de Lecciones</p>
          <p className='text-3xl font-bold text-[#2B2B2B] mt-1'>
            {formData.lessons?.length || 0}
          </p>
        </div>
        <div className='p-4 bg-gradient-to-br from-[#FBE8EA] to-[#EBA2A8] rounded-lg border border-[#EBA2A8]'>
          <p className='text-sm text-[#660e1b] font-medium'>Estado</p>
          <p className='text-lg font-bold text-[#660e1b] mt-1'>
            {formData.isPublished ? 'Público' : 'Borrador'}
          </p>
        </div>
      </div>
    </div>
  );
}
