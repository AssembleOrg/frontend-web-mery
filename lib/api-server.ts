import { UserCourse, CourseProgress } from '@/types/course';
import { mockCoursesWithLessons } from './mock-data';

// db simulation mockup
const userAccessDB: { [email: string]: string[] } = {
  'test@example.com': ['tatuaje-cosmetico', 'nanoblading-exclusive'],
};

/**
 * @param userEmail El email del usuario que compró.
 * @param courseIds Un array con los IDs de los cursos comprados.
 */
export async function grantCourseAccess(
  userEmail: string,
  courseIds: string[]
): Promise<void> {
  console.log(
    `[DB SIM] Intentando dar acceso a ${userEmail} para los cursos:`,
    courseIds
  );

  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!userAccessDB[userEmail]) {
    userAccessDB[userEmail] = [];
    console.log(`[DB SIM] Usuario nuevo creado: ${userEmail}`);
  }

  courseIds.forEach((courseId) => {
    if (!userAccessDB[userEmail].includes(courseId)) {
      userAccessDB[userEmail].push(courseId);
      console.log(`[DB SIM] Acceso concedido para el curso: ${courseId}`);
    } else {
      console.log(`[DB SIM] El usuario ya tenía acceso al curso: ${courseId}`);
    }
  });

  console.log(
    `[DB SIM] Estado final de acceso para ${userEmail}:`,
    userAccessDB[userEmail]
  );
}

/**
 * Get user's course IDs
 * @param userEmail Email del usuario
 * @returns Array de course IDs
 */
export function getUserCourseIds(userEmail: string): string[] {
  return userAccessDB[userEmail] || [];
}

/**
 * Get user's courses with full details
 * @param userEmail Email del usuario
 * @returns Array de UserCourse
 */
export function getUserCourses(userEmail: string): UserCourse[] {
  const courseIds = getUserCourseIds(userEmail);

  const userCourses: UserCourse[] = courseIds
    .map((courseId) => {
      const course = mockCoursesWithLessons.find((c) => c.id === courseId);

      if (!course) {
        console.warn(`[DB SIM] Curso no encontrado: ${courseId}`);
        return null;
      }

      // Mock progress - en producción vendría del backend
      const progress: CourseProgress = {
        courseId: course.id,
        lessonsCompleted: [],
        totalLessons: course.lessons?.length || 0,
        progressPercentage: 0,
      };

      return {
        courseId: course.id,
        course,
        enrolledAt: new Date(), // Mock date - vendría del backend
        progress,
        hasAccess: true,
      };
    })
    .filter((uc): uc is UserCourse => uc !== null);

  return userCourses;
}
