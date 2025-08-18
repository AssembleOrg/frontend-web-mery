'use client';
import { Course } from './types/course';

interface CourseCardProps {
  course: Course;
  onOpenModal: (course: Course) => void;
}

export default function CourseCard({ course, onOpenModal }: CourseCardProps) {
  const handleMoreInfo = () => {
    console.log('Course clicked:', course);
    onOpenModal(course);
  };

  return (
    <div className='bg-gray-800 text-white relative overflow-hidden h-auto flex flex-col justify-between p-6 rounded-lg hover:shadow-lg transition-shadow duration-300'>
      {/* Course Title */}
      <div>
        <h3 className='text-lg font-primary-medium mb-2 uppercase tracking-wide leading-tight'>
          {course.title}
        </h3>
        <p className='text-sm text-gray-300 mb-4 leading-relaxed'>
          {course.description}
        </p>
      </div>

      {/* Price and Button */}
      <div className='flex justify-between items-end mt-4'>
        <div>
          <p className='text-2xl font-primary-medium text-white'>
            {course.price === 'Consultar' ? 'Consultar' : `$${course.price}`}
          </p>
        </div>
        <button
          onClick={handleMoreInfo}
          className='bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide'
        >
          Más Información
        </button>
      </div>
    </div>
  );
}
