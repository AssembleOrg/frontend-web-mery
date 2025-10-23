'use client';

import { Modal } from './ui/modal';
import CourseInclude from './course-include';
import { Course } from '@/types/course';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { Play, Loader2, ShoppingCart, CheckCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { getPresentationVideo } from '@/lib/api-client';
import { useModal } from '@/contexts/modal-context';

interface SimpleCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleCourseModal({
  course,
  isOpen,
  onClose,
}: SimpleCourseModalProps) {
  const { addCourse, isInCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { showError } = useModal();
  const [presentationVideo, setPresentationVideo] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load presentation video (order 0) when modal opens
  useEffect(() => {
    if (isOpen && course?.id) {
      setLoadingVideo(true);
      setPresentationVideo(null);
      setStreamUrl(null);

      getPresentationVideo(course.id)
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
  }, [isOpen, course?.id]);

  if (!course) return null;

  const handleWhatsApp = () => {
    // Si es un curso en USD (placeholder price), incluir el precio en el mensaje
    const isUSDCourse = course.priceARS === 99999999 && course.priceUSD > 0;
    const priceInfo = isUSDCourse
      ? ` (USD ${course.priceUSD.toLocaleString('en-US')})`
      : '';
    const message = `Hola! Me interesa el curso de ${course.title}${priceInfo}. Necesito más información.`;
    const whatsappUrl = `https://wa.me/5491153336627?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBuyCourse = async () => {
    // Verificar autenticación antes de agregar al carrito
    if (!isAuthenticated) {
      onClose(); // Cerrar modal
      router.push('/es/login');
      return;
    }

    // Verificar si ya está en el carrito
    const alreadyInCart = isInCart(course.id);
    if (alreadyInCart) {
      // Si ya está en el carrito, ir directamente al carrito
      onClose();
      router.push('/es/compra-de-cursos');
      return;
    }

    // Agregar curso al carrito (usando API del backend)
    setAddingToCart(true);
    const success = await addCourse(course.id);
    setAddingToCart(false);

    if (success) {
      onClose();
      router.push('/es/compra-de-cursos');
    } else {
      // El error ya fue manejado por useCart
      showError(
        'No se pudo agregar el curso al carrito. Por favor intenta nuevamente.'
      );
    }
  };

  // Si el precio ARS es placeholder (99.999.999), mostrar USD
  const isPlaceholderPrice = course.priceARS === 99999999;

  // Determinar qué precio mostrar
  const displayPrice =
    isPlaceholderPrice && course.priceUSD > 0
      ? `USD ${course.priceUSD.toLocaleString('en-US')}`
      : course.priceDisplay;

  // Para usuarios internacionales, mostrar opción de WhatsApp con USD (solo si NO es placeholder)
  const showUSDOption =
    !isPlaceholderPrice && course.priceUSD && course.priceUSD > 0;

  // Check if course is already in cart
  const courseInCart = isInCart(course.id);
  const buttonDisabled = addingToCart || cartLoading;

  // Function to render text with paragraph breaks and bold support
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='w-full max-w-4xl h-[90vh] mx-auto bg-white rounded-lg flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          <div className='relative'>
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
                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2'>
                    <p className='text-xs text-amber-800'>
                      ⚠️ El backend requiere configuración adicional para videos
                      públicos
                    </p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    El endpoint{' '}
                    <code className='bg-gray-200 px-1 rounded text-[10px]'>
                      /videos/:id/stream
                    </code>{' '}
                    debe permitir acceso público para videos con{' '}
                    <code className='bg-gray-200 px-1 rounded text-[10px]'>
                      order = 0
                    </code>
                  </p>
                </div>
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
          </div>

          <div className='bg-white px-6 py-6'>
            <div className='text-left space-y-4'>
              <div className='flex justify-start'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/browes.svg'
                  alt='Brushes decoration'
                  className='h-42 opacity-80'
                />
              </div>

              <h2 className='text-3xl font-primary font-black text-[#660e1b] text-left leading-tight mt-[-2.5rem]'>
                {course.title}
              </h2>
            </div>
          </div>

          <div className='px-6 pb-6 bg-white space-y-6'>
            <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
              {course.long_description ? (
                renderTextWithParagraphs(course.long_description)
              ) : course.modalContent?.detailedDescription ? (
                renderTextWithParagraphs(
                  course.modalContent.detailedDescription
                )
              ) : (
                <p className='text-[#2b2b2b] leading-relaxed text-left'>
                  {course.description ||
                    `Descubre las técnicas más avanzadas de ${course.title.toLowerCase()}. Este curso te proporcionará todas las herramientas necesarias para perfeccionar tu técnica y ofrecer resultados profesionales excepcionales.`}
                </p>
              )}
            </div>

            <div className='bg-gradient-to-r from-[#f9bbc4] to-[#eba2a8] p-6 rounded-lg shadow-lg'>
              {/* Desktop layout */}
              {isPlaceholderPrice ? (
                /* Cursos en USD: Solo WhatsApp */
                <div className='hidden md:flex items-center justify-between'>
                  <div className='flex-1 text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
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
                /* Cursos en ARS: Carrito + WhatsApp */
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
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
                    </p>
                    {showUSDOption && (
                      <p className='text-white/90 text-sm mt-1'>
                        También disponible en U$S {course.priceUSD}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleBuyCourse}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={buttonDisabled}
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Agregando...
                      </>
                    ) : courseInCart ? (
                      <>
                        <CheckCircle className='w-4 h-4' />
                        Ver Carrito
                      </>
                    ) : (
                      <>
                        <ShoppingCart className='w-4 h-4' />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Mobile layout */}
              {isPlaceholderPrice ? (
                /* Cursos en USD: Solo WhatsApp */
                <div className='md:hidden space-y-4'>
                  <div className='text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
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
                /* Cursos en ARS: Carrito + WhatsApp */
                <div className='md:hidden space-y-4'>
                  <div className='text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
                    </p>
                    {showUSDOption && (
                      <p className='text-white/90 text-sm mt-1'>
                        También disponible en U$S {course.priceUSD}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-col space-y-3'>
                    <button
                      onClick={handleBuyCourse}
                      className='py-4 px-8 rounded-full font-primary font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-[#660e1b] hover:bg-[#4a0a14] text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full'
                      disabled={buttonDisabled}
                    >
                      {addingToCart ? (
                        <>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          Agregando...
                        </>
                      ) : courseInCart ? (
                        <>
                          <CheckCircle className='w-5 h-5' />
                          Ver Carrito
                        </>
                      ) : (
                        <>
                          <ShoppingCart className='w-5 h-5' />
                          Agregar al Carrito
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

            {/* ¿Qué incluye? - Prioridad a includes_category sobre modalContent.includes */}
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
            ) : (
              course.modalContent?.includes &&
              course.modalContent.includes.length > 0 && (
                <div>
                  <h3 className='text-2xl font-primary font-bold text-[#660e1b] mb-6 text-center'>
                    ¿Qué incluye este curso?
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {course.modalContent.includes.map((item, index) => (
                      <CourseInclude
                        key={index}
                        icon={item.icon}
                        iconImage={item.iconImage}
                        text={item.text}
                      />
                    ))}
                  </div>
                </div>
              )
            )}

            {course.modalContent?.specialNotes && (
              <div className='bg-gradient-to-r from-[#f9bbc4] to-[#eba2a8] p-4 rounded-lg text-center'>
                <p className='text-white font-primary font-bold text-lg'>
                  {course.modalContent.specialNotes}
                </p>
              </div>
            )}

            {course?.target?.trim() !== '' && (
              <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                <h3 className='text-xl font-primary font-bold text-[#660e1b] mb-4'>
                  ¿A quién está dirigido?
                </h3>
                <p className='text-[#2b2b2b] leading-relaxed'>
                  {course.target ||
                    course.modalContent?.targetAudience ||
                    `Este curso está diseñado para profesionales de la belleza que desean perfeccionar sus técnicas en ${course.title.toLowerCase()}, desde principiantes con conocimientos básicos hasta expertos que buscan actualizar sus métodos y obtener resultados más naturales y duraderos.`}
                </p>
              </div>
            )}

            {course.modalContent?.additionalInfo && (
              <div className='bg-white p-4 rounded-lg border border-[#e9ecef] text-center'>
                <p className='text-[#2b2b2b] text-sm'>
                  {course.modalContent.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
