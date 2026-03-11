'use client';
import Image from 'next/image';

export function HeroBanner() {
  return (
    <div className='w-full rounded-xl overflow-hidden bg-[#FBE8EA]'>
      <div className='flex flex-row'>

        {/* Video */}
        <div className='w-2/5 sm:w-1/3 flex-shrink-0 max-h-[140px] sm:max-h-none sm:min-h-[200px] lg:min-h-[240px] lg:max-h-[600px] overflow-hidden'>
          <video
            src='/emilia-formaciones.mp4'
            autoPlay
            muted
            playsInline
            loop
            className='w-full h-full object-cover'
          />
        </div>

        {/* Texto */}
        <div className='flex-1 flex flex-col items-start justify-start pt-4 pb-3 sm:justify-center sm:py-0 px-5 sm:px-10 md:px-14 lg:px-20 gap-2 sm:gap-4'>
          <span className='text-[9px] sm:text-[10px] tracking-[0.3em] text-[#EBA2A8] font-primary-medium uppercase'>
            Mery García
          </span>
          <h2 className='text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-primary-medium font-bold tracking-[0.15em] text-[#2B2B2B] uppercase leading-none'>
            ACADEMIA
          </h2>
          <div className='w-8 sm:w-12 h-0.5 bg-[#EBA2A8] rounded-full' />
          <Image
            src='/formacion/mery-garcia-formaciones.svg'
            alt='Mery García Formaciones'
            width={160}
            height={56}
            className='w-20 h-auto sm:w-[160px] object-contain opacity-60 mt-1 sm:mt-0'
          />
        </div>

      </div>
    </div>
  );
}
