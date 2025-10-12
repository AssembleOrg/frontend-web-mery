'use client';

import Image from 'next/image';

interface FilterBannerProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  isActive: boolean;
  showRibbon?: boolean;
}

export function FilterBanner({
  title,
  description,
  image,
  onClick,
  isActive,
  showRibbon = false,
}: FilterBannerProps) {
  return (
    <div className='relative flex-1 md:flex-none'>
      <button
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-lg w-full
          transition-all duration-300 ease-out
          h-[130px] md:h-[180px] lg:h-[200px]
          hover:scale-[1.02] hover:shadow-2xl
          ${isActive ? 'ring-4 ring-[#EBA2A8] shadow-xl' : 'shadow-md'}
        `}
      >
        {/* Background Image */}
        <div className='absolute inset-0'>
          <Image
            src={image}
            alt={title}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, 50vw'
            priority
          />
          {/* Overlay  */}
          <div className='absolute inset-0 bg-black/40 hover:bg-black/30 transition-opacity duration-300' />
        </div>

        {/* Content */}
        <div className='relative z-10 h-full flex flex-col justify-center md:justify-end px-4 py-3 md:p-6 lg:p-8 text-center md:text-left'>
          <h3 className='text-2xl md:text-3xl lg:text-4xl font-primary font-bold mb-0 md:mb-2 text-white drop-shadow-md transition-all duration-300'>
            {title}
          </h3>
          <p className='hidden md:block text-sm md:text-base lg:text-lg font-secondary text-white/90 drop-shadow-md transition-all duration-300'>
            {description}
          </p>

          {/* Active Indicator */}
          {isActive && (
            <div className='hidden md:block mt-4'>
              <span className='inline-block px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-[#EBA2A8] text-[#660e1b]'>
                FILTRO ACTIVO
              </span>
            </div>
          )}
        </div>

        {/* Hover Indicator */}
        <div
          className={`
        absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EBA2A8]
        transition-all duration-300
        ${
          isActive
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-50'
        }
      `}
        />
      </button>

      {/* Ribbon */}
      {showRibbon && (
        <div className='absolute top-0 left-0 z-20 pointer-events-none'>
          <Image
            src='/autostylism-ribbon.png'
            alt='Autostylism'
            width={112}
            height={112}
            className='w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-2xl'
            style={{ transform: 'translate(-25%, -25%) rotate(-30deg)' }}
          />
        </div>
      )}
    </div>
  );
}
