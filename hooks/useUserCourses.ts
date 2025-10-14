/**
 * useUserCourses Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [])
 * - Orchestrates API calls (services) + state updates (stores)
 * - Loading/error states AQUÍ (NO en store) 
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserCoursesStore } from '@/stores/user-courses-store';
import { useAuthStore } from '@/stores/auth-store';
import { getUserCourses as getUserCoursesService } from '@/services/user-courses.service';
import { getCategories } from '@/lib/api-client';
import { UserCourse } from '@/types/course';
import { getCourseImage } from '@/lib/utils';

export function useUserCourses() {
  const { courses, setCourses, clearCourses } = useUserCoursesStore();
  const { token, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-init: Load courses on mount if authenticated
  useEffect(() => {
    const loadCourses = async () => {
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      if (!currentToken) {
        clearCourses();
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if user is Admin or Subadmin
        const isAdmin =
          currentUser?.role === 'ADMIN' || currentUser?.role === 'SUBADMIN';

        let coursesData: UserCourse[];

        if (isAdmin) {
          // For admins: Load ALL active categories from backend
          const response = await getCategories({ isActive: true });
          const allCategories = response.data.data;

          // Convert all categories to UserCourse format
          coursesData = allCategories.map((category: any) => ({
            courseId: category.id,
            course: {
              id: category.id,
              slug: category.slug,
              title: category.name,
              description: category.description || '',
              image: getCourseImage(category.slug, category.image),
              priceARS: category.priceARS || 0,
              priceUSD: category.priceUSD || 0,
              isFree: category.isFree || false,
              isPublished: category.isActive,
              createdAt: new Date(category.createdAt),
              updatedAt: new Date(category.updatedAt),
              order: category.order,
              isActive: category.isActive,
            },
            enrolledAt: new Date(category.createdAt),
            progress: {
              courseId: category.id,
              lessonsCompleted: [],
              totalLessons: category.videoCount || 0,
              progressPercentage: 0,
            },
            hasAccess: true, // Admins have access to everything
          }));
        } else {
          // For regular users: Load only purchased courses
          coursesData = await getUserCoursesService(currentToken);
        }

        setCourses(coursesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar cursos';
        setError(errorMessage);
        if (
          err instanceof Error &&
          'status' in err &&
          (err as any).status === 401
        ) {
          clearCourses();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadCourses();
    } else if (!token && !isAuthenticated) {
      clearCourses();
    }
  }, [token, isAuthenticated]);

  // Refresh courses manually
  const refresh = useCallback(async () => {
    const currentToken = useAuthStore.getState().token;
    const currentUser = useAuthStore.getState().user;

    if (!currentToken) {
      setError('No estás autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if user is Admin or Subadmin
      const isAdmin =
        currentUser?.role === 'ADMIN' || currentUser?.role === 'SUBADMIN';

      let coursesData: UserCourse[];

      if (isAdmin) {
        // For admins: Load ALL active categories from backend
        const response = await getCategories({ isActive: true });
        const allCategories = response.data.data;

        // Convert all categories to UserCourse format
        coursesData = allCategories.map((category: any) => ({
          courseId: category.id,
          course: {
            id: category.id,
            slug: category.slug,
            title: category.name,
            description: category.description || '',
            image: getCourseImage(category.slug, category.image),
            priceARS: category.priceARS || 0,
            priceUSD: category.priceUSD || 0,
            isFree: category.isFree || false,
            isPublished: category.isActive,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
            order: category.order,
            isActive: category.isActive,
          },
          enrolledAt: new Date(category.createdAt),
          progress: {
            courseId: category.id,
            lessonsCompleted: [],
            totalLessons: category.videoCount || 0,
            progressPercentage: 0,
          },
          hasAccess: true, // Admins have access to everything
        }));
      } else {
        // For regular users: Load only purchased courses
        coursesData = await getUserCoursesService(currentToken);
      }

      setCourses(coursesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar cursos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    isLoading,
    error,
    refresh,
  };
}
