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
  const response = await fetch(`${API_BASE_URL}/cursos`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new UserCoursesServiceError(
      response.status,
      'Failed to fetch user courses'
    );
  }

  const data: UserCourse[] = await response.json();
  
  // Apply slug-based image logic to all courses
  return data.map((userCourse) => ({
    ...userCourse,
    course: {
      ...userCourse.course,
      image: getCourseImage(userCourse.course.slug, userCourse.course.image)
    }
  }));
};

export const userCoursesService = {
  getUserCourses
};
