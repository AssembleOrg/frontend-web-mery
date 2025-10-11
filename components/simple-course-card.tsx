'use client';

import Image from 'next/image';

interface SimpleCourseCardProps {
  image: string;
  title: string;
  price: string;
  description?: string;
  onCourseClick?: () => void;
}

export default function SimpleCourseCard({
  image,
  title,
  price,
  description,
  onCourseClick,
}: SimpleCourseCardProps) {
  const handleClick = () => {
    if (onCourseClick) {
      onCourseClick();
    } else {
      console.log('Course clicked:', { title, price });
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full'>
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

      {/* Course Content */}
      <div className='p-4 flex flex-col flex-grow'>
        <p className='text-sm text-gray-600 mb-2 flex-grow'>
          {description || 'Descripción del curso'}
        </p>
        <p className='text-lg font-semibold text-gray-900 mb-3'>{price}</p>
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
