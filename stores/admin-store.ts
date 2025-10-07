// TODO: Remove when backend ready - Replace localStorage with HTTP calls to backend API
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Course, CourseCreateInput, CourseUpdateInput } from '@/types/course';

interface AdminState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

interface AdminActions {
  // CRUD Operations
  getCourses: () => Course[];
  getPublishedCourses: () => Course[];
  getCourseById: (id: string) => Course | undefined;
  getCourseBySlug: (slug: string) => Course | undefined;
  createCourse: (course: CourseCreateInput) => Course;
  updateCourse: (id: string, updates: CourseUpdateInput) => Course | null;
  deleteCourse: (id: string) => boolean;

  // Publishing
  publishCourse: (id: string) => boolean;
  unpublishCourse: (id: string) => boolean;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Seeding (for initial data migration)
  seedCourses: (courses: Course[]) => void;
}

/**
 * Generate a unique ID for courses
 * TODO: Remove when backend ready - Backend will generate IDs
 */
function generateId(): string {
  return `course-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Admin store for course management
 *
 * [TEMP] Currently uses localStorage for persistence
 *
 * WHEN BACKEND IS READY - MIGRATION STEPS:
 * 1. Uncomment all "// BACKEND VERSION:" blocks below
 * 2. Comment out or delete "// TEMP VERSION:" blocks
 * 3. Remove persist() middleware wrapper
 * 4. Update API_BASE_URL in each fetch call
 * 5. Ensure getAuthHeaders() helper exists (see bottom of file)
 *
 * Each function below has TWO versions:
 * - TEMP VERSION (current - localStorage)
 * - BACKEND VERSION (ready to use - commented out)
 */
export const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    immer((set, get) => ({
      // Initial State
      courses: [],
      isLoading: false,
      error: null,

      // Get all courses (including drafts)
      getCourses: () => {
        return get().courses;
      },

      // Get only published courses (for public pages like /formaciones)
      getPublishedCourses: () => {
        return get().courses.filter(course => course.isPublished === true);
      },

      // Get course by ID
      getCourseById: (id: string) => {
        return get().courses.find(course => course.id === id);
      },

      // Get course by slug
      getCourseBySlug: (slug: string) => {
        return get().courses.find(course => course.slug === slug);
      },

      // Create new course
      // TEMP VERSION (localStorage):
      createCourse: (courseInput: CourseCreateInput) => {
        const newCourse: Course = {
          ...courseInput,
          id: generateId(),
          isPublished: courseInput.isPublished ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => {
          state.courses.push(newCourse);
        });

        return newCourse;
      },

      /* BACKEND VERSION (uncomment when ready):
      createCourse: async (courseInput: CourseCreateInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/cursos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseInput)
          });

          if (!response.ok) {
            throw new Error('Failed to create course');
          }

          const newCourse: Course = await response.json();

          set((state) => {
            state.courses.push(newCourse);
            state.isLoading = false;
          });

          return newCourse;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error creating course'
          });
          throw error;
        }
      },
      */

      // Update existing course
      // TEMP VERSION (localStorage):
      updateCourse: (id: string, updates: CourseUpdateInput) => {
        const courseIndex = get().courses.findIndex(c => c.id === id);

        if (courseIndex === -1) {
          set({ error: 'Course not found' });
          return null;
        }

        set((state) => {
          state.courses[courseIndex] = {
            ...state.courses[courseIndex],
            ...updates,
            updatedAt: new Date(),
          };
        });

        return get().courses[courseIndex];
      },

      /* BACKEND VERSION (uncomment when ready):
      updateCourse: async (id: string, updates: CourseUpdateInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/cursos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
          });

          if (!response.ok) {
            throw new Error('Failed to update course');
          }

          const updatedCourse: Course = await response.json();

          set((state) => {
            const index = state.courses.findIndex(c => c.id === id);
            if (index !== -1) {
              state.courses[index] = updatedCourse;
            }
            state.isLoading = false;
          });

          return updatedCourse;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error updating course'
          });
          return null;
        }
      },
      */

      // Delete course
      // TEMP VERSION (localStorage):
      deleteCourse: (id: string) => {
        const courseExists = get().courses.some(c => c.id === id);

        if (!courseExists) {
          set({ error: 'Course not found' });
          return false;
        }

        set((state) => {
          state.courses = state.courses.filter(c => c.id !== id);
        });

        return true;
      },

      /* BACKEND VERSION (uncomment when ready):
      deleteCourse: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/cursos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          if (!response.ok) {
            throw new Error('Failed to delete course');
          }

          set((state) => {
            state.courses = state.courses.filter(c => c.id !== id);
            state.isLoading = false;
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error deleting course'
          });
          return false;
        }
      },
      */

      // Publish course (make it visible to public)
      publishCourse: (id: string) => {
        return get().updateCourse(id, { isPublished: true }) !== null;
      },

      // Unpublish course (hide from public, keep as draft)
      unpublishCourse: (id: string) => {
        return get().updateCourse(id, { isPublished: false }) !== null;
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Seed initial courses (for data migration from hardcoded data)
      seedCourses: (courses: Course[]) => {
        set((state) => {
          // Only seed if store is empty
          if (state.courses.length === 0) {
            state.courses = courses.map(course => ({
              ...course,
              id: course.id || generateId(),
              isPublished: course.isPublished ?? true,
              createdAt: course.createdAt || new Date(),
              updatedAt: course.updatedAt || new Date(),
            }));
          }
        });
      },
    })),
    {
      name: 'admin-courses-storage', // localStorage key
      // Only persist courses, not loading/error states
      partialize: (state) => ({
        courses: state.courses,
      }),
    }
  )
);

/**
 * Helper functions for backend integration
 * Uncomment when backend is ready
 */

/*
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}
*/
