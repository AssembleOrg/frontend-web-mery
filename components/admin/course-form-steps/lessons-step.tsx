'use client';

import { Lesson } from '@/types/course';
import { PlusCircle, Trash2, Edit, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { useState } from 'react';

interface LessonsStepProps {
  formData: { lessons?: Lesson[] };
  updateLessons: (lessons: Lesson[]) => void;
  errors: Record<string, string>;
}

export function LessonsStep({ formData, updateLessons, errors }: LessonsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [loadingVimeoData, setLoadingVimeoData] = useState(false);

  const lessons = formData.lessons || [];

  const generateLessonId = () => {
    return `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleStartAdd = () => {
    setEditingLesson({
      id: generateLessonId(),
      title: '',
      description: '',
      vimeoVideoId: '',
      duration: '',
      order: lessons.length + 1,
    });
    setIsAdding(true);
    setEditingIndex(null);
  };

  const handleStartEdit = (index: number) => {
    setEditingLesson({ ...lessons[index] });
    setEditingIndex(index);
    setIsAdding(false);
  };

  const handleSaveLesson = () => {
    if (!editingLesson.title || !editingLesson.vimeoVideoId) {
      return;
    }

    const newLesson: Lesson = {
      id: editingLesson.id || generateLessonId(),
      title: editingLesson.title.trim(),
      description: editingLesson.description?.trim() || '',
      vimeoVideoId: editingLesson.vimeoVideoId.trim(),
      duration: editingLesson.duration?.trim() || '',
      order: editingLesson.order || lessons.length + 1,
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
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Estás seguro de eliminar esta lección?')) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      // Reorder remaining lessons
      const reorderedLessons = updatedLessons.map((lesson, idx) => ({
        ...lesson,
        order: idx + 1,
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
      order: idx + 1,
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
      order: idx + 1,
    }));

    updateLessons(reorderedLessons);
  };

  // TODO: When backend ready, replace with real API call to /api/admin/vimeo/video/{id}
  const handleFetchVimeoData = async () => {
    if (!editingLesson.vimeoVideoId?.trim()) {
      alert('Por favor ingresa el ID de Vimeo primero');
      return;
    }

    setLoadingVimeoData(true);

    try {
      // MOCK - Replace with real API call when backend is ready:
      // const response = await fetch(`/api/admin/vimeo/video/${editingLesson.vimeoVideoId}`);
      // const data = await response.json();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data (will be replaced with real Vimeo data from backend)
      const mockVimeoData = {
        title: `Video de Vimeo ${editingLesson.vimeoVideoId}`,
        description: 'Descripción obtenida automáticamente de Vimeo',
        duration: '12:34', // Backend will format from seconds
      };

      // Auto-fill fields with Vimeo data
      setEditingLesson({
        ...editingLesson,
        title: mockVimeoData.title,
        description: mockVimeoData.description,
        duration: mockVimeoData.duration,
      });

    } catch (error) {
      console.error('Error fetching Vimeo data:', error);
      alert('Error al obtener datos de Vimeo. Intenta nuevamente.');
    } finally {
      setLoadingVimeoData(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h3 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
            Lecciones del Curso
          </h3>
          <p className='text-gray-600'>
            Agrega las lecciones con sus videos de Vimeo
          </p>
        </div>
        {!isAdding && editingIndex === null && (
          <button
            type='button'
            onClick={handleStartAdd}
            className='inline-flex items-center gap-2 px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
          >
            <PlusCircle className='w-4 h-4' />
            Agregar Lección
          </button>
        )}
      </div>

      {/* Error Message */}
      {errors.lessons && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-600'>{errors.lessons}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingIndex !== null) && (
        <div className='p-6 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-4'>
          <h4 className='text-lg font-semibold text-gray-900'>
            {isAdding ? 'Nueva Lección' : 'Editar Lección'}
          </h4>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Título de la Lección *
            </label>
            <input
              type='text'
              value={editingLesson.title || ''}
              onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
              placeholder='Ej: Introducción al Estilismo de Cejas'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Descripción
            </label>
            <textarea
              value={editingLesson.description || ''}
              onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
              rows={3}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
              placeholder='Descripción breve de la lección...'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              ID del Video de Vimeo *
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                value={editingLesson.vimeoVideoId || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, vimeoVideoId: e.target.value })}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                placeholder='987654321'
              />
              <button
                type='button'
                onClick={handleFetchVimeoData}
                disabled={!editingLesson.vimeoVideoId?.trim() || loadingVimeoData}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap'
              >
                {loadingVimeoData ? 'Obteniendo...' : 'Obtener datos de Vimeo'}
              </button>
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              Pega el ID y haz click en el botón para llenar automáticamente los campos
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Duración
            </label>
            <input
              type='text'
              value={editingLesson.duration || ''}
              onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
              placeholder='05:23'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Se completa automáticamente desde Vimeo, o puedes editarlo manualmente
            </p>
          </div>

          <div className='flex gap-2 pt-2'>
            <button
              type='button'
              onClick={handleSaveLesson}
              disabled={!editingLesson.title || !editingLesson.vimeoVideoId}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors'
            >
              <Save className='w-4 h-4' />
              Guardar
            </button>
            <button
              type='button'
              onClick={handleCancelEdit}
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors'
            >
              <X className='w-4 h-4' />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className='space-y-3'>
        {lessons.length === 0 && !isAdding && (
          <div className='p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
            <p className='text-gray-600'>No hay lecciones agregadas</p>
            <p className='text-sm text-gray-500 mt-1'>
              Haz clic en &quot;Agregar Lección&quot; para comenzar
            </p>
          </div>
        )}

        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={`p-4 bg-white border rounded-lg transition-colors ${
              editingIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className='flex items-start gap-4'>
              {/* Order Number */}
              <div className='flex flex-col items-center gap-1'>
                <div className='w-10 h-10 flex items-center justify-center bg-[#660e1b] text-white rounded-full font-bold'>
                  {lesson.order}
                </div>
                <div className='flex flex-col gap-1'>
                  <button
                    type='button'
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className='p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <ChevronUp className='w-4 h-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => handleMoveDown(index)}
                    disabled={index === lessons.length - 1}
                    className='p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <ChevronDown className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {/* Lesson Info */}
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-900'>{lesson.title}</h4>
                {lesson.description && (
                  <p className='text-sm text-gray-600 mt-1'>{lesson.description}</p>
                )}
                <div className='flex gap-4 mt-2 text-xs text-gray-500'>
                  <span>Vimeo ID: {lesson.vimeoVideoId}</span>
                  {lesson.duration && <span>Duración: {lesson.duration}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => handleStartEdit(index)}
                  disabled={isAdding || editingIndex !== null}
                  className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Edit className='w-4 h-4' />
                </button>
                <button
                  type='button'
                  onClick={() => handleDelete(index)}
                  disabled={isAdding || editingIndex !== null}
                  className='p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {lessons.length > 0 && (
        <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <p className='text-sm text-gray-700'>
            <span className='font-semibold'>{lessons.length}</span> lección{lessons.length !== 1 && 'es'} agregada{lessons.length !== 1 && 's'}
          </p>
        </div>
      )}
    </div>
  );
}
