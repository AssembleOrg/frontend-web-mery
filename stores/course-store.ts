import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Course, UserCourse, CourseProgress, Lesson } from '@/types/course';

interface CourseState {
  userCourses: UserCourse[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
}

interface CourseActions {
  setUserCourses: (courses: UserCourse[]) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  markLessonCompleted: (courseId: string, lessonId: string) => void;
  updateProgress: (courseId: string, progress: Partial<CourseProgress>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getUserCourseProgress: (courseId: string) => CourseProgress | undefined;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
}

export const useCourseStore = create<CourseState & CourseActions>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      userCourses: [],
      currentCourse: null,
      currentLesson: null,
      isLoading: false,
      error: null,

      // Acciones
      setUserCourses: (courses) => 
        set((state) => {
          state.userCourses = courses;
        }),

      setCurrentCourse: (course) => 
        set((state) => {
          state.currentCourse = course;
        }),

      setCurrentLesson: (lesson) => 
        set((state) => {
          state.currentLesson = lesson;
        }),

      markLessonCompleted: (courseId, lessonId) => 
        set((state) => {
          const userCourse = state.userCourses.find(uc => uc.courseId === courseId);
          if (userCourse) {
            if (!userCourse.progress.lessonsCompleted.includes(lessonId)) {
              userCourse.progress.lessonsCompleted.push(lessonId);
              userCourse.progress.progressPercentage = 
                (userCourse.progress.lessonsCompleted.length / userCourse.progress.totalLessons) * 100;
              userCourse.progress.lastAccessed = new Date();
            }
          }
        }),

      updateProgress: (courseId, progressUpdate) => 
        set((state) => {
          const userCourse = state.userCourses.find(uc => uc.courseId === courseId);
          if (userCourse) {
            Object.assign(userCourse.progress, progressUpdate);
          }
        }),

      setLoading: (loading) => 
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) => 
        set((state) => {
          state.error = error;
        }),

      clearError: () => 
        set((state) => {
          state.error = null;
        }),

      getUserCourseProgress: (courseId) => {
        const userCourse = get().userCourses.find(uc => uc.courseId === courseId);
        return userCourse?.progress;
      },

      isLessonCompleted: (courseId, lessonId) => {
        const userCourse = get().userCourses.find(uc => uc.courseId === courseId);
        return userCourse?.progress.lessonsCompleted.includes(lessonId) || false;
      },
    })),
    {
      name: 'course-storage',
      partialize: (state) => ({
        userCourses: state.userCourses,
      }),
    }
  )
);