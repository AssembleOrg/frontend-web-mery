'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Course, Lesson } from '@/types/course';
import {
  getCourseDetails,
  getCourseVideos,
  getVideoStreamUrl,
} from '@/lib/api-client';
import { useCourseStore } from '@/stores';
import { useAuth } from '@/hooks/useAuth';
import { getUserCourses as getUserCoursesService } from '@/services/user-courses.service';
import VimeoPlayer from '@/components/vimeo-player';
import LessonContent from '@/components/lesson-content';
import CourseSidebar from '@/components/course-sidebar';
import { CursoPlayerSkeleton } from '@/components/cursos/CursoPlayerSkeleton';
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

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Race condition prevention: AbortController para cancelar requests
  const loadCourseAbortController = useRef<AbortController | null>(null);
  const lessonSelectAbortController = useRef<AbortController | null>(null);

  const { user, token } = useAuth();
  const {
    setCurrentCourse,
    setCurrentLesson,
    isLessonCompleted,
    getUserCourseProgress,
  } = useCourseStore();

  const courseProgress = getUserCourseProgress(courseId);
  const handleLessonSelect = useCallback(
    async (lesson: Lesson) => {
      console.log(
        '[CursoPage] Seleccionando lección:',
        lesson.title,
        'ID:',
        lesson.id
      );

      // Cancelar request anterior si existe
      if (lessonSelectAbortController.current) {
        console.log('[CursoPage] Cancelando request anterior de lección');
        lessonSelectAbortController.current.abort();
      }

      // Crear nuevo AbortController para este request
      const abortController = new AbortController();
      lessonSelectAbortController.current = abortController;

      setSelectedLesson(lesson);
      setCurrentLesson(lesson);

      // Solo intentamos cargar el video si hay token (usuario autenticado)
      if (!token) {
        console.warn('[CursoPage] No hay token, no se puede cargar el video');
        return;
      }

      setIsVideoLoading(true);
      setStreamUrl(null);

      try {
        console.log(
          '[CursoPage] Solicitando stream URL para video:',
          lesson.id
        );
        // Llamamos al endpoint que nos da la URL segura de Vimeo
        const response = await getVideoStreamUrl(lesson.id);

        // Solo actualizar estado si el request no fue abortado
        if (!abortController.signal.aborted) {
          console.log(
            '[CursoPage] Stream URL recibida:',
            response.data.streamUrl
          );
          setStreamUrl(response.data.streamUrl);
        } else {
          console.log('[CursoPage] Request abortado, ignorando respuesta');
        }
      } catch (error) {
        // Solo mostrar error si el request no fue abortado
        if (!abortController.signal.aborted) {
          console.error('[CursoPage] Error al obtener stream URL:', error);
          toast.error(
            'No se pudo cargar el video. Por favor intenta de nuevo.'
          );
          setStreamUrl(null);
        }
      } finally {
        // Solo limpiar estado si el request no fue abortado
        if (!abortController.signal.aborted) {
          setIsVideoLoading(false);
        }
      }
    },
    [setCurrentLesson, token]
  );

  const loadCourse = useCallback(async () => {
    if (!user || !token) {
      return;
    }

    // Cancelar request anterior si existe
    if (loadCourseAbortController.current) {
      console.log('[CursoPage] Cancelando carga anterior del curso');
      loadCourseAbortController.current.abort();
    }

    // Crear nuevo AbortController para este request
    const abortController = new AbortController();
    loadCourseAbortController.current = abortController;

    console.log('[CursoPage] Iniciando carga del curso:', courseId);

    try {
      // 1. Cargar detalles del curso
      const categoryData = await getCourseDetails(courseId);

      // Si el request fue abortado, salir temprano
      if (abortController.signal.aborted) {
        console.log('[CursoPage] Carga de curso abortada');
        return;
      }

      // 2. Lógica de bypass para ADMIN
      const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';
      let hasAccess = isAdmin;
      if (!isAdmin) {
        const userCourses = await getUserCoursesService(token);
        hasAccess = userCourses.some((uc) => uc.courseId === courseId);
      }

      if (!hasAccess) {
        if (!abortController.signal.aborted) {
          setError('No tienes acceso a este curso.');
          setLoading(false);
        }
        return;
      }

      // 3. Cargar los videos (lecciones)
      const videosData = await getCourseVideos(courseId);

      // Si el request fue abortado, salir temprano
      if (abortController.signal.aborted) {
        console.log('[CursoPage] Carga de curso abortada');
        return;
      }

      // Nota: Como vimos, videosData no trae vimeoId, pero eso ya no importa
      // porque usaremos handleLessonSelect para obtener la URL de streaming.
      const lessons: Lesson[] = videosData.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        vimeoVideoId: '', // Ya no es crítico tenerlo aquí
        duration: video.duration
          ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s`
          : 'N/A',
        order: video.order || 0,
        isPublished: video.isPublished,
      }));

      // 4. Construir el objeto del curso
      const courseData: Course = {
        id: categoryData.id,
        slug: categoryData.slug,
        title: categoryData.name,
        description: categoryData.description || '',
        image: categoryData.image || '',
        priceARS: categoryData.priceARS || 0,
        priceUSD: categoryData.priceUSD || 0,
        isFree: categoryData.isFree || false,
        price: 0,
        priceDisplay: '',
        currency: 'ARS',
        isPublished: categoryData.isActive,
        createdAt: new Date(categoryData.createdAt),
        updatedAt: new Date(categoryData.updatedAt),
        lessons: lessons,
      };

      // Solo actualizar estado si el request no fue abortado
      if (!abortController.signal.aborted) {
        setCourse(courseData);
        setCurrentCourse(courseData);

        console.log(
          '[CursoPage] Curso cargado exitosamente, total de lecciones:',
          lessons.length
        );

        // Selección inicial
        if (lessons.length > 0) {
          handleLessonSelect(lessons[0]);
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError('Error al cargar el curso');
        console.error('[CursoPage] Error loading course:', err);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [courseId, user, token, setCurrentCourse, handleLessonSelect]);

  // 👈 CORRECCIÓN 4: El useEffect es muy simple
  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [loadCourse, courseId]);

  // --- Renderizado ---

  if (loading) {
    return <CursoPlayerSkeleton />;
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
      <div className='min-h-screen bg-background font-admin'>
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <div className='bg-[#1a1a1a] relative overflow-hidden'>
          {/* Background SVG */}
          <div className='absolute inset-0 opacity-10 pointer-events-none'>
            <Image
              src='/browes.svg'
              alt='Background decoration'
              fill
              className='object-cover object-center'
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
                <Image
                  src='/Img-home/mery-blanco-logo.png'
                  alt='Mery García'
                  width={500}
                  height={120}
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
                            {isVideoLoading ? (
                              <div className='aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700'>
                                <Loader2 className='w-12 h-12 text-[#f9bbc4] animate-spin' />
                              </div>
                            ) : streamUrl ? (
                              // Importante: Pasamos streamUrl como una nueva prop a VimeoPlayer
                              <VimeoPlayer
                                vimeoSrcUrl={streamUrl}
                                courseId={courseId}
                                lessonId={selectedLesson.id}
                                className='w-full shadow-2xl aspect-video'
                              />
                            ) : (
                              <div className='aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-red-500 p-8 text-center'>
                                <div>
                                  <div className='text-4xl mb-2'>⚠️</div>
                                  <h3 className='text-lg font-bold text-white'>
                                    Video no disponible
                                  </h3>
                                </div>
                              </div>
                            )}
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
                          <LessonContent
                            lesson={selectedLesson}
                            courseId={courseId}
                          />
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
                            Elige una lección de la lista para comenzar a
                            estudiar
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
