'use client';

import { useAdminStore } from '@/stores';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminCursosPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'es';

  const { fetchCategories, deleteCategory } = useAdminStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
        // Get categories from store after fetch
        const cats = useAdminStore.getState().categories;
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      const success = await deleteCategory(id);
      if (success) {
        setDeleteConfirm(null);
        // Update local state after deletion
        const updatedCategories = useAdminStore.getState().categories;
        setCategories(updatedCategories);
      }
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatPrice = (category: any) => {
    if (category.isFree) {
      return 'Gratis';
    }
    if (category.priceUSD > 0) {
      return `U$S ${category.priceUSD.toLocaleString()}`;
    }
    if (category.priceARS > 0) {
      return `$ ${category.priceARS.toLocaleString()} ARS`;
    }
    return 'N/A';
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]'></div>
          <p className='mt-4 text-gray-600'>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6' suppressHydrationWarning>
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
                categories.map((category) => (
                  <tr key={category.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className='h-12 w-12 rounded object-cover mr-4'
                          />
                        )}
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {category.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {category.description?.substring(0, 60)}
                            {category.description && category.description.length > 60 && '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {formatPrice(category)}
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
                          onClick={() => router.push(`/${locale}/admin/cursos/${category.id}/videos`)}
                          className='text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors'
                          title='Gestionar Videos'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => router.push(`/${locale}/admin/cursos/${category.id}`)}
                          className='text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors'
                          title='Editar'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className={`p-2 rounded transition-colors ${
                            deleteConfirm === category.id
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title={deleteConfirm === category.id ? 'Confirmar eliminación' : 'Eliminar'}
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
