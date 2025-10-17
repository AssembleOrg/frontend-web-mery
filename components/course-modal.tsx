'use client';

import { Course } from './types/course';
import { Modal } from './ui/modal';

interface CourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseModal({
  course,
  isOpen,
  onClose,
}: CourseModalProps) {
  if (!course) return null;

  const handleVideoClick = () => {
    console.log(
      'Video would play for course:',
      course.title,
      'Video ID:',
      course.modalContent.videoId
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='max-w-4xl mx-auto p-6'>
        {/* Modal Header */}
        <div className='flex justify-between items-start mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 pr-8'>
            {course.title}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 text-2xl font-bold'
          >
            ×
          </button>
        </div>

        {/* Video Section */}
        <div className='mb-8'>
          <div
            className='bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors duration-200'
            onClick={handleVideoClick}
          >
            <div className='text-center'>
              <div className='w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <svg
                  className='w-8 h-8 text-white ml-1'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M8 5v10l8-5-8-5z' />
                </svg>
              </div>
              <p className='text-gray-600 font-medium'>
                Click para reproducir video
              </p>
              {course.modalContent.videoId && (
                <p className='text-sm text-gray-500 mt-1'>
                  Video ID: {course.modalContent.videoId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Left Column - Description */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Descripción del Curso
            </h3>
            <p className='text-gray-600 leading-relaxed mb-6'>
              {course.modalContent.detailedDescription}
            </p>

            {/* Course Includes */}
            {course.modalContent.includes &&
              course.modalContent.includes.length > 0 && (
                <div className='mb-6'>
                  <h4 className='font-semibold text-gray-900 mb-3'>
                    Este curso incluye:
                  </h4>
                  <ul className='space-y-2'>
                    {course.modalContent.includes.map((item, index) => (
                      <li
                        key={index}
                        className='flex items-start'
                      >
                        <span className='text-pink-600 mr-2'>✓</span>
                        <span className='text-gray-600'>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Right Column - Course Info */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Información del Curso
            </h3>

            <div className='space-y-4'>
              {/* Price */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <span className='text-sm text-gray-500 block'>Precio</span>
                <span className='text-2xl font-bold text-gray-900'>
                  {course.price === 'Consultar'
                    ? 'Consultar'
                    : `$${course.price}`}
                </span>
              </div>

              {/* Duration */}
              {course.modalContent.duration && (
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Duración:</span>
                  <span className='font-semibold text-gray-900'>
                    {course.modalContent.duration}
                  </span>
                </div>
              )}

              {/* Level */}
              {course.modalContent.level && (
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-gray-600'>Nivel:</span>
                  <span className='font-semibold text-gray-900'>
                    {course.modalContent.level}
                  </span>
                </div>
              )}

              {/* Requirements */}
              {course.modalContent.requirements &&
                course.modalContent.requirements.length > 0 && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Requisitos:
                    </h4>
                    <ul className='space-y-1'>
                      {course.modalContent.requirements.map((req, index) => (
                        <li
                          key={index}
                          className='text-sm text-gray-600'
                        >
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
