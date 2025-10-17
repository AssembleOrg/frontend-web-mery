/**
 * User Courses Service
 * Layer 2: Services (Pure HTTP calls)
 *
 * ARQUITECTURA: NUNCA state management, solo HTTP
 */

import { UserCourse } from '@/types/course';
import { getCourseImage } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class UserCoursesServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'UserCoursesServiceError';
  }
}

/**
 * Get user's enrolled courses
 * Requires authentication token
 */
export const getUserCourses = async (token: string): Promise<UserCourse[]> => {
  // Use the backend categories endpoint which returns hasAccess field for authenticated users
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: 'Failed to fetch user courses' }));
    throw new UserCoursesServiceError(
      response.status,
      errorBody.message || 'Failed to fetch user courses'
    );
  }

  const responseData = await response.json();

  // Backend returns { success: true, data: { data: Category[], meta: {} } }
  const categories = responseData.data?.data || responseData.data || [];

  // Filter only categories where user has access
  // Exclude free courses (isFree=true) to prevent automatic access
  const userCategories = Array.isArray(categories)
    ? categories.filter((cat: any) => (cat.hasAccess || cat.isPurchased) && !cat.isFree)
    : [];

  // Convert Category to UserCourse format
  const userCourses: UserCourse[] = userCategories.map((category: any) => ({
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
    enrolledAt: new Date(category.createdAt), // Use creation date as fallback
    progress: {
      courseId: category.id,
      lessonsCompleted: [],
      totalLessons: category.videoCount || 0,
      progressPercentage: 0,
    },
    hasAccess: true, // Already filtered by hasAccess
  }));

  return userCourses;
};

export const userCoursesService = {
  getUserCourses,
};
