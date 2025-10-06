'use client';

import { CourseCreateInput, CourseIncludeItem } from '@/types/course';
import { PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { IconSelectorModal } from '../icon-selector-modal';

interface ModalContentStepProps {
  formData: Partial<CourseCreateInput>;
  updateModalContent: (updates: Partial<CourseCreateInput['modalContent']>) => void;
  errors: Record<string, string>;
}

export function ModalContentStep({ formData, updateModalContent, errors }: ModalContentStepProps) {
  const [newIncludeText, setNewIncludeText] = useState('');
  const [newIncludeIcon, setNewIncludeIcon] = useState('');
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const modalContent = formData.modalContent || {
    detailedDescription: '',
    includes: [],
    targetAudience: '',
    specialNotes: '',
    additionalInfo: '',
    duration: '',
    level: '',
  };

  const handleAddInclude = () => {
    if (newIncludeText.trim()) {
      const newInclude: CourseIncludeItem = {
        text: newIncludeText.trim(),
        iconImage: newIncludeIcon.trim() || '/video-icon.png',
      };

      updateModalContent({
        includes: [...(modalContent.includes || []), newInclude],
      });

      setNewIncludeText('');
      setNewIncludeIcon('');
    }
  };

  const handleRemoveInclude = (index: number) => {
    const updatedIncludes = modalContent.includes?.filter((_, i) => i !== index) || [];
    updateModalContent({ includes: updatedIncludes });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
          Contenido del Modal
        </h3>
        <p className='text-gray-600'>
          Información detallada que se mostrará cuando el usuario haga clic en &quot;Más información&quot;
        </p>
      </div>

      {/* Detailed Description */}
      <div>
        <label htmlFor='detailedDescription' className='block text-sm font-medium text-gray-700 mb-2'>
          Descripción Detallada *
        </label>
        <textarea
          id='detailedDescription'
          value={modalContent.detailedDescription || ''}
          onChange={(e) => updateModalContent({ detailedDescription: e.target.value })}
          rows={8}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
            errors.detailedDescription ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Descripción completa del curso. Usa doble salto de línea (\n\n) para separar párrafos.'
        />
        {errors.detailedDescription && (
          <p className='mt-1 text-sm text-red-600'>{errors.detailedDescription}</p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          {modalContent.detailedDescription?.length || 0} caracteres • Usa doble enter para párrafos
        </p>
      </div>

      {/* What's Included Section */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          ¿Qué incluye este curso?
        </label>

        {/* List of Includes */}
        {modalContent.includes && modalContent.includes.length > 0 && (
          <div className='space-y-2 mb-4'>
            {modalContent.includes.map((item, index) => (
              <div
                key={index}
                className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'
              >
                {item.iconImage && (
                  <img src={item.iconImage} alt='' className='w-6 h-6 object-contain' />
                )}
                <span className='flex-1 text-sm text-gray-900'>{item.text}</span>
                <button
                  type='button'
                  onClick={() => handleRemoveInclude(index)}
                  className='text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Include */}
        <div className='space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setIsIconSelectorOpen(true)}
              className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <ImageIcon className='w-4 h-4' />
              {newIncludeIcon ? 'Cambiar ícono' : 'Seleccionar ícono'}
            </button>
            {newIncludeIcon && (
              <div className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg'>
                <img src={newIncludeIcon} alt='' className='w-5 h-5 object-contain' />
                <span className='text-sm text-gray-600'>Ícono seleccionado</span>
                <button
                  type='button'
                  onClick={() => setNewIncludeIcon('')}
                  className='ml-2 text-red-600 hover:text-red-800'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            )}
          </div>
          <div className='flex gap-2'>
            <input
              type='text'
              value={newIncludeText}
              onChange={(e) => setNewIncludeText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInclude();
                }
              }}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
              placeholder='Ej: Video tutoriales paso a paso'
            />
            <button
              type='button'
              onClick={handleAddInclude}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
            >
              <PlusCircle className='w-4 h-4' />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor='targetAudience' className='block text-sm font-medium text-gray-700 mb-2'>
          ¿A quién está dirigido? *
        </label>
        <textarea
          id='targetAudience'
          value={modalContent.targetAudience || ''}
          onChange={(e) => updateModalContent({ targetAudience: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
            errors.targetAudience ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Describe el público objetivo de este curso...'
        />
        {errors.targetAudience && (
          <p className='mt-1 text-sm text-red-600'>{errors.targetAudience}</p>
        )}
      </div>

      {/* Duration and Level */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label htmlFor='duration' className='block text-sm font-medium text-gray-700 mb-2'>
            Duración (opcional)
          </label>
          <input
            type='text'
            id='duration'
            value={modalContent.duration || ''}
            onChange={(e) => updateModalContent({ duration: e.target.value })}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
            placeholder='Ej: 8 semanas, 6 meses'
          />
        </div>

        <div>
          <label htmlFor='level' className='block text-sm font-medium text-gray-700 mb-2'>
            Nivel (opcional)
          </label>
          <select
            id='level'
            value={modalContent.level || ''}
            onChange={(e) => updateModalContent({ level: e.target.value })}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          >
            <option value=''>Seleccionar nivel</option>
            <option value='Principiante'>Principiante</option>
            <option value='Principiante a Intermedio'>Principiante a Intermedio</option>
            <option value='Intermedio'>Intermedio</option>
            <option value='Intermedio a Avanzado'>Intermedio a Avanzado</option>
            <option value='Avanzado'>Avanzado</option>
          </select>
        </div>
      </div>

      {/* Special Notes */}
      <div>
        <label htmlFor='specialNotes' className='block text-sm font-medium text-gray-700 mb-2'>
          Notas Especiales (opcional)
        </label>
        <textarea
          id='specialNotes'
          value={modalContent.specialNotes || ''}
          onChange={(e) => updateModalContent({ specialNotes: e.target.value })}
          rows={3}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Información especial destacada sobre el curso...'
        />
      </div>

      {/* Additional Info */}
      <div>
        <label htmlFor='additionalInfo' className='block text-sm font-medium text-gray-700 mb-2'>
          Información Adicional (opcional)
        </label>
        <textarea
          id='additionalInfo'
          value={modalContent.additionalInfo || ''}
          onChange={(e) => updateModalContent({ additionalInfo: e.target.value })}
          rows={3}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
          placeholder='Información sobre pagos internacionales, requisitos especiales, etc.'
        />
      </div>

      {/* Icon Selector Modal */}
      <IconSelectorModal
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelect={(iconPath) => setNewIncludeIcon(iconPath)}
        selectedIcon={newIncludeIcon}
      />
    </div>
  );
}
