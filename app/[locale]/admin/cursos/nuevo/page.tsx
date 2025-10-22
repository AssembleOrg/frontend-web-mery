'use client';

import { useState } from 'react';
import { useAdminStore } from '@/stores';
import CourseForm from '@/components/admin/course-form';
import { useRouter, useParams } from 'next/navigation';
import { CourseCreateInput } from '@/types/course';
import { ArrowLeft } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';
import { toast } from 'react-hot-toast';

export default function NuevoCursoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useModal();

  const { createCategory, createVideo } = useAdminStore();

  const handleSubmit = async (courseData: CourseCreateInput) => {
    setIsSubmitting(true);
    try {
      // STEP 1: Create Category (basic course info)
      const categoryData = {
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
        order: courseData.order || 0,
        isActive: courseData.isPublished || false,
      };

      const newCourse = await createCategory(categoryData);

      if (!newCourse) {
        throw new Error('Failed to create course');
      }

      // STEP 2: Create Lessons (Videos) if any
      const lessons = courseData.lessons || [];

      if (lessons.length > 0) {
        for (let index = 0; index < lessons.length; index++) {
          const lesson = lessons[index];

          // Validar que el vimeoId esté presente
          if (!lesson.vimeoVideoId || lesson.vimeoVideoId.trim() === '') {
            throw new Error(
              `La lección "${lesson.title}" no tiene un ID de Vimeo válido`
            );
          }

          const videoData = {
            title: lesson.title,
            description: lesson.description || '',
            vimeoId: lesson.vimeoVideoId.trim(),
            categoryId: newCourse.id,
            order: lesson.order !== undefined ? lesson.order : index,
            isPublished: lesson.isPublished ?? false,
          };

          const createdVideo = await createVideo(videoData);

          if (!createdVideo) {
            throw new Error(`No se pudo crear el video "${lesson.title}"`);
          }
        }
      }

      // Show success toast
      toast.success(`Curso "${courseData.title}" creado exitosamente`);

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (error) {
      let errorMessage = 'Error desconocido al crear el curso';

      if (error instanceof Error) {
        if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Error al crear el curso. La imagen puede ser demasiado pesada (máx. 2MB recomendado).';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/cursos`);
  };

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
          Crear Nuevo Curso
        </h2>
        <p className='mt-1 text-sm text-gray-600'>
          Completa todos los pasos para crear un nuevo curso de formación
        </p>
      </div>

      {/* Course Form */}
      <CourseForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
