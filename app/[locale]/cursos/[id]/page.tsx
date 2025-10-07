'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { Course, Lesson } from '@/types/course';
import { getCourseDetails } from '@/lib/api-client';
import { useCourseStore } from '@/stores';
import { useAuth } from '@/hooks/useAuth';
import { getUserCourses as getUserCoursesService } from '@/services/user-courses.service';
import VimeoPlayer from '@/components/vimeo-player';
import LessonContent from '@/components/lesson-content';
import CourseSidebar from '@/components/course-sidebar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CursoDetallePage() {
  const params = useParams();
  const courseId = params.id as string;
  const locale = params.locale as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  const {
    setCurrentCourse,
    setCurrentLesson,
    isLessonCompleted,
    getUserCourseProgress,
  } = useCourseStore();

  const courseProgress = getUserCourseProgress(courseId);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);

        // Verificar que el usuario tiene token
        if (!token) {
          setError('Debes iniciar sesión para acceder a este curso');
          setLoading(false);
          return;
        }

        // 1. Cargar detalles del curso
        const courseData = await getCourseDetails(courseId);

        // 2. Verificar acceso: obtener lista de cursos del usuario
        const userCourses = await getUserCoursesService(token);
        const hasAccess = userCourses.some(uc => uc.courseId === courseId);

        if (!hasAccess) {
          setError('No tienes acceso a este curso. Compra el curso para poder acceder al contenido.');
          setLoading(false);
          return;
        }

        // 3. Usuario tiene acceso: mostrar curso
        setCourse(courseData);
        setCurrentCourse(courseData);

        // Seleccionar la primera lección por defecto
        if (courseData.lessons && courseData.lessons.length > 0) {
          const firstLesson = courseData.lessons[0];
          setSelectedLesson(firstLesson);
          setCurrentLesson(firstLesson);
        }
      } catch (err) {
        setError('Error al cargar el curso');
        console.error('Error loading course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId, token, setCurrentCourse, setCurrentLesson]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentLesson(lesson);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400'></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {error || 'Curso no encontrado'}
          </h1>
          <Link
            href={`/${locale}/mi-cuenta`}
            className='text-pink-500 hover:text-pink-600 underline'
          >
            Volver a mis cursos
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.lessons?.length || 0;
  const completedLessons = courseProgress?.lessonsCompleted.length || 0;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        {/* Navigation */}
        <Navigation />

      {/* Main Content */}
      <div className='bg-[#1a1a1a] relative overflow-hidden'>
        {/* Background SVG */}
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <img
            src='/browes.svg'
            alt='Background decoration'
            className='w-full h-full object-cover object-center'
          />
        </div>

        {/* Header con logo Mery García */}
        <div className='relative bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] shadow-xl'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {/* Logo y navegación */}
            <div className='flex items-center justify-between mb-6'>
              <Link
                href={`/${locale}/mi-cuenta`}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <ArrowLeft className='w-6 h-6' />
              </Link>
            </div>

            {/* Logo central y FORMACIONES */}
            <div className='text-center'>
              <img
                src='/Img-home/mery-blanco-logo.png'
                alt='Mery García'
                className='h-16 mx-auto mb-4 filter brightness-0 invert'
              />
              <p className='text-lg font-light tracking-[0.15em] text-[#f9bbc4]'>
                FORMACIONES
              </p>
            </div>

            {/* Línea decorativa */}
            <div className='w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-8'></div>
          </div>
        </div>

        {/* Contenido principal - Layout centrado */}
        <div className='relative px-4 sm:px-6 lg:px-8 py-8'>
          <div className='w-full max-w-7xl mx-auto'>
            <div className='flex flex-col xl:flex-row gap-6 xl:gap-8 items-start'>
              {/* Área principal centrada */}
              <div className='flex-1 w-full xl:flex xl:justify-center'>
                <div className='w-full xl:max-w-4xl 2xl:max-w-5xl'>
                  {selectedLesson ? (
                    <div className='space-y-8'>
                      {/* Título de la lección */}
                      <div className='text-center'>
                        <h2 className='text-2xl md:text-3xl font-light tracking-wide text-white mb-2'>
                          {selectedLesson.title.toUpperCase()}
                        </h2>
                        <div className='w-24 h-px bg-gradient-to-r from-transparent via-[#f9bbc4] to-transparent mx-auto'></div>
                      </div>

                      {/* Video Player centrado */}
                      <div className='flex justify-center'>
                        <div className='w-full max-w-4xl'>
                          <VimeoPlayer
                            vimeoVideoId={selectedLesson.vimeoVideoId}
                            courseId={courseId}
                            lessonId={selectedLesson.id}
                            className='w-full shadow-2xl aspect-video'
                          />
                        </div>
                      </div>

                      {/* Información de la lección */}
                      <div className='max-w-4xl mx-auto'>
                        <div className='bg-[#2d2d2d]/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 p-6'>
                          <p className='text-gray-300 leading-relaxed text-center'>
                            {selectedLesson.description}
                          </p>

                          {selectedLesson.duration && (
                            <div className='flex items-center justify-center mt-4 pt-4 border-t border-gray-600'>
                              <Clock className='w-4 h-4 text-[#f9bbc4] mr-2' />
                              <span className='text-sm text-gray-400'>
                                Duración: {selectedLesson.duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contenido adicional de la lección */}
                      <div className='max-w-4xl mx-auto'>
                        <LessonContent lesson={selectedLesson} />
                      </div>
                    </div>
                  ) : (
                    <div className='max-w-4xl mx-auto'>
                      <div className='bg-[#2d2d2d]/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 p-12 text-center'>
                        <PlayCircle className='w-20 h-20 text-gray-500 mx-auto mb-6' />
                        <h3 className='text-xl font-light text-white mb-3'>
                          Selecciona una lección
                        </h3>
                        <p className='text-gray-400'>
                          Elige una lección de la lista para comenzar a estudiar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar del curso */}
              <div className='lg:mt-19 w-full xl:w-80 xl:flex-shrink-0'>
                <div className='xl:sticky xl:top-8'>
                  <CourseSidebar
                    course={course}
                    selectedLesson={selectedLesson}
                    onLessonSelect={handleLessonSelect}
                    isLessonCompleted={isLessonCompleted}
                    progressPercentage={progressPercentage}
                    totalLessons={totalLessons}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Footer */}
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
