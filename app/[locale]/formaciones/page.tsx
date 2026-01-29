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

  const categories = useAdminStore((state) => state.categories);
  const fetchCategories = useAdminStore((state) => state.fetchCategories);

  const courses = useMemo(() => {
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
          ? ''
          : cat.priceARS > 0
          ? `$${cat.priceARS.toLocaleString('es-AR')}`
          : cat.priceUSD > 0
          ? `U$S ${cat.priceUSD}`
          : '',
        currency: 'ARS' as 'ARS' | 'USD',
        slug: cat.slug,
        isPublished: cat.isActive,
        order: cat.order || 0,
        isActive: cat.isActive,
      };
    });
  }, [categories]);

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

  const autostylismCourses = useMemo(
    () => courses.filter((c) => isAutostylismCourse(c.slug, c.title)),
    [courses]
  );

  const professionalCourses = useMemo(
    () => courses.filter((c) => !isAutostylismCourse(c.slug, c.title)),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    if (filter === 'professional') return professionalCourses;
    if (filter === 'autostylism') return autostylismCourses;
    return courses;
  }, [filter, courses, professionalCourses, autostylismCourses]);

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      if (orderA === orderB) return 0;

      return orderA - orderB;
    });
  }, [filteredCourses]);

  const coursesWithDisplayPrice = useMemo(
    () =>
      sortedCourses.map((course) => {
        let priceDisplay: string;
        let originalPriceDisplay: string | undefined;
        
        // DESCUENTOS FICTICIOS DESACTIVADOS - Mostrar precios reales
        // // Verificar si es Nanoblading o Camuflaje Senior (por título o slug)
        // const isSpecialUSDCourse = 
        //   course.title.toLowerCase().includes('nanoblading') || 
        //   course.slug.toLowerCase().includes('nanoblading') ||
        //   course.title.toLowerCase().includes('camuflaje senior') ||
        //   course.slug.toLowerCase().includes('camuflaje senior') ||
        //   course.title.toLowerCase().includes('camuflaje señor') ||
        //   course.slug.toLowerCase().includes('camuflaje señor');
        
        if (course.isFree) {
          priceDisplay = '';
          originalPriceDisplay = undefined;
        } else if (course.priceARS === 99999999) {
          // Cursos en USD: mostrar precio real sin descuento ficticio
          const realPrice = course.priceUSD;
          priceDisplay = realPrice > 0
            ? `USD ${realPrice.toLocaleString('en-US')}`
            : 'Consultar';
          originalPriceDisplay = undefined;
          
          // DESCUENTOS FICTICIOS DESACTIVADOS
          // if (isSpecialUSDCourse && realPrice > 0) {
          //   // Aplicar descuento ficticio solo a cursos especiales en USD
          //   const inflatedPrice = realPrice * 2; // Precio duplicado
          //   priceDisplay = `USD ${realPrice.toLocaleString('en-US')}`;
          //   originalPriceDisplay = `USD ${inflatedPrice.toLocaleString('en-US')}`;
          // } else {
          //   // Otros cursos en USD sin descuento
          //   priceDisplay = realPrice > 0
          //     ? `USD ${realPrice.toLocaleString('en-US')}`
          //     : 'Consultar';
          //   originalPriceDisplay = undefined;
          // }
        } else {
          // Cursos en ARS: mostrar precio real sin descuento ficticio
          const realPrice = course.priceARS;
          priceDisplay = realPrice > 0
            ? `$${realPrice.toLocaleString('es-AR')}`
            : '';
          originalPriceDisplay = undefined;
          
          // DESCUENTOS FICTICIOS DESACTIVADOS
          // // Para cursos en ARS, duplicar el precio para mostrar como "descuento"
          // const inflatedPrice = realPrice * 2; // Precio duplicado
          // originalPriceDisplay = realPrice > 0
          //   ? `$${inflatedPrice.toLocaleString('es-AR')}`
          //   : undefined;
        }
        const isAutostylism = isAutostylismCourse(course.slug, course.title);
        return { ...course, priceDisplay, originalPriceDisplay, isAutostylism };
      }),
    [sortedCourses]
  );

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
          />
          <FilterBanner
            title='Auto Styling'
            description='Diseña tus cejas en casa'
            image='/Img-home/autostyling-gris.webp'
            onClick={() =>
              setFilter(filter === 'autostylism' ? 'all' : 'autostylism')
            }
            isActive={filter === 'autostylism'}
            imageClassName='object-[center_100%]'
          />
        </div>
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
              originalPrice={course.originalPriceDisplay}
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
          course={{
            ...selectedCourse,
            // Asegurar que el precio mostrado en el modal sea el real (no inflado)
            // El modal ya maneja displayPrice correctamente
          }}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
