'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCourseStore } from '@/stores';

interface VimeoPlayerProps {
  vimeoVideoId: string;
  courseId: string;
  lessonId: string;
  className?: string;
  autoPlay?: boolean;
}

/**
 * Vimeo Player Component
 *
 * CURRENT: Uses Vimeo iframe embed (works immediately, no package install needed)
 *
 * ALTERNATIVE (Recommended for production):
 * 1. Install: npm install @vimeo/player
 * 2. Uncomment the @vimeo/player implementation below
 * 3. Comment out the iframe implementation
 *
 * Benefits of @vimeo/player:
 * - Better API control
 * - More events (progress, quality change, etc.)
 * - TypeScript support
 */
export default function VimeoPlayer({
  vimeoVideoId,
  courseId,
  lessonId,
  className = '',
  autoPlay = false,
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const completed = isLessonCompleted(courseId, lessonId);

  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  // Track video progress via postMessage API
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Vimeo
      if (!event.origin.includes('vimeo.com')) return;

      try {
        const data = JSON.parse(event.data);

        // Mark as completed when video reaches 90%
        if (data.event === 'timeupdate' && data.data) {
          const { seconds, duration } = data.data;
          const progress = (seconds / duration) * 100;

          if (progress > 90 && !isCompleted) {
            markLessonCompleted(courseId, lessonId);
            setIsCompleted(true);
          }
        }

        // Also mark complete when video ends
        if (data.event === 'ended' && !isCompleted) {
          markLessonCompleted(courseId, lessonId);
          setIsCompleted(true);
        }
      } catch (err) {
        // Ignore parsing errors from non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);

    // Enable time updates from Vimeo iframe
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

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [courseId, lessonId, isCompleted, markLessonCompleted]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Vimeo Iframe Embed */}
      <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=${autoPlay ? 1 : 0}&color=f9bbc4&title=0&byline=0&portrait=0`}
          className='absolute top-0 left-0 w-full h-full rounded-lg'
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
        />
      </div>

      {/* Completion indicator */}
      {isCompleted && (
        <div className='mt-3 p-2 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-sm text-green-700 font-medium'>Lección completada</p>
        </div>
      )}
    </div>
  );
}

/**
 * ALTERNATIVE IMPLEMENTATION WITH @vimeo/player
 *
 * Uncomment this when @vimeo/player is installed:
 *
 * import Player from '@vimeo/player';
 *
 * export default function VimeoPlayer({ ... }) {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const playerRef = useRef<Player | null>(null);
 *
 *   useEffect(() => {
 *     if (!containerRef.current) return;
 *
 *     // Initialize Vimeo player
 *     const player = new Player(containerRef.current, {
 *       id: parseInt(vimeoVideoId),
 *       autoplay: autoPlay,
 *       color: 'f9bbc4',
 *       responsive: true,
 *     });
 *
 *     playerRef.current = player;
 *
 *     // Track progress
 *     player.on('timeupdate', (data) => {
 *       const progress = (data.seconds / data.duration) * 100;
 *       if (progress > 90 && !isCompleted) {
 *         markLessonCompleted(courseId, lessonId);
 *       }
 *     });
 *
 *     // Handle video end
 *     player.on('ended', () => {
 *       if (!isCompleted) {
 *         markLessonCompleted(courseId, lessonId);
 *       }
 *     });
 *
 *     return () => {
 *       player.destroy();
 *     };
 *   }, [vimeoVideoId, courseId, lessonId]);
 *
 *   return (
 *     <div ref={containerRef} className={className} />
 *   );
 * }
 */
