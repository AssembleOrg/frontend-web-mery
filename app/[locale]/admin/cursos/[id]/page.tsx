'use client';

import { useAdminStore } from '@/stores';
import CourseForm from '@/components/admin/course-form';
import { useRouter, useParams } from 'next/navigation';
import { CourseCreateInput } from '@/types/course';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CourseFormSkeleton } from '@/components/admin/course-form-skeleton';
import { useModal } from '@/contexts/modal-context';

export default function EditarCursoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const courseId = params.id as string;
  const { showError } = useModal();

  const { categories, fetchCategoryById, updateCategory, fetchVideos, videos, createVideo, updateVideo, deleteVideo } = useAdminStore();
  const [course, setCourse] = useState<any>(null);
  const [originalLessons, setOriginalLessons] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        // First check if course is in local state
        const localCourse = categories.find(c => c.id === courseId);
        let courseData;
        
        if (localCourse) {
          courseData = localCourse;
        } else {
          // Otherwise fetch from API
          const foundCourse = await fetchCategoryById(courseId);
          if (!foundCourse) {
            setNotFound(true);
            setIsLoading(false);
            return;
          }
          courseData = foundCourse;
        }

        // Load videos for this category
        await fetchVideos(courseId);
        const courseVideos = useAdminStore.getState().videos;
        
        console.log('[EditCourse] Loaded videos:', courseVideos);
        
        // Convert videos to lessons format and sort by order
        const lessons = courseVideos
          .map((video: any) => ({
            id: video.id,
            title: video.title,
            slug: video.slug,
            description: video.description || '',
            vimeoVideoId: video.vimeoId || video.slug, // Use vimeoId if available, fallback to slug
            duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : undefined,
            order: video.order || 0,
            isPublished: video.isPublished || false,
          }))
          .sort((a, b) => a.order - b.order);
        
        // Merge course data with lessons
        const courseWithLessons = {
          ...courseData,
          lessons,
        };
        
        console.log('[EditCourse] Course with lessons:', courseWithLessons);
        setCourse(courseWithLessons);
        setOriginalLessons(lessons); // Save original lessons to compare on save
      } catch (error) {
        console.error('Error loading course:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, categories, fetchCategoryById, fetchVideos]);

  const handleSubmit = async (courseData: CourseCreateInput) => {
    setIsSubmitting(true);
    try {
      console.log('[EditarCurso] Iniciando actualización...');
      
      // STEP 1: Update Category (basic course info)
      const categoryUpdates = {
        name: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        image: courseData.image,
        priceARS: courseData.priceARS || 0,
        priceUSD: courseData.priceUSD || 0,
        isFree: courseData.isFree || false,
        isActive: courseData.isPublished || false,
        order: courseData.order || 0,
      };

      console.log('[EditarCurso] Actualizando categoría:', categoryUpdates);
      const updatedCourse = await updateCategory(courseId, categoryUpdates);

      if (!updatedCourse) {
        throw new Error('Failed to update course');
      }

      // STEP 2: Manage Lessons (Videos)
      const newLessons = courseData.lessons || [];
      console.log('[EditarCurso] Lecciones originales:', originalLessons);
      console.log('[EditarCurso] Lecciones nuevas:', newLessons);

      // Identify lessons to delete (were in original but not in new)
      const lessonsToDelete = originalLessons.filter(
        (original) => !newLessons.find((newLesson) => newLesson.id === original.id)
      );

      // Identify lessons to create (start with "lesson-" = generated ID)
      const lessonsToCreate = newLessons.filter(
        (lesson) => lesson.id.startsWith('lesson-')
      );

      // Identify lessons to update (existing IDs, not starting with "lesson-")
      const lessonsToUpdate = newLessons.filter(
        (lesson) => !lesson.id.startsWith('lesson-') && originalLessons.find((orig) => orig.id === lesson.id)
      );

      console.log('[EditarCurso] A eliminar:', lessonsToDelete.length);
      console.log('[EditarCurso] A crear:', lessonsToCreate.length);
      console.log('[EditarCurso] A actualizar:', lessonsToUpdate.length);

      // Delete videos
      for (const lesson of lessonsToDelete) {
        console.log('[EditarCurso] Eliminando video:', lesson.id);
        await deleteVideo(lesson.id);
      }

      // Create new videos
      for (const lesson of lessonsToCreate) {
        console.log('[EditarCurso] Creando video:', lesson.title);
        const videoData = {
          title: lesson.title,
          slug: lesson.slug || lesson.title.toLowerCase().replace(/\s+/g, '-'),
          description: lesson.description || '',
          vimeoId: lesson.vimeoVideoId,
          categoryId: courseId,
          order: lesson.order || 0,
          isPublished: lesson.isPublished || false,
        };
        await createVideo(videoData as any);
      }

      // Update existing videos
      for (const lesson of lessonsToUpdate) {
        console.log('[EditarCurso] Actualizando video:', lesson.id);
        const updates = {
          title: lesson.title,
          slug: lesson.slug || lesson.title.toLowerCase().replace(/\s+/g, '-'),
          description: lesson.description || '',
          order: lesson.order || 0,
          isPublished: lesson.isPublished || false,
        };
        await updateVideo(lesson.id, updates);
      }

      console.log('[EditarCurso] ✓ Curso y lecciones actualizados exitosamente');

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (error) {
      console.error('[EditarCurso] Error:', error);
      showError('Error al actualizar el curso. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/cursos`);
  };

  if (isLoading) {
    return <CourseFormSkeleton />;
  }

  if (notFound || !course) {
    return (
      <div className='space-y-6'>
        <button
          onClick={handleCancel}
          className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Volver a lista de cursos
        </button>

        <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
          <div className='max-w-md mx-auto'>
            <div className='text-6xl mb-4'>❌</div>
            <h2 className='text-2xl font-primary font-bold text-gray-900 mb-2'>
              Curso no encontrado
            </h2>
            <p className='text-gray-600 mb-6'>
              El curso que intentas editar no existe o ha sido eliminado.
            </p>
            <button
              onClick={handleCancel}
              className='px-6 py-3 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
            >
              Volver a lista de cursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Back Button */}
      <button
        onClick={handleCancel}
        className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
      >
        <ArrowLeft className='w-4 h-4' />
        Volver a lista de cursos
      </button>

      {/* Page Header */}
      <div>
        <h2 className='text-3xl font-primary font-bold text-gray-900'>
          Editar Curso
        </h2>
        <p className='mt-1 text-sm text-gray-600'>
          Modificar: <span className='font-semibold'>{course.title || course.name}</span>
        </p>
      </div>

      {/* Course Form */}
      <CourseForm
        course={course}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
