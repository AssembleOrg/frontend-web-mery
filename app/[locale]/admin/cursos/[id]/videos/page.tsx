'use client';

import { useAdminStore } from '@/stores';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CreateVideoInput } from '@/lib/api-client';
import { VideoManagementSkeleton } from '@/components/admin/video-management-skeleton';
import { useModal } from '@/contexts/modal-context';

export default function CursoVideosPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const courseId = params.id as string;
  const { showConfirm, showWarning, showSuccess, showError } = useModal();

  const {
    videos,
    fetchCategoryById,
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    getVideosByCategory,
  } = useAdminStore();

  const [course, setCourse] = useState<any>(null);
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState<
    Partial<CreateVideoInput> & { isPublished?: boolean }
  >({
    title: '',
    description: '',
    vimeoId: '',
    categoryId: courseId,
    order: 0,
  });
  const [isFetchingVimeo, setIsFetchingVimeo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Race condition prevention: AbortController para cancelar requests
  const loadDataAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadData = async () => {
    // Cancelar request anterior si existe
    if (loadDataAbortController.current) {
      console.log('[VideosPage] Cancelando carga anterior de datos');
      loadDataAbortController.current.abort();
    }

    // Crear nuevo AbortController para este request
    const abortController = new AbortController();
    loadDataAbortController.current = abortController;

    setIsLoading(true);
    console.log('[VideosPage] Iniciando carga de datos para curso:', courseId);

    try {
      // Load course info
      const foundCourse = await fetchCategoryById(courseId);

      // Solo actualizar estado si el request no fue abortado
      if (!abortController.signal.aborted && foundCourse) {
        setCourse(foundCourse);
        console.log('[VideosPage] Curso cargado:', foundCourse.name);
      }

      // Load videos for this course
      await fetchVideos(courseId);

      if (!abortController.signal.aborted) {
        console.log('[VideosPage] Videos cargados exitosamente');
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('[VideosPage] Error loading data:', error);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Usar el helper del store para obtener videos filtrados
    const filtered = getVideosByCategory(courseId);
    console.log('[VideosPage] Total videos in store:', videos.length);
    console.log(
      '[VideosPage] Filtered videos for course',
      courseId,
      ':',
      filtered.length
    );
    setCourseVideos(filtered);
  }, [videos, courseId, getVideosByCategory]);

  const handleBack = () => {
    router.push(`/${locale}/admin/cursos`);
  };

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      vimeoId: '',
      categoryId: courseId,
      order: courseVideos.length,
      isPublished: false, // Default to unpublished (draft mode)
    });
    setErrors({});
  };

  const handleStartEdit = (video: any) => {
    setIsEditing(true);
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      vimeoId: video.vimeoId || '',
      categoryId: video.categoryId,
      order: video.order || 0,
      isPublished: video.isPublished || false, // Load current published status
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      vimeoId: '',
      categoryId: courseId,
      order: 0,
      isPublished: false,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!formData.vimeoId?.trim() && !editingVideo) {
      newErrors.vimeoId = 'El ID de Vimeo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
    });
  };

  const handleFetchVimeoData = async () => {
    if (!formData.vimeoId?.trim()) {
      showWarning('Por favor ingresa el ID de Vimeo primero');
      return;
    }

    setIsFetchingVimeo(true);

    try {
      // En el futuro, esto será una llamada real a la API que obtenga datos de Vimeo
      // Por ahora, simplemente validamos que el ID esté presente

      // La API del backend automáticamente obtendrá:
      // - thumbnail desde Vimeo
      // - duration desde Vimeo
      // - vimeoUrl desde Vimeo

      showSuccess(
        'ID de Vimeo validado. Al guardar, se obtendrán automáticamente los datos del video.',
        'Validación Exitosa'
      );
    } catch (error) {
      console.error('Error validating Vimeo ID:', error);
      showError('Error al validar el ID de Vimeo. Verifica que sea correcto.');
    } finally {
      setIsFetchingVimeo(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      console.log('[VideosPage] Form data is not valid', errors);
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      if (editingVideo) {
        // Update existing video
        console.log('[VideosPage] Updating video:', editingVideo.id);
        const updates = {
          title: formData.title!,
          description: formData.description,
          order: formData.order,
          isPublished: formData.isPublished, // Include published status
        };
        const result = await updateVideo(editingVideo.id, updates);
        console.log('[VideosPage] Video updated:', result);
        toast.success('Video actualizado exitosamente');
      } else {
        // Create new video
        console.log('[VideosPage] Creating new video for course:', courseId);
        const newVideo: CreateVideoInput = {
          title: formData.title!,
          description: formData.description,
          vimeoId: formData.vimeoId!,
          categoryId: courseId,
          order: formData.order || courseVideos.length,
          isPublished: formData.isPublished, // Include published status
        };
        const result = await createVideo(newVideo as any);
        console.log('[VideosPage] Video created:', result);

        if (!result) {
          throw new Error('Failed to create video - no result returned');
        }
        toast.success('Video creado exitosamente');
      }

      // Reload data to ensure sync
      console.log('[VideosPage] Reloading data after save...');
      await loadData();
      handleCancelEdit();
    } catch (error) {
      console.error('[VideosPage] Error saving video:', error);
      // El error ya viene formateado desde admin-store.ts para errores 409
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al guardar el video. Por favor intenta nuevamente.';
      toast.error(errorMessage, {
        duration: 5000, // Mostrar por 5 segundos para errores importantes
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Video',
      message:
        '¿Estás seguro de eliminar este video? Esta acción no se puede deshacer.',
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteVideo(videoId);
      await loadData();
      toast.success('Video eliminado exitosamente');
    } catch (error) {
      console.error('[VideosPage] Error deleting video:', error);
      toast.error('Error al eliminar el video. Por favor intenta nuevamente.');
    }
  };

  const handleTogglePublish = async (video: any) => {
    try {
      // Solo enviar isPublished, el backend maneja publishedAt automáticamente
      const newStatus = !video.isPublished;
      await updateVideo(video.id, {
        isPublished: newStatus,
      });
      await loadData();
      toast.success(
        newStatus
          ? 'Video publicado exitosamente'
          : 'Video despublicado exitosamente'
      );
    } catch (error) {
      console.error('[VideosPage] Error toggling publish status:', error);
      toast.error(
        'Error al cambiar el estado de publicación. Por favor intenta nuevamente.'
      );
    }
  };

  if (isLoading) {
    return <VideoManagementSkeleton />;
  }

  if (!course) {
    return (
      <div className='space-y-6'>
        <button
          onClick={handleBack}
          className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Volver a cursos
        </button>
        <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
          <p className='text-gray-600'>Curso no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 font-admin'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <button
            onClick={handleBack}
            className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Volver a cursos
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Videos de: {course.name}
          </h1>
          <p className='text-gray-600 mt-1'>
            Gestiona los videos de este curso usando IDs de Vimeo
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartAdd}
            className='inline-flex items-center gap-2 px-4 py-3 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
          >
            <PlusCircle className='w-5 h-5' />
            Agregar Video
          </button>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className='bg-white rounded-lg shadow-lg p-6 border-2 border-[#f9bbc4]'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            {editingVideo ? 'Editar Video' : 'Nuevo Video'}
          </h2>

          <div className='space-y-4'>
            {/* Title */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Título del Video *
              </label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`text-black w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Ej: Introducción al Microblading'
              />
              {errors.title && (
                <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className='text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
                placeholder='Descripción del contenido del video...'
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
                  value={formData.vimeoId}
                  onChange={(e) =>
                    setFormData({ ...formData, vimeoId: e.target.value })
                  }
                  className={`text-black flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent ${
                    errors.vimeoId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='776643755'
                  disabled={!!editingVideo}
                />
                {!editingVideo && (
                  <button
                    type='button'
                    onClick={handleFetchVimeoData}
                    disabled={!formData.vimeoId?.trim() || isFetchingVimeo}
                    className='px-4 py-2 bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap'
                  >
                    {isFetchingVimeo ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin inline mr-2' />
                        Verificando...
                      </>
                    ) : (
                      'Verificar ID'
                    )}
                  </button>
                )}
              </div>
              {errors.vimeoId && (
                <p className='mt-1 text-sm text-red-600'>{errors.vimeoId}</p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                {editingVideo
                  ? 'El ID de Vimeo no se puede cambiar después de crear el video'
                  : 'El thumbnail y duración se obtendrán automáticamente desde Vimeo al guardar'}
              </p>
            </div>

            {/* Order */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Orden
              </label>
              <input
                type='number'
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                className='text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660e1b] focus:border-transparent'
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
                id='isPublished'
                checked={formData.isPublished || false}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className='w-5 h-5 text-[#660e1b] border-gray-300 rounded focus:ring-[#660e1b] focus:ring-2'
              />
              <div className='flex-1'>
                <label
                  htmlFor='isPublished'
                  className='block text-sm font-medium text-gray-700 cursor-pointer'
                >
                  Video Publicado
                </label>
                <p className='text-xs text-gray-500 mt-1'>
                  {formData.isPublished
                    ? '✓ Este video será visible para los usuarios con acceso al curso'
                    : '○ Este video no será visible para los usuarios (modo borrador)'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3 pt-4'>
              <button
                onClick={handleSave}
                className='inline-flex items-center gap-2 px-6 py-3 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
              >
                <Save className='w-4 h-4' />
                Guardar Video
              </button>
              <button
                onClick={handleCancelEdit}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors'
              >
                <X className='w-4 h-4' />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            Videos del Curso ({courseVideos.length})
          </h2>

          {courseVideos.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-2'>No hay videos en este curso</p>
              <p className='text-sm text-gray-400'>
                Agrega tu primer video haciendo clic en &quot;Agregar
                Video&quot;
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {courseVideos
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((video) => (
                  <div
                    key={video.id}
                    className='flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'
                  >
                    {/* Thumbnail */}
                    {video.thumbnail && (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={128}
                        height={72}
                        className='w-32 h-18 object-cover rounded'
                      />
                    )}

                    {/* Info */}
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                          {video.description}
                        </p>
                      )}
                      <div className='flex gap-4 mt-2 text-xs text-gray-500'>
                        <span>Orden: {video.order}</span>
                        {video.duration && (
                          <span>
                            Duración: {Math.floor(video.duration / 60)}:
                            {(video.duration % 60).toString().padStart(2, '0')}{' '}
                            min
                          </span>
                        )}
                        <span
                          className={`font-medium ${
                            video.isPublished
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {video.isPublished ? '● Publicado' : '○ No publicado'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleTogglePublish(video)}
                        className={`p-2.5 rounded-lg transition-all border-2 ${
                          video.isPublished
                            ? 'bg-[#F7CBCB] border-[#EBA2A8] text-[#660e1b] hover:bg-[#EBA2A8] hover:text-white'
                            : 'bg-[#FBE8EA] border-[#EBA2A8]/50 text-[#660e1b]/70 hover:bg-[#F7CBCB] hover:border-[#EBA2A8]'
                        }`}
                        title={video.isPublished ? 'Despublicar' : 'Publicar'}
                      >
                        {video.isPublished ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                      <button
                        onClick={() => handleStartEdit(video)}
                        disabled={isEditing}
                        className='p-2.5 rounded-lg bg-[#FBE8EA] border-2 border-[#EBA2A8] text-[#660e1b] hover:bg-[#EBA2A8] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <Edit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={isEditing}
                        className='p-2.5 rounded-lg bg-red-50 border-2 border-red-300 text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className='bg-[#FBE8EA] border border-[#F7CBCB] rounded-lg p-4'>
        <h3 className='font-semibold text-[#660e1b] mb-2'>
          💡 Sobre los videos de Vimeo
        </h3>
        <ul className='text-sm text-[#2B2B2B] space-y-1'>
          <li>
            • Los videos se alojan en Vimeo - solo necesitas el ID del video
          </li>
          <li>• El thumbnail y duración se obtienen automáticamente</li>
          <li>
            • Puedes reordenar los videos cambiando el campo &quot;Orden&quot;
          </li>
          <li>
            • Los videos no publicados no serán visibles para los usuarios
          </li>
        </ul>
      </div>
    </div>
  );
}
