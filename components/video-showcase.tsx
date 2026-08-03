'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Volume2 } from 'lucide-react';

interface VideoShowcaseProps {
  vimeoId: string;
  title: string;
  durationLabel?: string;
  playLabel?: string;
  className?: string;
}

export function VideoShowcase({
  vimeoId,
  title,
  durationLabel = '30 seg',
  playLabel = 'Reproducir video',
  className = '',
}: VideoShowcaseProps) {
  const [playing, setPlaying] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!vimeoId) return null;

  const posterUrl = `https://vumbnail.com/${vimeoId}.jpg`;
  const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&color=f9bbc4&dnt=1`;

  return (
    <div ref={containerRef} className={`relative group ${className}`}>
      <div
        aria-hidden
        className="absolute -inset-6 md:-inset-10 bg-gradient-to-br from-[#EBA2A8]/25 via-[#F7CBCB]/15 to-transparent rounded-[2.5rem] blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700"
      />

      <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-[#EBA2A8]/30 shadow-[0_30px_80px_-20px_rgba(235,162,168,0.45)] bg-[#2B2B2B]">
        <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 group/poster cursor-pointer"
              aria-label={playLabel}
            >
              {shouldLoad && !posterError ? (
                <img
                  src={posterUrl}
                  alt=""
                  loading="lazy"
                  onError={() => setPosterError(true)}
                  className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover/poster:scale-100 transition-transform duration-[1200ms] ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3a2426] via-[#2B2B2B] to-[#1a1a1a] flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#EBA2A8]/20 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-[#EBA2A8]" />
                    </div>
                    <p className="text-xs text-white/50 font-secondary tracking-wide">
                      {title}
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 -m-6 rounded-full bg-[#EBA2A8]/30 blur-2xl group-hover/poster:bg-[#EBA2A8]/50 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/40 scale-100 group-hover/poster:scale-125 group-hover/poster:opacity-0 transition-all duration-700" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover/poster:scale-105 transition-transform duration-500">
                    <Play
                      className="w-7 h-7 md:w-9 md:h-9 text-[#EBA2A8] fill-[#EBA2A8] ml-1"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-left">
                <p className="text-white/70 text-[10px] md:text-xs font-primary tracking-[0.3em] uppercase mb-1.5">
                  {playLabel}
                </p>
                <p className="text-white text-base md:text-lg font-primary font-medium leading-tight line-clamp-2">
                  {title}
                </p>
              </div>
            </button>
          ) : (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title={title}
            />
          )}
        </div>
      </div>

      <div
        aria-hidden
        className="hidden md:block absolute -top-3 -right-3 w-12 h-12 rounded-full border border-[#EBA2A8]/40"
      />
      <div
        aria-hidden
        className="hidden md:block absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#FBE8EA] to-[#F7CBCB] opacity-60 blur-sm"
      />
    </div>
  );
}
