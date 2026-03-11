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
  title, description, image, onClick, isActive, showRibbon = false, imageClassName,
}: FilterBannerProps) {
  return (
    <div className='relative w-1/2 md:w-auto flex flex-col'>
      <button
        onClick={onClick}
        className={`
          relative rounded-xl w-full h-full group
          transition-all duration-300 ease-out
          shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
          ${isActive
            ? 'bg-[#FBE8EA]/30 ring-2 ring-[#EBA2A8]/80 shadow-[0_0_0_4px_rgba(235,162,168,0.08)]'
            : 'bg-white ring-1 ring-gray-200 hover:ring-[#EBA2A8]/60'
          }
        `}
      >
        <div className='h-full flex flex-col p-4 sm:p-5 md:p-6 lg:p-8 text-left gap-2'>
          <div className='w-8 md:w-10 h-0.5 bg-[#EBA2A8] rounded-full mb-1 transition-all duration-300 group-hover:w-12 md:group-hover:w-14' />
          <h3 className='text-sm md:text-xl lg:text-2xl xl:text-3xl leading-tight font-primary-medium font-bold text-[#2B2B2B] group-hover:text-[#EBA2A8] group-hover:-translate-y-px transition-all duration-300 break-words hyphens-auto'>
            {title}
          </h3>
          <p className='text-xs md:text-sm lg:text-base font-primary text-gray-500 group-hover:text-[#EBA2A8]/80 transition-all duration-300'>
            {description}
          </p>
          {isActive && (
            <span className='mt-auto inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-primary-medium tracking-wider text-[#EBA2A8] bg-[#EBA2A8]/10 ring-1 ring-[#EBA2A8]/30'>
              <span className='w-1.5 h-1.5 rounded-full bg-[#EBA2A8] shrink-0' />
              FILTRO ACTIVO
            </span>
          )}
        </div>
      </button>

      {showRibbon && (
        <div className='absolute top-0 left-0 z-20 pointer-events-none'>
          <Image
            src='/autostylism-ribbon.png'
            alt='Autostylism'
            width={112} height={112}
            className='w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-2xl'
            style={{ transform: 'translate(-25%, -25%) rotate(-30deg)' }}
          />
        </div>
      )}
    </div>
  );
}
