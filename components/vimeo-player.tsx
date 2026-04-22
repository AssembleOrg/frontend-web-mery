'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const completed = isLessonCompleted(courseId, lessonId);

  // Refs para sincronizar progreso con el backend
  const latestSecondsRef = useRef(0);
  const lastSentSecondsRef = useRef(-1);
  const completedSentRef = useRef(false);

  // Reset completion state when lesson changes
  useEffect(() => {
    setIsCompleted(completed);
    latestSecondsRef.current = 0;
    lastSentSecondsRef.current = -1;
    completedSentRef.current = false;
  }, [completed, lessonId]);

  // Force iframe reload when vimeoSrcUrl changes
  useEffect(() => {
    if (vimeoSrcUrl) {
      setIframeKey((prev) => prev + 1);
    }
  }, [vimeoSrcUrl, lessonId]);

  let finalIframeSrc = '';
  if (vimeoSrcUrl) {
    const url = new URL(vimeoSrcUrl);
    if (autoPlay) url.searchParams.set('autoplay', '1');
    url.searchParams.set('color', 'f9bbc4');
    url.searchParams.set('title', '0');
    url.searchParams.set('byline', '0');
    url.searchParams.set('portrait', '0');
    finalIframeSrc = url.toString();
  }

  useEffect(() => {
    const registerListeners = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      ['timeupdate', 'ended', 'play', 'pause'].forEach((name) => {
        // Vimeo oficialmente recomienda '*' como targetOrigin porque su player
        // se sirve desde múltiples dominios (player.vimeo.com, f.vimeocdn.com, etc.).
        // Solo enviamos comandos de control, sin datos sensibles. NOSONAR
        win.postMessage(
          JSON.stringify({ method: 'addEventListener', value: name }),
          '*' // NOSONAR
        );
      });
    };

    const syncProgress = async (seconds: number, markCompleted: boolean) => {
      const rounded = Math.floor(seconds);
      if (!markCompleted && rounded === lastSentSecondsRef.current) return;
      lastSentSecondsRef.current = rounded;
      try {
        await updateVideoProgress(lessonId, rounded, markCompleted);
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

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vimeo.com')) return;
      let data: {
        event?: string;
        method?: string;
        data?: { seconds?: number; duration?: number };
      };
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      // 1) Respuesta al "ping" inicial o evento ready → registramos listeners
      if (data.event === 'ready' || data.method === 'ping') {
        registerListeners();
        return;
      }
      if (data.event === 'timeupdate' && data.data) {
        const { seconds = 0, duration = 0 } = data.data;
        latestSecondsRef.current = seconds;
        const progress = duration ? (seconds / duration) * 100 : 0;
        if (progress >= COMPLETION_THRESHOLD_PERCENT) finalizeIfNeeded(seconds);
      } else if (data.event === 'ended') {
        finalizeIfNeeded(latestSecondsRef.current);
      }
    };

    globalThis.addEventListener('message', handleMessage);

    // Intento inmediato + un ping por las dudas para forzar a Vimeo a respondernos
    registerListeners();
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ method: 'ping' }),
      '*' // NOSONAR
    );

    // Además, cuando el iframe termina de cargar, reintentamos (evita race)
    const iframeEl = iframeRef.current;
    const onIframeLoad = () => registerListeners();
    iframeEl?.addEventListener('load', onIframeLoad);

    // Throttle: cada 10s mandamos el watchedSeconds actual al backend
    const intervalId = globalThis.setInterval(() => {
      if (completedSentRef.current) return;
      if (latestSecondsRef.current <= 0) return;
      void syncProgress(latestSecondsRef.current, false);
    }, PROGRESS_SYNC_INTERVAL_MS);

    return () => {
      globalThis.removeEventListener('message', handleMessage);
      globalThis.clearInterval(intervalId);
      iframeEl?.removeEventListener('load', onIframeLoad);
      if (
        !completedSentRef.current &&
        latestSecondsRef.current > 0 &&
        Math.floor(latestSecondsRef.current) !== lastSentSecondsRef.current
      ) {
        void syncProgress(latestSecondsRef.current, false);
      }
    };
  }, [courseId, lessonId, isCompleted, markLessonCompleted]);

  if (!finalIframeSrc) {
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
        className='relative w-full'
        style={{ paddingBottom: '56.25%' }}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={finalIframeSrc}
          title={`Video lección ${lessonId}`}
          className='absolute top-0 left-0 w-full h-full rounded-lg'
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
        />
      </div>
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
