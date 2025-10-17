'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { Course, Lesson } from '@/types/course';
import { getCourseDetails } from '@/lib/api-client';
import { useCourseStore } from '@/stores';
import HTML5VideoPlayer from '@/components/html5-video-player';

export default function CursoDetallePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Get Category from backend
        const categoryData = await getCourseDetails(courseId);

        // Convert Category to Course format
        const courseData: Course = {
          id: categoryData.id,
          slug: categoryData.slug,
          title: categoryData.name,
          description: categoryData.description || '',
          image: categoryData.image || '',
          priceARS: categoryData.priceARS || 0,
          priceUSD: categoryData.priceUSD || 0,
          isFree: categoryData.isFree || false,
          price: categoryData.priceUSD || categoryData.priceARS || 0,
          priceDisplay: categoryData.priceUSD
            ? `U$S ${categoryData.priceUSD}`
            : `$ ${categoryData.priceARS} ARS`,
          currency: categoryData.priceUSD > 0 ? 'USD' : 'ARS',
          isPublished: categoryData.isActive,
          createdAt: new Date(categoryData.createdAt),
          updatedAt: new Date(categoryData.updatedAt),
          lessons: [], // Videos will be loaded separately if needed
        };

        setCourse(courseData);
        setCurrentCourse(courseData);

        // Seleccionar la primera lección por defecto
        if (courseData.lessons && courseData.lessons.length > 0) {
          const firstLesson = courseData.lessons[0];
          setSelectedLesson(firstLesson);
          setCurrentLesson(firstLesson);
        }
      } catch (_err) {
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId, setCurrentCourse, setCurrentLesson]);

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
            href='/mi-cuenta'
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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='bg-white dark:bg-gray-800 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/mi-cuenta'
                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                <ArrowLeft className='w-6 h-6' />
              </Link>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {course.title}
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  {completedLessons} de {totalLessons} lecciones completadas
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className='flex items-center space-x-4'>
              <div className='w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-pink-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Lista de lecciones */}
          <div className='lg:col-span-1'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Contenido del Curso
              </h2>

              <div className='space-y-2'>
                {course.lessons?.map((lesson, index) => {
                  const isCompleted = isLessonCompleted(courseId, lesson.id);
                  const isSelected = selectedLesson?.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0 mt-1'>
                          {isCompleted ? (
                            <CheckCircle2 className='w-5 h-5 success-color' />
                          ) : (
                            <PlayCircle className='w-5 h-5 text-gray-400' />
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>
                            {index + 1}. {lesson.title}
                          </p>
                          {lesson.duration && (
                            <div className='flex items-center mt-1'>
                              <Clock className='w-3 h-3 text-gray-400 mr-1' />
                              <span className='text-xs text-gray-500 dark:text-gray-400'>
                                {lesson.duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className='lg:col-span-3'>
            {selectedLesson ? (
              <div className='space-y-6'>
                {/* Video Player */}
                <HTML5VideoPlayer
                  vimeoVideoId={selectedLesson.vimeoVideoId}
                  courseId={courseId}
                  lessonId={selectedLesson.id}
                  className='w-full'
                />

                {/* Información de la lección */}
                <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
                  <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                    {selectedLesson.title}
                  </h2>

                  <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
                    {selectedLesson.description}
                  </p>

                  {selectedLesson.duration && (
                    <div className='flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                      <Clock className='w-4 h-4 text-gray-400 mr-2' />
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Duración: {selectedLesson.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center'>
                <PlayCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  Selecciona una lección
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Elige una lección de la lista para comenzar a estudiar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
