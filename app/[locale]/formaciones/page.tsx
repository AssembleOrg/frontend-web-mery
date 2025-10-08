'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import SimpleCourseCard from '@/components/simple-course-card';
import SimpleCourseModal from '@/components/simple-course-modal';
import { useState, useEffect } from 'react';
import { Course } from '@/types/course';
import { useAdminStore } from '@/stores';
import { getCourseImage } from '@/lib/utils';

export default function FormacionesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  // Get courses from admin store
  const { fetchCategories } = useAdminStore();

  // Fetch courses from API on mount
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
        // Get categories from store after fetch
        const categories = useAdminStore.getState().categories;
        
        // Convert categories to courses format
        // Default: mostrar precios en ARS (mercado principal argentino)
        const coursesData: Course[] = categories.map((cat): Course => {
          return {
            id: cat.id,
            title: cat.name,
            description: cat.description || '',
            image: getCourseImage(cat.slug, cat.image),
            price: cat.priceARS || 0,
            priceARS: cat.priceARS || 0,
            priceUSD: cat.priceUSD || 0,
            isFree: cat.isFree || false,
            priceDisplay: cat.isFree 
              ? 'Gratis' 
              : (cat.priceARS > 0 
                  ? `$${cat.priceARS.toLocaleString('es-AR')}` 
                  : (cat.priceUSD > 0 ? `U$S ${cat.priceUSD}` : 'Gratis')),
            currency: 'ARS' as 'ARS' | 'USD', // Siempre ARS por defecto
            slug: cat.slug,
            isPublished: cat.isActive,
            order: cat.order || 0,
            isActive: cat.isActive,
          };
        });
        
        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, [fetchCategories]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  // Get auto-styling course for the featured banner
  const autoStylingCourse = courses.find((c) => c.slug === 'auto-styling-cejas');

  const handleAutoStylingClick = () => {
    if (autoStylingCourse) {
      setSelectedCourse(autoStylingCourse);
      setIsModalOpen(true);
    }
  };

  // Filter out auto-styling from regular grid (show it in banner instead)
  const regularCourses = courses.filter((c) => c.slug !== 'auto-styling-cejas');

  // Show loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <Navigation />
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f9bbc4]'></div>
            <p className='mt-4 text-gray-600'>Cargando formaciones...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background' suppressHydrationWarning>
      <Navigation />

      <section className='w-full'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <Image
            src='/Formacion-banner.png'
            alt='Formaciones Mery García'
            width={1920}
            height={600}
            className='w-full h-auto object-cover rounded-lg'
            priority
          />
        </div>
      </section>

      {/* Auto Styling Banner */}
      {autoStylingCourse && (
        <section className='container mx-auto px-4 py-8 max-w-7xl'>
          <div className='relative bg-gradient-to-r from-[#fbe8ea] to-[#f9bbc4] p-6 md:p-8 rounded-lg border-2 border-[#eba2a8] shadow-lg'>
            {/* Badge "NUEVO" */}
            <div className='absolute -top-3 left-6 bg-[#660e1b] text-white px-4 py-1 text-sm font-bold rounded-full'>
              NUEVO
            </div>

            <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
              {/* Contenido del Banner */}
              <div className='text-center md:text-left flex-1'>
                <h2 className='text-2xl md:text-3xl font-primary font-semibold text-[#660e1b]/80 mb-3'>
                  ¿Querés aprender a diseñar tus propias cejas?
                </h2>
                <p className='text-xl md:text-2xl lg:text-3xl font-primary font-black text-[#660e1b] mb-2'>
                  {autoStylingCourse.title}
                </p>
                <p className='text-sm text-[#660e1b]/70 font-medium'>
                  ✨ Sin experiencia requerida • 📱 100% Online • ⏰ 6 meses de
                  acceso
                </p>
              </div>

              {/* CTA Button */}
              <div className='text-center'>
                <div className='mb-3'>
                  <span className='text-2xl font-primary font-bold text-[#660e1b]'>
                    {autoStylingCourse.priceDisplay}
                  </span>
                  <p className='text-xs text-[#660e1b]/70'>
                    Incluye certificación y materiales
                  </p>
                </div>
                <button
                  onClick={handleAutoStylingClick}
                  className='bg-[#660e1b] hover:bg-[#4a0a14] text-white px-6 py-3 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform'
                >
                  🎯 Quiero Aprender
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className='container mx-auto px-4 pb-16 py-8 max-w-7xl' suppressHydrationWarning>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {regularCourses.map((course) => {
            // Ensure price is always a string
            const priceDisplay = course.priceDisplay || 
              (course.priceARS > 0 ? `$${course.priceARS.toLocaleString('es-AR')}` : 'Gratis');
            
            return (
              <SimpleCourseCard
                key={course.id}
                image={course.image}
                title={course.title}
                price={priceDisplay}
                description={course.description}
                onCourseClick={() => handleCourseClick(course)}
              />
            );
          })}
        </div>
      </section>

      <Footer />

      {selectedCourse && (
        <SimpleCourseModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
