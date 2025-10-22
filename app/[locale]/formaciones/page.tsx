'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import SimpleCourseCard from '@/components/simple-course-card';
import SimpleCourseModal from '@/components/simple-course-modal';
import { FormacionesSkeleton } from '@/components/formaciones/FormacionesSkeleton';
import { FilterBanner } from '@/components/formaciones/FilterBanner';
import { useState, useEffect, useMemo } from 'react';
import { Course } from '@/types/course';
import { useAdminStore } from '@/stores';
import { getCourseImage, isAutostylismCourse } from '@/lib/utils';

type CourseFilter = 'all' | 'professional' | 'autostylism';

export default function FormacionesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CourseFilter>('all');

  // Subscribe directly to admin store (auto-updates when categories change)
  const categories = useAdminStore((state) => state.categories);
  const fetchCategories = useAdminStore((state) => state.fetchCategories);

  // Convert categories to courses format whenever categories change
  const courses = useMemo(() => {
    // Default: mostrar precios en ARS (mercado principal argentino)
    return categories.map((cat): Course => {
      return {
        id: cat.id,
        title: cat.name,
        description: cat.description || '',
        long_description: cat.long_description || '',
        long_description_en: cat.long_description_en || '',
        target: cat.target || '',
        target_en: cat.target_en || '',
        modalidad: cat.modalidad || '',
        modalidad_en: cat.modalidad_en || '',
        learn: cat.learn || '',
        learn_en: cat.learn_en || '',
        includes_category: cat.includes_category || [],
        includes_category_en: cat.includes_category_en || [],
        image: getCourseImage(cat.slug, cat.image),
        price: cat.priceARS || 0,
        priceARS: cat.priceARS || 0,
        priceUSD: cat.priceUSD || 0,
        isFree: cat.isFree || false,
        priceDisplay: cat.isFree
          ? 'Gratis'
          : cat.priceARS > 0
          ? `$${cat.priceARS.toLocaleString('es-AR')}`
          : cat.priceUSD > 0
          ? `U$S ${cat.priceUSD}`
          : 'Gratis',
        currency: 'ARS' as 'ARS' | 'USD', // Siempre ARS por defecto
        slug: cat.slug,
        isPublished: cat.isActive,
        order: cat.order || 0,
        isActive: cat.isActive,
      };
    });
  }, [categories]);

  // Fetch courses from API on mount
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
      } catch (_error) {
        // Error handled silently
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

  // Separate courses by type
  const autostylismCourses = useMemo(
    () => courses.filter((c) => isAutostylismCourse(c.slug, c.title)),
    [courses]
  );

  const professionalCourses = useMemo(
    () => courses.filter((c) => !isAutostylismCourse(c.slug, c.title)),
    [courses]
  );

  // Filter courses based on selected filter
  const filteredCourses = useMemo(() => {
    if (filter === 'professional') return professionalCourses;
    if (filter === 'autostylism') return autostylismCourses;
    return courses;
  }, [filter, courses, professionalCourses, autostylismCourses]);

  // Memoize price calculations to avoid re-computing on every render
  const coursesWithDisplayPrice = useMemo(
    () =>
      filteredCourses.map((course) => {
        let priceDisplay: string;

        if (course.isFree) {
          priceDisplay = 'Gratis';
        } else if (course.priceARS === 99999999) {
          priceDisplay =
            course.priceUSD > 0
              ? `USD ${course.priceUSD.toLocaleString('en-US')}`
              : 'Consultar';
        } else {
          priceDisplay =
            course.priceARS > 0
              ? `$${course.priceARS.toLocaleString('es-AR')}`
              : 'Gratis';
        }

        const isAutostylism = isAutostylismCourse(course.slug, course.title);

        return { ...course, priceDisplay, isAutostylism };
      }),
    [filteredCourses]
  );

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Navigation />
        <FormacionesSkeleton />
        <Footer />
      </>
    );
  }

  return (
    <div
      className='min-h-screen bg-background'
      suppressHydrationWarning
    >
      <Navigation />

      <section className='w-full'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='relative w-full aspect-[16/5] rounded-lg overflow-hidden'>
            <Image
              src='/Formacion-banner.png'
              alt='Formaciones Mery García'
              fill
              className='object-cover'
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px'
            />
          </div>
        </div>
      </section>

      {/* Hero Filter Banners */}
      <section className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='flex gap-6 md:grid md:grid-cols-2 md:gap-6'>
          <FilterBanner
            title='Formaciones Profesionales'
            description='Técnicas avanzadas para tu negocio'
            image='/Img-home/home-1.webp'
            onClick={() =>
              setFilter(filter === 'professional' ? 'all' : 'professional')
            }
            isActive={filter === 'professional'}
            showRibbon={false}
          />
          <FilterBanner
            title='Autostylism'
            description='Diseña tus cejas en casa'
            image='/Img-home/home-3.webp'
            onClick={() =>
              setFilter(filter === 'autostylism' ? 'all' : 'autostylism')
            }
            isActive={filter === 'autostylism'}
            showRibbon={true}
          />
        </div>

        {/* Reset Filter Button */}
        {filter !== 'all' && (
          <div className='flex justify-center mt-6'>
            <button
              onClick={() => setFilter('all')}
              className='px-6 py-2 rounded-full border-2 border-[#EBA2A8] bg-[#EBA2A8] text-white font-primary font-semibold hover:bg-[#f9bbc4] hover:border-[#f9bbc4] transition-all duration-300 shadow-md'
            >
              Ver Todos
            </button>
          </div>
        )}
      </section>

      <section
        className='container mx-auto px-4 pb-16 py-8 max-w-7xl'
        suppressHydrationWarning
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {coursesWithDisplayPrice.map((course) => (
            <SimpleCourseCard
              key={course.id}
              image={course.image}
              title={course.title}
              price={course.priceDisplay}
              description={course.description}
              slug={course.slug}
              isAutostylism={course.isAutostylism}
              onCourseClick={() => handleCourseClick(course)}
            />
          ))}
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
