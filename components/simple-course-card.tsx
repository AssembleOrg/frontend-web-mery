'use client';

import Image from 'next/image';

interface SimpleCourseCardProps {
  image: string;
  title: string;
  price: string;
  originalPrice?: string; // Precio duplicado (inflado) para mostrar tachado
  description?: string;
  slug?: string;
  isAutostylism?: boolean;
  onCourseClick?: () => void;
}

export default function SimpleCourseCard({
  image,
  title,
  price,
  originalPrice,
  description,
  onCourseClick,
}: SimpleCourseCardProps) {
  const handleClick = () => {
    if (onCourseClick) {
      onCourseClick();
    }
  };

  return (
    <div className='relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full'>
      {/* Badge de 50% OFF */}
      {originalPrice && (
        <div className='absolute top-3 right-3 z-10'>
          <div className='bg-[#8b1538] text-white px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 font-primary-medium'>
            50% OFF
          </div>
        </div>
      )}

      {/* Course Image */}
      <div className='relative h-48 w-full'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover'
          loading='lazy'
          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
        />
      </div>

      {/* Ribbon */}
      {/* {isAutostylism && (
        <div className='absolute top-0 left-0 z-20 pointer-events-none'>
          <Image
            src='/autostylism-ribbon.png'
            alt='Autostylism'
            width={88}
            height={88}
            className='w-22 h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-lg'
            style={{ transform: 'translate(-5%, -25%) rotate(-15deg)' }}
          />
        </div>
      )} */}

      {/* Course Content */}
      <div className='p-4 flex flex-col flex-grow'>
        <p className='text-sm text-gray-600 mb-2 flex-grow'>
          {description || 'Descripción del curso'}
        </p>
        <div className='mb-3'>
          {originalPrice ? (
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-[#545454] dark:text-[#a0a0a0] line-through'>{originalPrice}</p>
                <span className='bg-[#fbe8ea] text-[#8b1538] px-2 py-0.5 rounded text-xs font-bold font-primary-medium'>
                  50% OFF
                </span>
              </div>
              <p className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{price}</p>
            </div>
          ) : (
            <p className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{price}</p>
          )}
        </div>
        <button
          onClick={handleClick}
          className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white py-2 px-4 rounded text-sm font-medium transition-colors duration-200 mt-auto'
        >
          Más información
        </button>
      </div>
    </div>
  );
}
