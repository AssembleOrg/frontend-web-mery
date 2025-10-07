'use client';

import { useAdminStore } from '@/stores';
import CourseForm from '@/components/admin/course-form';
import { useRouter, useParams } from 'next/navigation';
import { CourseCreateInput } from '@/types/course';
import { ArrowLeft } from 'lucide-react';

export default function NuevoCursoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';

  const { createCourse } = useAdminStore();

  const handleSubmit = (courseData: CourseCreateInput) => {
    try {
      const newCourse = createCourse(courseData);

      // Show success message (you could add a toast notification here)
      console.log('Curso creado exitosamente:', newCourse);

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (error) {
      console.error('Error creating course:', error);
      // Show error message (you could add a toast notification here)
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
      <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
