'use client';

import { useAdminStore } from '@/stores';
import CourseForm from '@/components/admin/course-form';
import { useRouter, useParams } from 'next/navigation';
import { CourseCreateInput } from '@/types/course';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EditarCursoPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const courseId = params.id as string;

  const { getCourseById, updateCourse } = useAdminStore();
  const [course, setCourse] = useState(getCourseById(courseId));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const foundCourse = getCourseById(courseId);
    if (!foundCourse) {
      setNotFound(true);
    } else {
      setCourse(foundCourse);
    }
  }, [courseId, getCourseById]);

  const handleSubmit = (courseData: CourseCreateInput) => {
    try {
      const updatedCourse = updateCourse(courseId, courseData);

      if (!updatedCourse) {
        throw new Error('Failed to update course');
      }

      // Show success message
      console.log('Curso actualizado exitosamente:', updatedCourse);

      // Redirect back to courses list
      router.push(`/${locale}/admin/cursos`);
    } catch (error) {
      console.error('Error updating course:', error);
      // Show error message
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/cursos`);
  };

  if (notFound) {
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

  if (!course) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]'></div>
          <p className='mt-4 text-gray-600'>Cargando curso...</p>
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
          Modificar: <span className='font-semibold'>{course.title}</span>
        </p>
      </div>

      {/* Course Form */}
      <CourseForm
        course={course}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
