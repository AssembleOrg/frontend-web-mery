'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FaInstagram } from 'react-icons/fa';

interface Service {
  key: string;
  href: string;
  image: string;
  hoverImage?: string;
}

interface ExpandableServiceGalleryProps {
  services: Service[];
}

export function ExpandableServiceGallery({
  services,
}: ExpandableServiceGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations('home');

  const getServiceDescription = (serviceKey: string): string => {
    const staffMGServices = ['eyebrowStyling'];
    
    if (serviceKey === 'autostyling') {
      return 'Una formación para que aprendas a realizarte los servicios de estilismo de cejas que AMAS de la mano de MG & Staff ✨';
    }
    
    return staffMGServices.includes(serviceKey)
      ? 'Tratamiento profesional by Staff MG'
      : 'Cosmetic Tattoo by Mery Garcia';
  };

  const beforeAfterUrls: Record<string, string> = {
    eyebrowStyling:
      'https://www.instagram.com/stories/highlights/17904023200243157/',
    nanoblading:
      'https://www.instagram.com/stories/highlights/18023006104657516/',
    // scalp: 'https://www.instagram.com/p/CuFL7T6ra3f/', //Sin historyss yet
    freckles: 'https://www.instagram.com/p/C5ot3blPU5r/',
    nanoscalp:
      'https://www.instagram.com/stories/highlights/17879544007940692/',
    lashesLine:
      'https://www.instagram.com/stories/highlights/18019224445291012/',
    lipBlush: 'https://www.instagram.com/reel/CwX7F8nAOlJ/',
    paramedical: 'https://www.instagram.com/p/DLGOqHnype1/?img_index=1',
  };

  // Detect mobile/touch devices
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Mobile/Tablet view - Grid layout
  if (isMobile) {
    return (
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {services.map((service) => (
            <div
              key={service.key}
              className='group relative overflow-hidden rounded-lg bg-card shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/30 h-64 sm:h-72'
            >
              {}
              <Link href={service.href as any}>
                {/* Image Container */}
                <div className='relative h-full bg-muted overflow-hidden'>
                  {service.hoverImage ? (
                    <>
                      <Image
                        src={service.image}
                        alt={t(`services.${service.key}`)}
                        fill
                        className='object-cover transition-opacity duration-300 group-hover:opacity-0'
                      />
                      <Image
                        src={service.hoverImage}
                        alt={t(`services.${service.key}`)}
                        fill
                        className='object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100'
                      />
                    </>
                  ) : (
                    <Image
                      src={service.image}
                      alt={t(`services.${service.key}`)}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  )}

                  {/* Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

                  {/* Content */}
                  <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                    <h3 className='text-lg font-primary font-semibold mb-2 text-white break-words'>
                      {t(`services.${service.key}`)}
                    </h3>
                    <p className='text-sm font-secondary text-white/90 mb-3 break-words'>
                      {getServiceDescription(service.key)}
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='bg-white/20 border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-sm'
                      >
                        Ver más
                      </Button>
                      {beforeAfterUrls[service.key] && (
                        <Button
                          size='sm'
                          className={`backdrop-blur-sm flex items-center gap-1 ${
                            beforeAfterUrls[service.key]
                              ? 'bg-[#eba2a8] border-[#eba2a8] text-white hover:bg-[#f9bbc4] hover:border-[#f9bbc4]'
                              : 'bg-gray-400 border-gray-400 text-white/50 cursor-not-allowed'
                          }`}
                          disabled={!beforeAfterUrls[service.key]}
                          onClick={(e) => {
                            e.preventDefault();
                            if (beforeAfterUrls[service.key]) {
                              window.open(
                                beforeAfterUrls[service.key],
                                '_blank'
                              );
                            }
                          }}
                        >
                          <FaInstagram className='w-4 h-4' />
                          Before & After
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop view - Expandable horizontal layout
  return (
    <div className='w-full max-w-7xl mx-auto'>
      <div className='flex h-96 gap-2 overflow-hidden rounded-xl'>
        {services.map((service, index) => {
          const isHovered = hoveredIndex === index;
          const isOtherHovered =
            hoveredIndex !== null && hoveredIndex !== index;

          return (
            <div
              key={service.key}
              className={`
                relative group cursor-pointer overflow-hidden rounded-lg
                transition-all duration-500 ease-out
                ${
                  isHovered
                    ? 'flex-[3] md:flex-[4]'
                    : isOtherHovered
                    ? 'flex-[0.5]'
                    : 'flex-1'
                }
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background Image */}
              <div className='absolute inset-0'>
                {service.hoverImage ? (
                  <>
                    <Image
                      src={service.image}
                      alt={t(`services.${service.key}`)}
                      fill
                      className={`
                        object-cover
                        transition-opacity duration-500 ease-out
                        ${isHovered ? 'opacity-0' : 'opacity-100'}
                      `}
                    />
                    <Image
                      src={service.hoverImage}
                      alt={t(`services.${service.key}`)}
                      fill
                      className={`
                        object-cover
                        transition-opacity duration-500 ease-out
                        ${isHovered ? 'opacity-100' : 'opacity-0'}
                      `}
                    />
                  </>
                ) : (
                  <Image
                    src={service.image}
                    alt={t(`services.${service.key}`)}
                    fill
                    className={`
                      object-cover
                      transition-transform duration-500 ease-out
                      ${isHovered ? 'scale-105' : 'scale-100'}
                    `}
                  />
                )}

                {/* Overlay */}
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                  transition-opacity duration-300
                  ${isHovered ? 'opacity-100' : 'opacity-60'}
                `}
                />
              </div>

              {/* Content */}
              <div className='absolute inset-0 flex flex-col justify-end p-4 md:p-6'>
                {/* Title - Always visible */}
                <h3
                  className={`
                  text-white font-primary font-bold mb-2 text-center
                  transition-all duration-300
                  ${
                    isHovered
                      ? 'text-xl md:text-2xl opacity-100'
                      : isOtherHovered
                      ? 'text-sm opacity-70 writing-mode-vertical'
                      : 'text-base md:text-lg opacity-90'
                  }
                `}
                >
                  {isOtherHovered ? (
                    <span className='transform rotate-90 whitespace-nowrap block origin-center'>
                      {t(`services.${service.key}`)}
                    </span>
                  ) : (
                    t(`services.${service.key}`)
                  )}
                </h3>

                {/* Expanded Content - Only on hover */}
                <div
                  className={`
                  transition-all duration-300 text-center
                  ${
                    isHovered
                      ? 'opacity-100 transform translate-y-0'
                      : 'opacity-0 transform translate-y-4 pointer-events-none'
                  }
                `}
                >
                  <p className='font-secondary text-white/90 text-sm md:text-base mb-4 line-clamp-2'>
                    {getServiceDescription(service.key)}
                    {/* {t(`services.${service.key}`).toLowerCase()} */}
                  </p>

                  <div className='flex gap-2 justify-center'>
                    {}
                    <Link href={service.href as any}>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='bg-white/20 border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-sm'
                      >
                        Ver más
                      </Button>
                    </Link>
                    {beforeAfterUrls[service.key] && (
                      <Button
                        size='sm'
                        className={`backdrop-blur-sm flex items-center gap-1 ${
                          beforeAfterUrls[service.key]
                            ? 'bg-[#eba2a8] border-[#eba2a8] text-white hover:bg-[#f9bbc4] hover:border-[#f9bbc4]'
                            : 'bg-gray-400 border-gray-400 text-white/50 cursor-not-allowed'
                        }`}
                        disabled={!beforeAfterUrls[service.key]}
                        onClick={(e) => {
                          e.preventDefault();
                          if (beforeAfterUrls[service.key]) {
                            window.open(beforeAfterUrls[service.key], '_blank');
                          }
                        }}
                      >
                        <FaInstagram className='w-4 h-4' />
                        Before & After
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div
                className={`
                absolute top-4 right-4 w-3 h-3 rounded-full bg-primary
                transition-all duration-300
                ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
              `}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile fallback text */}
      <div className='mt-4 text-center text-sm text-muted-foreground md:hidden'>
        Deslizá horizontalmente para explorar todos los servicios
      </div>
    </div>
  );
}
