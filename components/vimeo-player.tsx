'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCourseStore } from '@/stores';

interface VimeoPlayerProps {
  vimeoSrcUrl?: string;
  courseId: string;
  lessonId: string;
  className?: string;
  autoPlay?: boolean;
}

export default function VimeoPlayer({
  vimeoSrcUrl,
  courseId,
  lessonId,
  className = '',
  autoPlay = false,
}: VimeoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const completed = isLessonCompleted(courseId, lessonId);

  // Reset completion state when lesson changes
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

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
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vimeo.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'timeupdate' && data.data) {
          const { seconds, duration } = data.data;
          const progress = (seconds / duration) * 100;
          if (progress > 90 && !isCompleted) {
            markLessonCompleted(courseId, lessonId);
            setIsCompleted(true);
          }
        }
        if (data.event === 'ended' && !isCompleted) {
          markLessonCompleted(courseId, lessonId);
          setIsCompleted(true);
        }
      } catch {
        // Ignore message parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: 'addEventListener', value: 'ended' }),
        '*'
      );
    }

    return () => window.removeEventListener('message', handleMessage);
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
