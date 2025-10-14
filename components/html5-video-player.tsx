'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useCourseStore } from '@/stores';

interface HTML5VideoPlayerProps {
  vimeoVideoId: string;
  courseId: string;
  lessonId: string;
  className?: string;
  autoPlay?: boolean;
}

export default function HTML5VideoPlayer({
  vimeoVideoId,
  courseId,
  lessonId,
  className = '',
  autoPlay = false,
}: HTML5VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { markLessonCompleted, isLessonCompleted } = useCourseStore();
  const isCompleted = isLessonCompleted(courseId, lessonId);

  // URLs de videos de ejemplo (simulando contenido real)
  const videoSources = {
    dQw4w9WgXcQ: '/emilia-formaciones.mp4', // Lección 1: Introducción
    '826655207':
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Lección 2: Técnicas
    '869659871':
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Lección 3: Anatomía
    '898120707':
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', // Lección 4: Nanoblading
    default:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  };

  const videoSrc =
    videoSources[vimeoVideoId as keyof typeof videoSources] ||
    videoSources.default;

  // Efecto para reiniciar el video cuando cambia la lección
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reiniciar video al cambiar de lección
    video.currentTime = 0;
    video.load(); // Forzar recarga del video
    setProgress(0);
    setCurrentTime(0);
    setPlaying(false);
  }, [vimeoVideoId]); // Se ejecuta cuando cambia el ID del video

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);

      // Marcar como completado al 90%
      if (progress > 90 && !isCompleted) {
        markLessonCompleted(courseId, lessonId);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [courseId, lessonId, isCompleted, markLessonCompleted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * video.duration;

    video.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${className}`}
    >
      {/* Video Element */}
      <div className='relative aspect-video'>
        <video
          ref={videoRef}
          src={videoSrc}
          className='w-full h-full object-cover'
          autoPlay={autoPlay}
          muted={muted}
          onError={(e) => {
            console.error('Video Error:', e);
          }}
          onLoadStart={() => {
            console.log('Video load started');
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
        />

        {/* Indicador de completado COMENTADO BY JULY*/}
        {/* {isCompleted && (
          <div className="absolute top-4 right-4 success-bg text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Completado</span>
          </div>
        )} */}
      </div>

      {/* Controles personalizados con diseño oscuro */}
      <div className='bg-[#1a1a1a] border-t border-gray-700 text-white p-4'>
        {/* Barra de progreso */}
        <div
          className='mb-4 cursor-pointer'
          onClick={handleProgressClick}
        >
          <div className='w-full bg-gray-700 rounded-full h-2'>
            <div
              className='bg-[#f9bbc4] h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controles */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className='flex items-center justify-center w-10 h-10 bg-[#f9bbc4] hover:bg-[#eba2a8] rounded-full transition-colors shadow-lg'
            >
              {playing ? (
                <Pause className='w-5 h-5 text-white' />
              ) : (
                <Play className='w-5 h-5 text-white ml-0.5' />
              )}
            </button>

            {/* Volumen */}
            <div className='flex items-center space-x-2'>
              <button
                onClick={toggleMute}
                className='text-gray-300 hover:text-white transition-colors'
              >
                {muted || volume === 0 ? (
                  <VolumeX className='w-5 h-5' />
                ) : (
                  <Volume2 className='w-5 h-5' />
                )}
              </button>
              <input
                type='range'
                min={0}
                max={1}
                step={0.1}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className='w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer'
              />
            </div>

            {/* Tiempo */}
            <span className='text-sm text-gray-300'>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Progreso porcentual COMENTADO BY JULY */}
          {/* <span className='text-[#f9bbc4] text-sm font-medium'>
            {Math.round(progress)}%
          </span> */}
        </div>
      </div>
    </div>
  );
}
