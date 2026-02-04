'use client';

import Image from 'next/image';

interface FilterBannerProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  isActive: boolean;
  showRibbon?: boolean;
  imageClassName?: string;
}

export function FilterBanner({
  title,
  description,
  image,
  onClick,
  isActive,
  showRibbon = false,
  imageClassName,
}: FilterBannerProps) {
  return (
    <div className='relative w-1/2 md:w-auto'>
      <button
        onClick={onClick}
        className={`
          relative rounded-lg w-full group
          transition-all duration-300 ease-out
          h-[220px] md:h-[240px] lg:h-[260px]
          bg-white shadow-sm
          ${isActive ? 'border-2 border-[#EBA2A8]' : 'border border-gray-300 hover:border-[#EBA2A8]'}
        `}
      >
        {/* Content */}
        <div className='h-full flex flex-col justify-start items-start px-6 pt-16 pb-16 md:px-8 md:pt-20 lg:px-10 lg:pt-24 text-left'>
          {/* Decorative top line */}
          <div className="absolute top-6 left-6 w-12 h-0.5 bg-[#EBA2A8] rounded-full" />

          <h3 className='text-xl md:text-3xl lg:text-3xl xl:text-4xl leading-tight font-primary-medium font-bold mb-2 text-[#2B2B2B] group-hover:text-[#EBA2A8] transition-all duration-300 text-left'>
            {title}
          </h3>
          <p className='text-sm md:text-base lg:text-lg font-primary text-gray-500 group-hover:text-[#EBA2A8] transition-all duration-300 text-left'>
            {description}
          </p>

          {isActive && (
            <span className='absolute bottom-3 md:bottom-4 left-6 md:left-8 lg:left-10 inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#EBA2A8] text-white shadow-sm'>
              FILTRO ACTIVO
            </span>
          )}
        </div>
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
