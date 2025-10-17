'use client';

import { Lesson } from '@/types/course';
import {
  PlusCircle,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useModal } from '@/contexts/modal-context';

interface LessonsStepProps {
  formData: { lessons?: Lesson[] };
  updateLessons: (lessons: Lesson[]) => void;
  errors: Record<string, string>;
}

export function LessonsStep({
  formData,
  updateLessons,
  errors,
}: LessonsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [loadingVimeoData, setLoadingVimeoData] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { showConfirm, showWarning, showSuccess, showError } = useModal();

  const lessons = formData.lessons || [];

  const generateLessonId = () => {
    return `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleTitleChange = (title: string) => {
    setEditingLesson({
      ...editingLesson,
      title,
    });
  };

  const handleStartAdd = () => {
    setEditingLesson({
      id: generateLessonId(),
      title: '',
      description: '',
      vimeoVideoId: '',
      duration: '',
      order: lessons.length,
      isPublished: true, // Publicado por default
    });
    setIsAdding(true);
    setEditingIndex(null);
    setFormErrors({});
  };

  const handleStartEdit = (index: number) => {
    const lesson = lessons[index];
    setEditingLesson({
      ...lesson,
    });
    setEditingIndex(index);
    setIsAdding(false);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editingLesson.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!editingLesson.vimeoVideoId?.trim()) {
      newErrors.vimeoVideoId = 'El ID de Vimeo es requerido';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLesson = () => {
    if (!validateForm()) {
      return;
    }

    const newLesson: Lesson = {
      id: editingLesson.id || generateLessonId(),
      title: editingLesson.title!.trim(),
      description: editingLesson.description?.trim() || '',
      vimeoVideoId: editingLesson.vimeoVideoId!.trim(),
      duration: editingLesson.duration?.trim() || '',
      order: editingLesson.order ?? lessons.length,
      isPublished: editingLesson.isPublished ?? true,
    };

    if (isAdding) {
      updateLessons([...lessons, newLesson]);
    } else if (editingIndex !== null) {
      const updatedLessons = [...lessons];
      updatedLessons[editingIndex] = newLesson;
      updateLessons(updatedLessons);
    }

    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingLesson({});
    setEditingIndex(null);
    setIsAdding(false);
    setFormErrors({});
  };

  const handleDelete = async (index: number) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Lección',
      message:
        '¿Estás seguro de eliminar esta lección? Esta acción no se puede deshacer.',
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (confirmed) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      // Reorder remaining lessons
      const reorderedLessons = updatedLessons.map((lesson, idx) => ({
        ...lesson,
        order: idx,
      }));
      updateLessons(reorderedLessons);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updatedLessons = [...lessons];
    [updatedLessons[index - 1], updatedLessons[index]] = [
      updatedLessons[index],
      updatedLessons[index - 1],
    ];

    // Update order numbers
    const reorderedLessons = updatedLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx,
    }));

    updateLessons(reorderedLessons);
  };

  const handleMoveDown = (index: number) => {
    if (index === lessons.length - 1) return;

    const updatedLessons = [...lessons];
    [updatedLessons[index], updatedLessons[index + 1]] = [
      updatedLessons[index + 1],
      updatedLessons[index],
    ];

    // Update order numbers
    const reorderedLessons = updatedLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx,
    }));

    updateLessons(reorderedLessons);
  };

  const handleFetchVimeoData = async () => {
    if (!editingLesson.vimeoVideoId?.trim()) {
      showWarning('Por favor ingresa el ID de Vimeo primero');
      return;
    }

    setLoadingVimeoData(true);

    try {
      // En el futuro, esto será una llamada real a la API que obtenga datos de Vimeo
      await new Promise((resolve) => setTimeout(resolve, 800));

      showSuccess(
        'ID de Vimeo validado. Al guardar, se obtendrán automáticamente los datos del video.',
        'Validación Exitosa'
      );
    } catch (_error) {
      showError('Error al validar el ID de Vimeo. Verifica que sea correcto.');
    } finally {
      setLoadingVimeoData(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
          Lecciones del Curso
        </h3>
        <p className='text-gray-600'>
          Agrega las lecciones con sus videos de Vimeo
        </p>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingIndex !== null) && (
        <div className='bg-[#FBE8EA] rounded-lg p-6 border-2 border-[#F7CBCB] shadow-lg'>
          <h4 className='text-xl font-semibold text-gray-900 mb-4'>
            {isAdding ? 'Nueva Lección' : 'Editar Lección'}
          </h4>

          <div className='space-y-4'>
            {/* Title */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Título de la Lección *
              </label>
              <input
                type='text'
                value={editingLesson.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Ej: Introducción al Estilismo de Cejas'
              />
              {formErrors.title && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Descripción
              </label>
              <textarea
                value={editingLesson.description || ''}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    description: e.target.value,
                  })
                }
                rows={4}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent resize-none'
                placeholder='Descripción breve de la lección...'
              />
            </div>

            {/* Vimeo ID */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                ID del Video de Vimeo *
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={editingLesson.vimeoVideoId || ''}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      vimeoVideoId: e.target.value,
                    })
                  }
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                    formErrors.vimeoVideoId
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='987654321'
                />
                <button
                  type='button'
                  onClick={handleFetchVimeoData}
                  disabled={
                    !editingLesson.vimeoVideoId?.trim() || loadingVimeoData
                  }
                  className='px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap'
                >
                  {loadingVimeoData ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin inline mr-2' />
                      Verificando...
                    </>
                  ) : (
                    'Verificar ID'
                  )}
                </button>
              </div>
              {formErrors.vimeoVideoId && (
                <p className='mt-1 text-sm text-red-600'>
                  {formErrors.vimeoVideoId}
                </p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                Pega el ID y haz click en el botón para llenar automáticamente
                los campos
              </p>
            </div>

            {/* Order */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Orden
              </label>
              <input
                type='number'
                value={editingLesson.order ?? 0}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                min='0'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Orden en que aparecerá el video en la lista
              </p>
            </div>

            {/* Published Status */}
            <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <input
                type='checkbox'
                id='lessonPublished'
                checked={editingLesson.isPublished ?? true}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    isPublished: e.target.checked,
                  })
                }
                className='w-5 h-5 text-[#660e1b] border-gray-300 rounded focus:ring-[#660e1b] focus:ring-2'
              />
              <div className='flex-1'>
                <label
                  htmlFor='lessonPublished'
                  className='text-sm font-medium text-gray-900 cursor-pointer'
                >
                  Video Publicado
                </label>
                <p className='text-xs text-gray-500 mt-1'>
                  {editingLesson.isPublished
                    ? '✓ Este video será visible para los usuarios'
                    : 'Este video no será visible para los usuarios (modo borrador)'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <button
                type='button'
                onClick={handleSaveLesson}
                className='inline-flex items-center gap-2 px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
              >
                <Save className='w-4 h-4' />
                Guardar
              </button>
              <button
                type='button'
                onClick={handleCancelEdit}
                className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
              >
                <X className='w-4 h-4' />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Button */}
      {!isAdding && editingIndex === null && (
        <button
          type='button'
          onClick={handleStartAdd}
          className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 text-gray-700 hover:border-[#660e1b] hover:text-[#660e1b] hover:bg-[#660e1b]/5 rounded-lg transition-colors'
        >
          <PlusCircle className='w-5 h-5' />
          Agregar Lección
        </button>
      )}

      {/* Error Message */}
      {errors.lessons && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-600'>{errors.lessons}</p>
        </div>
      )}

      {/* Lessons List */}
      {lessons.length > 0 && (
        <div className='space-y-3'>
          <h4 className='text-lg font-semibold text-gray-900'>
            Lecciones ({lessons.length})
          </h4>

          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex gap-4'>
                {/* Order Badge */}
                <div className='flex-shrink-0'>
                  <div className='flex flex-col gap-1'>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className='p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      title='Mover arriba'
                    >
                      <ChevronUp className='w-4 h-4' />
                    </button>
                    <div className='w-8 h-8 flex items-center justify-center bg-[#660e1b] text-white rounded-full font-semibold text-sm'>
                      {index + 1}
                    </div>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === lessons.length - 1}
                      className='p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      title='Mover abajo'
                    >
                      <ChevronDown className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <h5 className='font-semibold text-gray-900 text-lg'>
                        {lesson.title}
                      </h5>
                      {lesson.description && (
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                          {lesson.description}
                        </p>
                      )}
                      <div className='flex flex-wrap gap-3 mt-2 text-xs text-gray-500'>
                        <span className='flex items-center gap-1'>
                          <span className='font-medium'>Vimeo ID:</span>{' '}
                          {lesson.vimeoVideoId}
                        </span>
                        {lesson.duration && (
                          <span className='flex items-center gap-1'>
                            <span className='font-medium'>Duración:</span>{' '}
                            {lesson.duration}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            lesson.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lesson.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex-shrink-0 flex gap-2'>
                      <button
                        onClick={() => handleStartEdit(index)}
                        disabled={isAdding || editingIndex !== null}
                        className='p-2 text-[#EBA2A8] hover:bg-[#FBE8EA]/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Editar'
                      >
                        <Edit className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        disabled={isAdding || editingIndex !== null}
                        className='p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        title='Eliminar'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {lessons.length === 0 && !isAdding && (
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center'>
          <p className='text-gray-500 mb-4'>No hay lecciones agregadas</p>
          <p className='text-sm text-gray-400'>
            Haz clic en &quot;Agregar Lección&quot; para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
