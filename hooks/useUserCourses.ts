/**
 * useUserCourses Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [])
 * - Orchestrates API calls (services) + state updates (stores)
 * - Loading/error states AQUÍ (NO en store)
 * - NUNCA store methods en useCallback dependencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserCoursesStore } from '@/stores/user-courses-store';
import { useAuthStore } from '@/stores/auth-store';
import { getUserCourses as getUserCoursesService } from '@/services/user-courses.service';

export function useUserCourses() {
  const { courses, setCourses, clearCourses } = useUserCoursesStore();
  const { token, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-init: Load courses on mount if authenticated
  useEffect(() => {
    const loadCourses = async () => {
      const currentToken = useAuthStore.getState().token;

      if (!currentToken) {
        clearCourses();
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const coursesData = await getUserCoursesService(currentToken);
        setCourses(coursesData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar cursos';
        setError(errorMessage);
        // If error is 401, clear courses (session invalid)
        if (err instanceof Error && 'status' in err && (err as any).status === 401) {
          clearCourses();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCourses();
    } else {
      clearCourses();
    }
  }, [isAuthenticated]); // CRITICAL: Only depend on isAuthenticated

  // Refresh courses manually
  const refresh = useCallback(async () => {
    const currentToken = useAuthStore.getState().token;

    if (!currentToken) {
      setError('No estás autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const coursesData = await getUserCoursesService(currentToken);
      setCourses(coursesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cursos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [setCourses, token]

  return {
    courses,
    isLoading,
    error,
    refresh,
  };
}
