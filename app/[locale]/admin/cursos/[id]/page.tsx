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

  const { categories, fetchCategoryById, updateCategory, fetchVideos } = useAdminStore();
  const [course, setCourse] = useState<any>(null);
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
          className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 rounded-lg transition-all'
        >
          <ArrowLeft className='w-3.5 h-3.5' />
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
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 rounded-lg transition-all'
      >
        <ArrowLeft className='w-3.5 h-3.5' />
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
