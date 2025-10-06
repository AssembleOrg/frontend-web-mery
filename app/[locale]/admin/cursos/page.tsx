'use client';

import { useAdminStore } from '@/stores';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function AdminCursosPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'es';

  const { courses, deleteCourse, publishCourse, unpublishCourse } = useAdminStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      const success = deleteCourse(id);
      if (success) {
        setDeleteConfirm(null);
      }
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    if (isPublished) {
      unpublishCourse(id);
    } else {
      publishCourse(id);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `U$S ${price.toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-3xl font-primary font-bold text-gray-900'>
            Gestión de Cursos
          </h2>
          <p className='mt-1 text-sm text-gray-600'>
            Administra todos los cursos y formaciones
          </p>
        </div>
        <Link
          href={`/${locale}/admin/cursos/nuevo`}
          className='inline-flex items-center gap-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl'
        >
          <PlusCircle className='w-5 h-5' />
          Crear Nuevo Curso
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Cursos</p>
              <p className='text-3xl font-bold text-gray-900'>{courses.length}</p>
            </div>
            <div className='p-3 bg-blue-50 rounded-full'>
              <div className='w-8 h-8 bg-blue-500 rounded-full'></div>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Publicados</p>
              <p className='text-3xl font-bold text-green-600'>
                {courses.filter((c) => c.isPublished).length}
              </p>
            </div>
            <div className='p-3 bg-green-50 rounded-full'>
              <div className='w-8 h-8 bg-green-500 rounded-full'></div>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Borradores</p>
              <p className='text-3xl font-bold text-orange-600'>
                {courses.filter((c) => !c.isPublished).length}
              </p>
            </div>
            <div className='p-3 bg-orange-50 rounded-full'>
              <div className='w-8 h-8 bg-orange-500 rounded-full'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Curso
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Precio
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Lecciones
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center'>
                    <div className='text-gray-500'>
                      <p className='text-lg font-medium'>No hay cursos creados</p>
                      <p className='text-sm mt-1'>
                        Crea tu primer curso haciendo clic en &quot;Crear Nuevo Curso&quot;
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        {course.image && (
                          <img
                            src={course.image}
                            alt={course.title}
                            className='h-12 w-12 rounded object-cover mr-4'
                          />
                        )}
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {course.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {course.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {formatPrice(course.price, course.currency)}
                      </div>
                      <div className='text-xs text-gray-500'>{course.currency}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {course.lessons?.length || 0} lecciones
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {course.isPublished ? (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          <Eye className='w-3 h-3 mr-1' />
                          Publicado
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                          <EyeOff className='w-3 h-3 mr-1' />
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.isPublished ?? false)}
                          className='text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors'
                          title={course.isPublished ? 'Despublicar' : 'Publicar'}
                        >
                          {course.isPublished ? (
                            <EyeOff className='w-4 h-4' />
                          ) : (
                            <Eye className='w-4 h-4' />
                          )}
                        </button>
                        <button
                          onClick={() => router.push(`/${locale}/admin/cursos/${course.id}`)}
                          className='text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors'
                          title='Editar'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className={`p-2 rounded transition-colors ${
                            deleteConfirm === course.id
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title={deleteConfirm === course.id ? 'Confirmar eliminación' : 'Eliminar'}
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
