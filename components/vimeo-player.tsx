'use client';

import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { useCourseStore } from '@/stores';
import { updateVideoProgress } from '@/lib/api-client';

interface VimeoPlayerProps {
  vimeoSrcUrl?: string;
  courseId: string;
  lessonId: string;
  className?: string;
  autoPlay?: boolean;
}

const PROGRESS_SYNC_INTERVAL_MS = 10_000;
const COMPLETION_THRESHOLD_PERCENT = 95;

export default function VimeoPlayer({
  vimeoSrcUrl,
  courseId,
  lessonId,
  className = '',
  autoPlay = false,
}: Readonly<VimeoPlayerProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const completed = isLessonCompleted(courseId, lessonId);

  const latestSecondsRef = useRef(0);
  const lastSentSecondsRef = useRef(-1);
  const completedSentRef = useRef(false);

  useEffect(() => {
    setIsCompleted(completed);
    latestSecondsRef.current = 0;
    lastSentSecondsRef.current = -1;
    completedSentRef.current = false;
  }, [completed, lessonId]);

  useEffect(() => {
    if (!vimeoSrcUrl || !containerRef.current) return;

    // Parseamos la URL de Vimeo tal cual, el SDK la consume directamente.
    const url = new URL(vimeoSrcUrl);
    url.searchParams.set('color', 'f9bbc4');
    url.searchParams.set('title', '0');
    url.searchParams.set('byline', '0');
    url.searchParams.set('portrait', '0');
    if (autoPlay) url.searchParams.set('autoplay', '1');

    // Limpio el contenedor antes de crear un player nuevo (cambio de lección).
    const container = containerRef.current;
    container.innerHTML = '';

    const player = new Player(container, {
      url: url.toString() as unknown as import('@vimeo/player').VimeoUrl,
      responsive: true,
      autoplay: autoPlay,
    });

    const syncProgress = async (seconds: number, markCompleted: boolean) => {
      const rounded = Math.floor(seconds);
      if (!markCompleted && rounded === lastSentSecondsRef.current) return;
      lastSentSecondsRef.current = rounded;
      try {
        await updateVideoProgress(lessonId, rounded, markCompleted);
        console.debug(
          `[VimeoPlayer] progress synced: ${rounded}s, completed=${markCompleted}`,
        );
      } catch (err) {
        console.warn('[VimeoPlayer] fallo al sincronizar progreso', err);
      }
    };

    const finalizeIfNeeded = (seconds: number) => {
      if (completedSentRef.current) return;
      completedSentRef.current = true;
      if (!isCompleted) {
        markLessonCompleted(courseId, lessonId);
        setIsCompleted(true);
      }
      void syncProgress(seconds, true);
    };

    const onTimeUpdate = (data: { seconds: number; duration: number }) => {
      latestSecondsRef.current = data.seconds;
      const progress = data.duration
        ? (data.seconds / data.duration) * 100
        : 0;
      if (progress >= COMPLETION_THRESHOLD_PERCENT) {
        finalizeIfNeeded(data.seconds);
      }
    };

    const onEnded = () => {
      finalizeIfNeeded(latestSecondsRef.current);
    };

    player.on('timeupdate', onTimeUpdate);
    player.on('ended', onEnded);

    const intervalId = globalThis.setInterval(() => {
      if (completedSentRef.current) return;
      if (latestSecondsRef.current <= 0) return;
      void syncProgress(latestSecondsRef.current, false);
    }, PROGRESS_SYNC_INTERVAL_MS);

    return () => {
      globalThis.clearInterval(intervalId);
      player.off('timeupdate', onTimeUpdate);
      player.off('ended', onEnded);

      // flush final si corresponde
      if (
        !completedSentRef.current &&
        latestSecondsRef.current > 0 &&
        Math.floor(latestSecondsRef.current) !== lastSentSecondsRef.current
      ) {
        void syncProgress(latestSecondsRef.current, false);
      }

      player.destroy().catch(() => {
        /* destroy errors are harmless here */
      });
    };
    // isCompleted no se incluye para evitar recrear el player al marcarlo completado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoSrcUrl, lessonId, courseId, autoPlay]);

  if (!vimeoSrcUrl) {
    return (
      <div className={`relative ${className}`}>
        <div
          className='relative w-full'
          style={{ paddingBottom: '56.25%' }}
        >
          <div className='absolute top-0 left-0 w-full h-full bg-gray-900 rounded-lg flex items-center justify-center border-2 border-red-500'>
            <div className='text-center p-8'>
              <div className='text-6xl mb-4'>⚠️</div>
              <h3 className='text-xl font-bold text-white'>
                Video no disponible
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className='relative w-full rounded-lg overflow-hidden'
        style={{ paddingBottom: '56.25%' }}
      />
      {isCompleted && (
        <div className='mt-3 p-2 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-sm text-green-700 font-medium text-center'>
            Lección completada
          </p>
        </div>
      )}
    </div>
  );
}
