/**
 * User Courses Store
 * Layer 3: Stores (State only)
 *
 * ARQUITECTURA: SOLO state synchronous, NUNCA async
 * NO API calls aquí - usar hooks/useUserCourses.ts para lógica
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UserCourse } from '@/types/course';

interface UserCoursesState {
  courses: UserCourse[];
}

interface UserCoursesActions {
  // Synchronous setters only
  setCourses: (courses: UserCourse[]) => void;
  clearCourses: () => void;
}

/**
 * User courses store
 *
 * ARQUITECTURA:
 * - SOLO setters sincronos
 * - NUNCA async functions
 * - NUNCA API calls (usar hooks/useUserCourses.ts)
 * - NO persist (se carga desde backend cada vez)
 */
export const useUserCoursesStore = create<UserCoursesState & UserCoursesActions>()(
  immer((set) => ({
    // Initial State
    courses: [],

    // Set courses (after fetch from API)
    setCourses: (courses: UserCourse[]) => {
      set((state) => {
        state.courses = courses;
      });
    },

    // Clear courses (on logout)
    clearCourses: () => {
      set((state) => {
        state.courses = [];
      });
    },
  }))
);
