'use client';

import { useAdminStore } from '@/stores';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { PlusCircle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CourseTableSkeleton } from '@/components/admin/course-table-skeleton';
import { useModal } from '@/contexts/modal-context';
import { toast } from 'react-hot-toast';

export default function AdminCursosPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'es';

  const { showConfirm } = useModal();
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe directly to admin store (auto-updates when categories change)
  const categories = useAdminStore((state) => state.categories);
  const fetchCategories = useAdminStore((state) => state.fetchCategories);
  const deleteCategory = useAdminStore((state) => state.deleteCategory);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
      } catch (_error) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string, courseName: string) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Curso',
      message: `¿Estás seguro de que deseas eliminar el curso "${courseName}"? Esta acción no se puede deshacer y eliminará todos los videos asociados.`,
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    try {
      const success = await deleteCategory(id);
      if (success) {
        toast.success(`Curso "${courseName}" eliminado exitosamente`);
        // No need to update local state - store subscription handles it automatically
      } else {
        toast.error(
          'No se pudo eliminar el curso. Por favor intenta nuevamente.'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido al eliminar el curso';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return <CourseTableSkeleton />;
  }

  return (
    <div
      className='space-y-6 font-admin'
      suppressHydrationWarning
    >
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Gestión de Cursos
          </h2>
          <p className='mt-1 text-sm text-gray-600'>
            Administra todos los cursos y formaciones
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2'>
          <button
            onClick={() => {
              if (
                confirm(
                  '¿Limpiar caché del navegador? Esto recargará la página.'
                )
              ) {
                localStorage.removeItem('course-progress-storage');
                localStorage.removeItem('user-courses-storage');
                toast.success('Caché limpiado');
                window.location.reload();
              }
            }}
            className='inline-flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md w-full sm:w-auto text-sm'
            title='Limpiar caché de cursos del navegador'
          >
            <RefreshCw className='w-4 h-4' />
            Limpiar Caché
          </button>
          <Link
            href={`/${locale}/admin/cursos/nuevo`}
            className='inline-flex items-center justify-center gap-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md w-full sm:w-auto text-sm'
          >
            <PlusCircle className='w-4 h-4' />
            Crear Nuevo Curso
          </Link>
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
                  Precio ARS
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Precio USD
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Videos
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
              {!categories || categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center'
                  >
                    <div className='text-gray-500'>
                      <p className='text-lg font-medium'>
                        No hay cursos creados
                      </p>
                      <p className='text-sm mt-1'>
                        Crea tu primer curso haciendo clic en &quot;Crear Nuevo
                        Curso&quot;
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        {category.image && (
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={90}
                            height={90}
                            className='h-12 w-12 rounded object-cover mr-4'
                          />
                        )}
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {category.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {category.description?.substring(0, 60)}
                            {category.description &&
                              category.description.length > 60 &&
                              '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {category.isFree
                          ? ''
                          : category.priceARS > 0
                          ? `$ ${category.priceARS.toLocaleString()}`
                          : '-'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {category.isFree
                          ? ''
                          : category.priceUSD > 0
                          ? `U$S ${category.priceUSD.toLocaleString()}`
                          : '-'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {category.videoCount || 0} videos
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() =>
                            router.push(
                              `/${locale}/admin/cursos/${category.id}/videos`
                            )
                          }
                          className='text-[#EBA2A8] hover:text-[#660e1b] p-2 hover:bg-[#FBE8EA]/30 rounded transition-colors'
                          title='Gestionar Videos'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='w-4 h-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/${locale}/admin/cursos/${category.id}`
                            )
                          }
                          className='text-[#EBA2A8] hover:text-[#660e1b] p-2 hover:bg-[#FBE8EA]/30 rounded transition-colors'
                          title='Editar'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                          className='p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors'
                          title='Eliminar'
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
