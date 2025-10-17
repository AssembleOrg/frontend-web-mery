/**
 * useUserCourses Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [])
 * - Orchestrates API calls (services) + state updates (stores)
 * - Loading/error states AQUÍ (NO en store)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserCoursesStore } from '@/stores/user-courses-store';
import { useAuth } from './useAuth';
import { getUserCourses as getUserCoursesService } from '@/services/user-courses.service';
import { getCategories } from '@/lib/api-client';
import { UserCourse } from '@/types/course';
import { getCourseImage } from '@/lib/utils';

export function useUserCourses() {
  const { courses, setCourses, clearCourses } = useUserCoursesStore();
  const { isAuthenticated, isLoading: isAuthLoading, token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAttemptedInitialLoad = useRef(false);

  useEffect(() => {
    const loadCourses = async () => {
      if (!token || !user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';
        let coursesData: UserCourse[];

        if (isAdmin) {
          const response = await getCategories({ isActive: true });
          const allCategories = response.data.data;

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
              isPurchased: category.isPurchased || false,
            },
            enrolledAt: new Date(category.createdAt),
            progress: {
              courseId: category.id,
              lessonsCompleted: [],
              totalLessons: category.videoCount || 0,
              progressPercentage: 0,
            },
            hasAccess: true,
          }));
        } else {
          coursesData = await getUserCoursesService(token);
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

    if (!isAuthLoading && isAuthenticated) {
      if (!hasAttemptedInitialLoad.current) {
        hasAttemptedInitialLoad.current = true;
        loadCourses();
      }
    } else if (!isAuthLoading && !isAuthenticated) {
      clearCourses();
      hasAttemptedInitialLoad.current = false;
    }
  }, [isAuthLoading, isAuthenticated, token, user, setCourses, clearCourses]);

  const refresh = useCallback(async () => {
    if (!token || !user) {
      setError('No estás autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';
      let coursesData: UserCourse[];

      if (isAdmin) {
        const response = await getCategories({ isActive: true });
        const allCategories = response.data.data;
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
            isPurchased: category.isPurchased || false,
          },
          enrolledAt: new Date(category.createdAt),
          progress: {
            courseId: category.id,
            lessonsCompleted: [],
            totalLessons: category.videoCount || 0,
            progressPercentage: 0,
          },
          hasAccess: true,
        }));
      } else {
        coursesData = await getUserCoursesService(token);
      }
      setCourses(coursesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al recargar los cursos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, user, setCourses]);

  return {
    courses,
    isLoading: isLoading || isAuthLoading,
    error,
    refresh,
  };
}
