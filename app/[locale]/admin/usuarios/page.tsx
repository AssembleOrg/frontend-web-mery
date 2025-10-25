'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, redirect } from 'next/navigation';
import { FaSearch, FaGift, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const storage = JSON.parse(localStorage.getItem('auth-token-storage') || '{}');
    return storage.state?.token || null;
  } catch {
    return null;
  }
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface VideoCategory {
  id: string;
  name: string;
  description?: string;
  priceARS: number;
  priceUSD: number;
}

interface CategoryPurchase {
  id: string;
  categoryId: string;
  category: VideoCategory;
  createdAt: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userCourses, setUserCourses] = useState<CategoryPurchase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingUserCourses, setIsLoadingUserCourses] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Resetear página cuando cambia el término de búsqueda
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Cargar usuarios cuando cambia el término de búsqueda o la página
  useEffect(() => {
    // Si hay búsqueda, esperar al menos 3 caracteres
    if (searchTerm && searchTerm.trim().length > 0 && searchTerm.trim().length < 3) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 300); // Debounce de 300ms para evitar muchas peticiones

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, pageSize]);

  // Cargar categorías
  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar cursos del usuario seleccionado
  useEffect(() => {
    if (selectedUser) {
      loadUserCourses(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const token = getAuthToken();
      
      // Construir query params según el UserQueryDto del backend
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
      
      // Si hay término de búsqueda, usar el parámetro "search" del backend
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const url = `${API_BASE_URL}/users?${params.toString()}`;
      console.log('🔍 Cargando usuarios:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error('Error al cargar usuarios');

      const responseData = await response.json();
      // Backend retorna: { success, data: { data: [...], meta }, message }
      const usersData = responseData.data?.data || responseData.data || [];
      const meta = responseData.data?.meta;
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      
      // Actualizar metadata de paginación si está disponible
      if (meta) {
        setTotalUsers(meta.total || 0);
        setCurrentPage(meta.page || 1);
      }
    } catch (_error) {
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      
      // Usar el endpoint /categories/all que devuelve TODAS las categorías activas sin paginación
      const response = await fetch(`${API_BASE_URL}/categories/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar categorías');

      // Backend retorna: { success, message, data: [...], timestamp }
      const responseData = await response.json();
      const categoriesData = responseData.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (_error) {
      toast.error('Error al cargar categorías');
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadUserCourses = async (userId: string) => {
    try {
      setIsLoadingUserCourses(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/categories`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error('Error al cargar cursos del usuario');

      const responseData = await response.json();
      // Backend retorna: { success, data: { data: [...], meta }, message }
      const coursesData = responseData.data?.data || responseData.data || [];
      setUserCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (_error) {
      toast.error('Error al cargar cursos del usuario');
      setUserCourses([]);
    } finally {
      setIsLoadingUserCourses(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedUser || !selectedCategory) {
      toast.error('Selecciona un usuario y un curso');
      return;
    }

    // Verificar si ya tiene el curso
    const alreadyHas = userCourses.some((uc) => uc.categoryId === selectedCategory);
    if (alreadyHas) {
      toast.error('El usuario ya tiene acceso a este curso');
      return;
    }

    try {
      setIsLoading(true);
      const category = categories.find((c) => c.id === selectedCategory);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/categories/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          amount: 0, // Gratis (asignación manual)
          currency: 'ARS',
          notes: 'Asignación manual por administrador',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al asignar curso');
      }

      toast.success(`Curso "${category?.name}" asignado exitosamente`);
      setSelectedCategory('');
      loadUserCourses(selectedUser.id);
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCourse = async (categoryId: string) => {
    if (!selectedUser) return;

    const category = userCourses.find((uc) => uc.categoryId === categoryId);
    if (!category) return;

    if (!confirm(`¿Estás seguro de quitar el acceso a "${category.category.name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.id}/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al quitar curso');
      }

      toast.success('Acceso al curso eliminado');
      loadUserCourses(selectedUser.id);
    } catch (error: any) {
      toast.error(error.message || 'Error al quitar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const availableCategories = categories.filter(
    (cat) => !userCourses.some((uc) => uc.categoryId === cat.id)
  );

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6 font-admin">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Asigna cursos manualmente a usuarios (para pagos externos)
          </p>
        </div>
        <button
          onClick={() => redirect('/mi-cuenta')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: Lista de usuarios */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar Usuario</h2>

          {/* Buscador */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o nombre (mín. 3 caracteres)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            {searchTerm && searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
              <p className="text-xs text-amber-600 mt-1 ml-1">
                Escribe al menos 3 caracteres para buscar
              </p>
            )}
          </div>

          {/* Lista de usuarios */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                <p className="mt-2 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios'}
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.isActive ? (
                          <FaCheckCircle className="text-green-500 text-xs" />
                        ) : (
                          <FaTimesCircle className="text-red-500 text-xs" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Paginación */}
          {!isLoadingUsers && users.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Mostrando {users.length} de {totalUsers} usuarios
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho: Asignar cursos */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {selectedUser ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedUser.firstName && selectedUser.lastName
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : selectedUser.name || 'Usuario'}
                </h2>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              {/* Asignar nuevo curso */}
              <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaGift className="text-pink-600" />
                  Asignar Nuevo Curso
                </h3>

                <div className="space-y-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={isLoading || isLoadingCategories}
                  >
                    <option value="">Seleccionar curso...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (${cat.priceARS})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignCourse}
                    disabled={!selectedCategory || isLoading}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Asignando...' : 'Asignar Curso'}
                  </button>
                </div>
              </div>

              {/* Lista de cursos actuales */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Cursos Asignados ({userCourses.length})
                </h3>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {isLoadingUserCourses ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                  ) : userCourses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Este usuario no tiene cursos asignados
                    </div>
                  ) : (
                    userCourses.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {purchase.category.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Asignado:{' '}
                              {new Date(purchase.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveCourse(purchase.categoryId)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed p-2"
                            title="Quitar acceso"
                          >
                            <FaTimesCircle className="text-xl" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
              <FaSearch className="text-6xl mb-4 opacity-20" />
              <p className="text-center">
                Selecciona un usuario de la lista
                <br />
                para gestionar sus cursos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

