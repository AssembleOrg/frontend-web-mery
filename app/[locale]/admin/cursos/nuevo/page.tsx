'use client';

import { useState } from 'react';
import { useAdminStore } from '@/stores';
import CourseForm from '@/components/admin/course-form';
import { useRouter, useParams } from 'next/navigation';
import { CourseCreateInput } from '@/types/course';
import { ArrowLeft } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

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
      console.log('[NuevoCurso] Iniciando creación de curso...');

      // STEP 1: Create Category (basic course info)
      const categoryData = {
        name: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        image: courseData.image,
        priceARS: courseData.priceARS || 0,
        priceUSD: courseData.priceUSD || 0,
        isFree: courseData.isFree || false,
        order: courseData.order || 0,
        isActive: courseData.isPublished || false,
      };

      console.log('[NuevoCurso] Creando categoría:', categoryData);
      const newCourse = await createCategory(categoryData);

      if (!newCourse) {
        throw new Error('Failed to create course');
      }

      console.log('[NuevoCurso] ✓ Categoría creada:', newCourse);

      // STEP 2: Create Lessons (Videos) if any
      const lessons = courseData.lessons || [];

      if (lessons.length > 0) {
        console.log('[NuevoCurso] Creando', lessons.length, 'lecciones...');

        for (let index = 0; index < lessons.length; index++) {
          const lesson = lessons[index];

          // Validar que el vimeoId esté presente
          if (!lesson.vimeoVideoId || lesson.vimeoVideoId.trim() === '') {
            console.error('[NuevoCurso] Error: Lección sin vimeoId:', lesson.title);
            throw new Error(`La lección "${lesson.title}" no tiene un ID de Vimeo válido`);
          }

          const videoData = {
            title: lesson.title,
            description: lesson.description || '',
            vimeoId: lesson.vimeoVideoId.trim(),
            categoryId: newCourse.id,
            order: lesson.order !== undefined ? lesson.order : index,
            isPublished: lesson.isPublished ?? false,
          };

          console.log('[NuevoCurso] Creando video:', lesson.title, 'vimeoId:', videoData.vimeoId);
          const createdVideo = await createVideo(videoData);

          if (!createdVideo) {
            console.error('[NuevoCurso] Error: No se pudo crear el video:', lesson.title);
            throw new Error(`No se pudo crear el video "${lesson.title}"`);
          }

          console.log('[NuevoCurso] ✓ Video creado:', createdVideo.id);
        }

        console.log('[NuevoCurso] ✓ Todas las lecciones creadas');
      }

      console.log('[NuevoCurso] ✓ Curso y lecciones creados exitosamente');

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (error) {
      console.error('[NuevoCurso] Error:', error);
      showError('Error al crear el curso. Por favor intenta nuevamente.');
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
