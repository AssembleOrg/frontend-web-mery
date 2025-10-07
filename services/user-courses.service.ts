/**
 * User Courses Service
 * Layer 2: Services (Pure HTTP calls)
 *
 * ARQUITECTURA: NUNCA state management, solo HTTP
 */

import { UserCourse } from '@/types/course';

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

  return response.json();
};

export const userCoursesService = {
  getUserCourses
};
