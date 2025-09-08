import { Course, UserCourse } from '@/types/course';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || `Error ${response.status}: ${response.statusText}`
    );
  }
  
  return response.json();
}

// Obtener cursos del usuario
export const getUserCourses = async (): Promise<UserCourse[]> => {
  return apiRequest<UserCourse[]>('/cursos');
};

// Obtener detalles de un curso específico
export const getCourseDetails = async (courseId: string): Promise<Course> => {
  return apiRequest<Course>(`/cursos/${courseId}`);
};

// Funciones adicionales para cuando el backend esté listo
export const markLessonAsCompleted = async (
  courseId: string, 
  lessonId: string
): Promise<void> => {
  // Por ahora solo manejamos el estado local
  // Cuando tengamos backend real, aquí haremos el POST
  console.log(`Lección ${lessonId} completada en curso ${courseId}`);
};

export const updateCourseProgress = async (
  courseId: string,
  progressData: Record<string, unknown>
): Promise<void> => {
  // Placeholder para cuando tengamos backend
  console.log(`Progreso actualizado para curso ${courseId}:`, progressData);
};