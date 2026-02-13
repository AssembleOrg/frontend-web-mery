'use client';

import { Modal } from './ui/modal';
import CourseInclude from './course-include';
import { useRouter } from 'next/navigation';
import { Play, Loader2, ShoppingCart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { arePurchaseButtonsActive, PROMO_CONFIG } from '@/lib/promo-config';
import { getCourseDetails, getPresentationVideo } from '@/lib/api-client';
import { Course } from '@/types/course';

interface OfertasCourseModalProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseImage?: string;
  priceARS: number;
  priceUSD: number;
  originalPrice: number;
  discountedPrice: number;
  isSpecialCourse: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// Función para formatear números con separadores de miles
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

const WHATSAPP_NUMBER = '5491153336627';

export default function OfertasCourseModal({
  courseId,
  courseTitle,
  courseDescription,
  courseImage,
  priceARS,
  priceUSD,
  originalPrice,
  discountedPrice,
  isSpecialCourse,
  isOpen,
  onClose,
}: OfertasCourseModalProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoadingMP, setIsLoadingMP] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [presentationVideo, setPresentationVideo] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const purchaseButtonsActive = arePurchaseButtonsActive();

  // Cargar datos completos del curso cuando se abre el modal
  useEffect(() => {
    if (isOpen && courseId) {
      const loadCourseData = async () => {
        setLoadingCourse(true);
        try {
          // Obtener datos completos del curso
          const categoryData = await getCourseDetails(courseId);
          
          // Convertir Category a Course
          const courseData: Course = {
            id: categoryData.id,
            slug: categoryData.slug,
            title: categoryData.name,
            description: categoryData.description || courseDescription,
            image: categoryData.image || courseImage || '',
            priceARS: categoryData.priceARS || priceARS,
            priceUSD: categoryData.priceUSD || priceUSD,
            isFree: categoryData.isFree || false,
            price: categoryData.priceARS || priceARS,
            priceDisplay: categoryData.priceUSD
              ? `U$S ${categoryData.priceUSD}`
              : `$${categoryData.priceARS}`,
            currency: categoryData.priceUSD > 0 ? 'USD' : 'ARS',
            isPublished: categoryData.isActive,
            long_description: categoryData.long_description,
            long_description_en: categoryData.long_description_en,
            target: categoryData.target,
            target_en: categoryData.target_en,
            modalidad: categoryData.modalidad,
            modalidad_en: categoryData.modalidad_en,
            learn: categoryData.learn,
            learn_en: categoryData.learn_en,
            includes_category: categoryData.includes_category,
            includes_category_en: categoryData.includes_category_en,
          };
          
          setCourse(courseData);
        } catch (error) {
          console.error('Error loading course data:', error);
          // Si falla, usar datos básicos
          setCourse({
            id: courseId,
            slug: '',
            title: courseTitle,
            description: courseDescription,
            image: courseImage || '',
            priceARS,
            priceUSD,
            isFree: false,
            price: priceARS,
            priceDisplay: `$${priceARS}`,
            currency: 'ARS',
            isPublished: true,
          });
        } finally {
          setLoadingCourse(false);
        }
      };

      loadCourseData();
    }
  }, [isOpen, courseId, courseTitle, courseDescription, courseImage, priceARS, priceUSD]);

  // Cargar video de presentación
  useEffect(() => {
    if (isOpen && courseId) {
      setLoadingVideo(true);
      setPresentationVideo(null);
      setStreamUrl(null);

      getPresentationVideo(courseId)
        .then((result) => {
          if (result) {
            setPresentationVideo(result.video);
            setStreamUrl(result.streamUrl || null);
          }
        })
        .catch((_error) => {
          // Error handled silently
        })
        .finally(() => {
          setLoadingVideo(false);
        });
    }
  }, [isOpen, courseId]);

  const handleWhatsApp = () => {
    const priceInfo = isSpecialCourse
      ? ` (USD ${formatPrice(discountedPrice)})`
      : ` ($${formatPrice(discountedPrice)})`;
    const message = `Hola! Me interesa ${courseTitle} con la promoción del ${PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF${priceInfo}.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBuyCourse = async () => {
    // Si es curso especial, solo mostrar WhatsApp
    if (isSpecialCourse) {
      handleWhatsApp();
      return;
    }

    if (!isAuthenticated || !user) {
      onClose();
      router.push('/es/login');
      return;
    }

    setIsLoadingMP(true);
    try {
      // Crear preferencia de MercadoPago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: courseId,
            title: courseTitle,
            description: courseDescription || `Curso: ${courseTitle}`,
            price: discountedPrice,
            quantity: 1,
          }],
          locale: 'es',
          userEmail: user.email,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear la preferencia de pago');
      }

      const { url, sandbox_init_point } = await response.json();
      const paymentUrl = url || sandbox_init_point;
      
      if (paymentUrl) {
        onClose();
        window.open(paymentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoadingMP(false);
    }
  };

  const displayPrice = isSpecialCourse
    ? `USD ${formatPrice(discountedPrice)}`
    : `$${formatPrice(discountedPrice)}`;

  const originalPriceDisplay = isSpecialCourse
    ? `USD ${formatPrice(originalPrice)}`
    : `$${formatPrice(originalPrice)}`;

  // Función para renderizar texto con párrafos y negritas
  const renderTextWithParagraphs = (text: string) => {
    const paragraphs = text
      .split('\n\n')
      .filter((paragraph) => paragraph.trim() !== '');

    return (
      <div className='space-y-4 font-primary'>
        {paragraphs.map((paragraph, index) => {
          // Split by ** to find bold sections
          const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

          return (
            <p
              key={index}
              className='text-[#2b2b2b] leading-relaxed text-left'
              style={{ whiteSpace: 'pre-line', fontWeight: 300 }}
            >
              {parts.map((part, partIndex) => {
                // Check if this part is bold (wrapped in **)
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2);
                  return (
                    <span
                      key={partIndex}
                      className='font-primary-medium'
                    >
                      {boldText}
                    </span>
                  );
                }
                return <span key={partIndex}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-full max-w-4xl h-[90vh] mx-auto bg-white rounded-lg flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          {/* Video de presentación o imagen */}
          {loadingVideo ? (
            <div className='bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-t-lg aspect-video flex items-center justify-center border-b border-gray-200'>
              <div className='text-center'>
                <Loader2 className='w-12 h-12 text-[#660e1b] animate-spin mx-auto mb-4' />
                <p className='text-[#660e1b] font-primary font-bold text-lg'>
                  Cargando video...
                </p>
              </div>
            </div>
          ) : presentationVideo && streamUrl ? (
            <div className='bg-black rounded-t-lg aspect-video'>
              <iframe
                src={streamUrl}
                className='w-full h-full rounded-t-lg'
                frameBorder='0'
                allow='autoplay; fullscreen; picture-in-picture'
                allowFullScreen
                title={presentationVideo.title}
              />
            </div>
          ) : presentationVideo && !streamUrl ? (
            <div className='bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-t-lg aspect-video flex items-center justify-center border-b border-gray-200'>
              <div className='text-center max-w-md px-6'>
                <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg border border-gray-200'>
                  <Play
                    className='w-10 h-10 text-[#660e1b] ml-1'
                    fill='currentColor'
                  />
                </div>
                <h3 className='font-primary font-bold text-lg text-[#660e1b] mb-2'>
                  {presentationVideo.title}
                </h3>
                <p className='text-sm text-[#6c757d] mb-4'>
                  {presentationVideo.description}
                </p>
              </div>
            </div>
          ) : courseImage ? (
            <div className='relative w-full h-64 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]'>
              <img
                src={courseImage}
                alt={courseTitle}
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-t-lg aspect-video flex items-center justify-center border-b border-gray-200'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200'>
                  <Play
                    className='w-10 h-10 text-[#660e1b] ml-1'
                    fill='currentColor'
                  />
                </div>
                <p className='text-[#660e1b] font-primary font-bold text-lg'>
                  Video del Curso
                </p>
                <p className='text-sm text-[#6c757d] mt-1'>
                  Video de presentación no disponible
                </p>
              </div>
            </div>
          )}

          <div className='bg-white px-6 py-6'>
            <div className='text-left space-y-4'>
              <div className='flex justify-start'>
                <img
                  src='/browes.svg'
                  alt='Brushes decoration'
                  className='h-42 opacity-80'
                />
              </div>

              <h2 className='text-3xl font-primary font-black text-[#660e1b] text-left leading-tight mt-[-2.5rem]'>
                {courseTitle}
              </h2>
            </div>
          </div>

          <div className='px-6 pb-6 bg-white space-y-6'>
            {/* Descripción detallada */}
            {loadingCourse ? (
              <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8] flex items-center justify-center'>
                <Loader2 className='w-6 h-6 text-[#660e1b] animate-spin' />
              </div>
            ) : course ? (
              <>
                {course.long_description ? (
                  <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                    {renderTextWithParagraphs(course.long_description)}
                  </div>
                ) : courseDescription ? (
                  <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                    <p className='text-[#2b2b2b] leading-relaxed text-left'>
                      {courseDescription}
                    </p>
                  </div>
                ) : null}

                {/* Sección de precio y botones */}
                <div className='bg-gradient-to-r from-[#f9bbc4] to-[#eba2a8] p-6 rounded-lg shadow-lg'>
                  {/* Desktop layout */}
                  {isSpecialCourse ? (
                    /* Cursos en USD: Solo WhatsApp */
                    <div className='hidden md:flex items-center justify-between'>
                      <div className='flex-1 text-center'>
                        <h3 className='text-lg font-primary font-bold text-white mb-1'>
                          Inversión del Curso
                        </h3>
                        <p className='text-sm text-white/90 line-through mb-1'>
                          {originalPriceDisplay}
                        </p>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        <p className='text-white/90 text-sm mt-1 font-semibold'>
                          {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                        </p>
                        <p className='text-white/90 text-sm mt-2 font-semibold'>
                          💬 Consultar por este curso vía WhatsApp
                        </p>
                      </div>

                      <button
                        onClick={handleWhatsApp}
                        className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-4 px-10 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 transform'
                      >
                        <FaWhatsapp className='w-5 h-5' />
                        Consultar por WhatsApp
                      </button>
                    </div>
                  ) : (
                    /* Cursos en ARS: WhatsApp + Comprar */
                    <div className='hidden md:flex items-center justify-between'>
                      <button
                        onClick={handleWhatsApp}
                        className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 transform'
                      >
                        <FaWhatsapp className='w-4 h-4' />
                        WhatsApp
                      </button>

                      <div className='text-center'>
                        <h3 className='text-lg font-primary font-bold text-white mb-1'>
                          Inversión del Curso
                        </h3>
                        <p className='text-sm text-white/90 line-through mb-1'>
                          {originalPriceDisplay}
                        </p>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        <p className='text-white/90 text-sm mt-1 font-semibold'>
                          {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                        </p>
                      </div>

                      <button
                        onClick={handleBuyCourse}
                        className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isLoadingMP || !purchaseButtonsActive}
                      >
                        {isLoadingMP ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Procesando...
                          </>
                        ) : !purchaseButtonsActive ? (
                          'Fuera del período'
                        ) : (
                          <>
                            <ShoppingCart className='w-4 h-4' />
                            Comprar Ahora
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mobile layout */}
                  {isSpecialCourse ? (
                    /* Cursos en USD: Solo WhatsApp */
                    <div className='md:hidden space-y-4'>
                      <div className='text-center'>
                        <h3 className='text-lg font-primary font-bold text-white mb-1'>
                          Inversión del Curso
                        </h3>
                        <p className='text-sm text-white/90 line-through mb-1'>
                          {originalPriceDisplay}
                        </p>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        <p className='text-white/90 text-sm mt-1 font-semibold'>
                          {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                        </p>
                        <p className='text-white/90 text-sm mt-2 font-semibold'>
                          💬 Consultar por este curso vía WhatsApp
                        </p>
                      </div>

                      <button
                        onClick={handleWhatsApp}
                        className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-4 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center hover:scale-105 transform w-full'
                      >
                        <FaWhatsapp className='w-5 h-5' />
                        Consultar por WhatsApp
                      </button>
                    </div>
                  ) : (
                    /* Cursos en ARS: Comprar + WhatsApp */
                    <div className='md:hidden space-y-4'>
                      <div className='text-center'>
                        <h3 className='text-lg font-primary font-bold text-white mb-1'>
                          Inversión del Curso
                        </h3>
                        <p className='text-sm text-white/90 line-through mb-1'>
                          {originalPriceDisplay}
                        </p>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        <p className='text-white/90 text-sm mt-1 font-semibold'>
                          {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                        </p>
                      </div>

                      <div className='flex flex-col space-y-3'>
                        <button
                          onClick={handleBuyCourse}
                          className='py-4 px-8 rounded-full font-primary font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-[#660e1b] hover:bg-[#4a0a14] text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full'
                          disabled={isLoadingMP || !purchaseButtonsActive}
                        >
                          {isLoadingMP ? (
                            <>
                              <Loader2 className='w-5 h-5 animate-spin' />
                              Procesando...
                            </>
                          ) : !purchaseButtonsActive ? (
                            'Fuera del período'
                          ) : (
                            <>
                              <ShoppingCart className='w-5 h-5' />
                              Comprar Ahora
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleWhatsApp}
                          className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center hover:scale-105 transform'
                        >
                          <FaWhatsapp className='w-4 h-4' />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modalidad */}
                {course.modalidad && course.modalidad.trim() !== '' && (
                  <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                    <h3 className='text-xl font-primary font-bold text-[#660e1b] mb-3 text-center'>
                      Modalidad
                    </h3>
                    {renderTextWithParagraphs(course.modalidad)}
                  </div>
                )}

                {/* ¿Qué aprenderás? */}
                {course.learn && course.learn.trim() !== '' && (
                  <div className='bg-white p-6 rounded-lg border border-[#f0e6e8]'>
                    <h3 className='text-2xl font-primary font-bold text-[#660e1b] mb-4'>
                      ¿Qué vas a aprender?
                    </h3>
                    {renderTextWithParagraphs(course.learn)}
                  </div>
                )}

                {/* ¿Qué incluye? */}
                {course.includes_category && course.includes_category.length > 0 ? (
                  <div>
                    <h3 className='text-2xl font-primary font-bold text-[#660e1b] mb-6 text-center'>
                      ¿Qué incluye este curso?
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {course.includes_category.map((item, index) => (
                        <CourseInclude
                          key={index}
                          iconImage={item.url_icon}
                          text={item.texto || item.text || ''}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* ¿A quién está dirigido? */}
                {course?.target?.trim() !== '' && (
                  <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                    <h3 className='text-xl font-primary font-bold text-[#660e1b] mb-4'>
                      ¿A quién está dirigido?
                    </h3>
                    <p className='text-[#2b2b2b] leading-relaxed'>
                      {course.target}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                <p className='text-[#2b2b2b] leading-relaxed text-left'>
                  {courseDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
