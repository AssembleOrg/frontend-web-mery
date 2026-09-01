'use client';

import React, { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { useCourseStore } from '@/stores';
import { getVideoProgress, updateVideoProgress } from '@/lib/api-client';

interface VimeoPlayerProps {
  vimeoSrcUrl?: string;
  courseId: string;
  lessonId: string;
  className?: string;
  autoPlay?: boolean;
}

const PROGRESS_SYNC_INTERVAL_MS = 10_000;
const COMPLETION_THRESHOLD_PERCENT = 95;
// No hacemos seek si el usuario vio menos de esto (arranca de cero igual).
const MIN_RESUME_SECONDS = 5;

function buildEmbedUrl(vimeoSrcUrl: string, autoPlay: boolean): string {
  const url = new URL(vimeoSrcUrl);
  url.searchParams.set('color', 'f9bbc4');
  url.searchParams.set('title', '0');
  url.searchParams.set('byline', '0');
  url.searchParams.set('portrait', '0');
  url.searchParams.set('dnt', '1');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('pip', '1');
  url.searchParams.set('speed', '1');
  if (autoPlay) url.searchParams.set('autoplay', '1');
  return url.toString();
}

export default function VimeoPlayer({
  vimeoSrcUrl,
  courseId,
  lessonId,
  className = '',
  autoPlay = false,
}: Readonly<VimeoPlayerProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const completed = isLessonCompleted(courseId, lessonId);

  const latestSecondsRef = useRef(0);
  const lastSentSecondsRef = useRef(-1);
  const completedSentRef = useRef(false);
  // Los handlers del player se registran una sola vez: leen la lección actual de acá.
  const lessonRef = useRef({ courseId, lessonId, isCompleted: completed });

  useEffect(() => {
    setIsCompleted(completed);
    setPlayerError(null);
    latestSecondsRef.current = 0;
    lastSentSecondsRef.current = -1;
    completedSentRef.current = false;
    lessonRef.current = { courseId, lessonId, isCompleted: completed };
  }, [completed, lessonId, courseId]);

  useEffect(() => {
    if (!vimeoSrcUrl || !containerRef.current) return;

    const embedUrl = buildEmbedUrl(vimeoSrcUrl, autoPlay);

    const syncProgress = async (seconds: number, markCompleted: boolean) => {
      const rounded = Math.floor(seconds);
      if (!markCompleted && rounded === lastSentSecondsRef.current) return;
      lastSentSecondsRef.current = rounded;
      try {
        await updateVideoProgress(
          lessonRef.current.lessonId,
          rounded,
          markCompleted,
        );
      } catch (err) {
        console.warn('[VimeoPlayer] fallo al sincronizar progreso', err);
      }
    };

    const finalizeIfNeeded = (seconds: number) => {
      if (completedSentRef.current) return;
      completedSentRef.current = true;
      if (!lessonRef.current.isCompleted) {
        markLessonCompleted(lessonRef.current.courseId, lessonRef.current.lessonId);
        lessonRef.current.isCompleted = true;
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

    const onPause = () => {
      // Sync inmediato al pausar: no dependemos del interval de 10s.
      if (latestSecondsRef.current > 0 && !completedSentRef.current) {
        void syncProgress(latestSecondsRef.current, false);
      }
    };

    const onError = (err: { name?: string; message?: string }) => {
      console.warn('[VimeoPlayer] error del player', err);
      setPlayerError(
        err?.name === 'PrivacyError'
          ? 'Este video no está disponible por configuración de privacidad.'
          : 'No pudimos cargar el video. Probá recargar la página.',
      );
    };

    const resumeFromSavedProgress = async (player: Player) => {
      try {
        const res = await getVideoProgress(lessonRef.current.lessonId);
        const saved = res.data;
        if (!saved || saved.completed) return;
        const duration = await player.getDuration();
        const target = saved.watchedSeconds;
        // Solo retomamos si hay progreso real y no está sobre el final.
        if (
          target >= MIN_RESUME_SECONDS &&
          duration > 0 &&
          target < duration * (COMPLETION_THRESHOLD_PERCENT / 100)
        ) {
          await player.setCurrentTime(target);
        }
      } catch {
        // Sin progreso guardado o falla de red: arranca desde cero, no es error.
      }
    };

    let player = playerRef.current;

    if (player) {
      // Cambio de lección: reutilizamos el player en vez de destruir/recrear.
      setPlayerError(null);
      player
        .loadVideo(embedUrl as import('@vimeo/player').VimeoUrl)
        .then(() => resumeFromSavedProgress(player!))
        .catch((err: unknown) => onError(err as { name?: string }));
    } else {
      const container = containerRef.current;
      container.innerHTML = '';
      player = new Player(container, {
        url: embedUrl as unknown as import('@vimeo/player').VimeoUrl,
        responsive: true,
        autoplay: autoPlay,
        dnt: true,
        playsinline: true,
        pip: true,
        speed: true,
      });
      playerRef.current = player;
      player
        .ready()
        .then(() => resumeFromSavedProgress(player!))
        .catch((err: unknown) => onError(err as { name?: string }));
    }

    player.on('timeupdate', onTimeUpdate);
    player.on('ended', onEnded);
    player.on('pause', onPause);
    player.on('error', onError);

    // Si el usuario cierra o cambia de pestaña, guardamos lo último visto.
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        latestSecondsRef.current > 0 &&
        !completedSentRef.current
      ) {
        void syncProgress(latestSecondsRef.current, false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = globalThis.setInterval(() => {
      if (completedSentRef.current) return;
      if (latestSecondsRef.current <= 0) return;
      void syncProgress(latestSecondsRef.current, false);
    }, PROGRESS_SYNC_INTERVAL_MS);

    return () => {
      globalThis.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      player!.off('timeupdate', onTimeUpdate);
      player!.off('ended', onEnded);
      player!.off('pause', onPause);
      player!.off('error', onError);

      // flush final si corresponde
      if (
        !completedSentRef.current &&
        latestSecondsRef.current > 0 &&
        Math.floor(latestSecondsRef.current) !== lastSentSecondsRef.current
      ) {
        void syncProgress(latestSecondsRef.current, false);
      }
    };
    // markLessonCompleted es estable (zustand); lo demás va vía lessonRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoSrcUrl, lessonId, courseId, autoPlay]);

  // Destruimos el player solo al desmontar el componente.
  useEffect(() => {
    return () => {
      playerRef.current?.destroy().catch(() => {
        /* destroy errors are harmless here */
      });
      playerRef.current = null;
    };
  }, []);

  if (!vimeoSrcUrl || playerError) {
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
                {playerError ?? 'Video no disponible'}
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
