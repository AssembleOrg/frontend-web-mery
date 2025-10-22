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

  const { categories, fetchCategoryById, updateCategory, fetchVideos, createVideo, updateVideo, deleteVideo } = useAdminStore();
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
        
        // ✅ FIX: Filtrar SOLO los videos de este curso específico
        const courseVideos = useAdminStore.getState().getVideosByCategory(courseId);

        // Convert videos to lessons format and sort by order
        const lessons = courseVideos
          .map((video: any) => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            vimeoVideoId: video.vimeoId,
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

        setCourse(courseWithLessons);
        setOriginalLessons(lessons); // Save original lessons to compare on save
      } catch (_error) {
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
      // STEP 1: Update Category (basic course info)
      const categoryUpdates = {
        name: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        long_description: courseData.long_description || '',
        long_description_en: courseData.long_description_en || '',
        target: courseData.target || '',
        target_en: courseData.target_en || '',
        modalidad: courseData.modalidad || '',
        modalidad_en: courseData.modalidad_en || '',
        learn: courseData.learn || '',
        learn_en: courseData.learn_en || '',
        includes_category: courseData.includes_category || [],
        includes_category_en: courseData.includes_category_en || [],
        image: courseData.image,
        priceARS: courseData.priceARS || 0,
        priceUSD: courseData.priceUSD || 0,
        isFree: courseData.isFree || false,
        isActive: courseData.isPublished || false,
        order: courseData.order || 0,
      };

      const updatedCourse = await updateCategory(courseId, categoryUpdates);

      if (!updatedCourse) {
        throw new Error('Failed to update course');
      }

      // STEP 2: Manage Lessons (Videos)
      const newLessons = courseData.lessons || [];

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

      // Delete videos
      for (const lesson of lessonsToDelete) {
        await deleteVideo(lesson.id);
      }

      // Create new videos
      for (let index = 0; index < lessonsToCreate.length; index++) {
        const lesson = lessonsToCreate[index];

        // Validar que el vimeoId esté presente
        if (!lesson.vimeoVideoId || lesson.vimeoVideoId.trim() === '') {
          throw new Error(`La lección "${lesson.title}" no tiene un ID de Vimeo válido`);
        }

        const videoData = {
          title: lesson.title,
          description: lesson.description || '',
          vimeoId: lesson.vimeoVideoId.trim(),
          categoryId: courseId,
          order: lesson.order !== undefined ? lesson.order : index,
          isPublished: lesson.isPublished ?? false,
        };

        const createdVideo = await createVideo(videoData);

        if (!createdVideo) {
          throw new Error(`No se pudo crear el video "${lesson.title}"`);
        }
      }

      // Update existing videos
      for (const lesson of lessonsToUpdate) {
        const updates = {
          title: lesson.title,
          description: lesson.description || '',
          order: lesson.order || 0,
          isPublished: lesson.isPublished || false,
        };
        await updateVideo(lesson.id, updates);
      }

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (_error) {
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
