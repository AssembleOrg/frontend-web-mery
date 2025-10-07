/**
 * Server-side API Logic (Development Mode)
 *
 * Simulates database operations for development/testing.
 * Replace with real backend implementation when ready.
 *
 * See BACKEND-INTEGRATION.md for backend implementation guide.
 */

import { UserCourse, CourseProgress } from '@/types/course';
import { mockCoursesWithLessons } from './mock-data';

/**
 * In-memory database simulation
 * Data is lost on server restart
 */
const userAccessDB: { [email: string]: string[] } = {
  'test@example.com': ['tatuaje-cosmetico', 'nanoblading-exclusive'],
};

/**
 * Grant course access to a user
 * @param userEmail User's email address
 * @param courseIds Array of course IDs to grant access to
 */
export async function grantCourseAccess(
  userEmail: string,
  courseIds: string[]
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!userAccessDB[userEmail]) {
    userAccessDB[userEmail] = [];
  }

  courseIds.forEach((courseId) => {
    if (!userAccessDB[userEmail].includes(courseId)) {
      userAccessDB[userEmail].push(courseId);
    }
  });
}

/**
 * Get user's course IDs
 * @param userEmail User's email address
 * @returns Array of course IDs
 */
export function getUserCourseIds(userEmail: string): string[] {
  return userAccessDB[userEmail] || [];
}

/**
 * Get user's courses with full details
 * @param userEmail User's email address
 * @returns Array of UserCourse objects
 */
export function getUserCourses(userEmail: string): UserCourse[] {
  const courseIds = getUserCourseIds(userEmail);

  const userCourses: UserCourse[] = courseIds
    .map((courseId) => {
      const course = mockCoursesWithLessons.find((c) => c.id === courseId);

      if (!course) {
        console.warn(`[API] Course not found: ${courseId}`);
        return null;
      }

      const progress: CourseProgress = {
        courseId: course.id,
        lessonsCompleted: [],
        totalLessons: course.lessons?.length || 0,
        progressPercentage: 0,
      };

      return {
        courseId: course.id,
        course,
        enrolledAt: new Date(),
        progress,
        hasAccess: true,
      };
    })
    .filter((uc): uc is UserCourse => uc !== null);

  return userCourses;
}

