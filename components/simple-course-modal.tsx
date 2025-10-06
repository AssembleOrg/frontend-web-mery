'use client';

import { Modal } from './ui/modal';
import CourseInclude from './course-include';
import { Course } from '@/types/course';
import { useCartStore } from '@/stores/cart-store';
import { useRouter } from 'next/navigation';
import { Play, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!course) return null;

  const handleWhatsApp = () => {
    const message = `Hola! Me interesa el curso de ${course.title}. Necesito más información.`;
    const whatsappUrl = `https://wa.me/5491153336627?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBuyCourse = () => {
    if (course.currency === 'USD') {
      // Cursos en USD van a WhatsApp
      handleWhatsApp();
      return;
    }

    // Verificar autenticación antes de agregar al carrito
    if (!isAuthenticated) {
      onClose(); // Cerrar modal
      router.push('/es/login');
      return;
    }

    addToCart(course);
    router.push('/es/compra-de-cursos');
  };

  const isUSDCourse = course.currency === 'USD';

  // Function to render text with paragraph breaks
  const renderTextWithParagraphs = (text: string) => {
    const paragraphs = text
      .split('\n\n')
      .filter((paragraph) => paragraph.trim() !== '');
    return (
      <div className='space-y-4'>
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className='text-[#2b2b2b] leading-relaxed text-left'
          >
            {paragraph.trim()}
          </p>
        ))}
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
                  [Creando containers]
                </p>
              </div>
            </div>
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
              {course.modalContent?.detailedDescription ? (
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
              <div
                className={`hidden md:flex items-center ${
                  isUSDCourse ? 'flex-col space-y-4' : 'justify-between'
                }`}
              >
                {!isUSDCourse && (
                  <button
                    onClick={handleWhatsApp}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 transform'
                  >
                    <MessageCircle className='w-4 h-4' />
                    WhatsApp
                  </button>
                )}

                <div className='text-center'>
                  <h3 className='text-lg font-primary font-bold text-white mb-1'>
                    Inversión del Curso
                  </h3>
                  <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                    {course.priceDisplay}
                  </p>
                  <p className='text-white/90 text-xs mt-1'>
                    Incluye certificación y materiales
                  </p>
                </div>

                {!isUSDCourse ? (
                  <button
                    onClick={handleBuyCourse}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform'
                  >
                    🛒 Comprar
                  </button>
                ) : (
                  <button
                    onClick={handleBuyCourse}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform'
                  >
                    💬 Consultar
                  </button>
                )}
              </div>

              <div className='md:hidden space-y-4'>
                <div className='text-center'>
                  <h3 className='text-lg font-primary font-bold text-white mb-1'>
                    Inversión del Curso
                  </h3>
                  <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                    {course.priceDisplay}
                  </p>
                  <p className='text-white/90 text-xs mt-1'>
                    Incluye certificación y materiales
                  </p>
                </div>

                <div className='flex flex-col space-y-3'>
                  <button
                    onClick={handleBuyCourse}
                    className={`py-4 px-8 rounded-full font-primary font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isUSDCourse
                        ? 'bg-[#660e1b] hover:bg-[#4a0a14] text-white'
                        : 'bg-[#660e1b] hover:bg-[#4a0a14] text-white'
                    }`}
                  >
                    {isUSDCourse ? '💬 Consultar Precio' : '🛒 Comprar Curso'}
                  </button>

                  {!isUSDCourse && (
                    <button
                      onClick={handleWhatsApp}
                      className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center hover:scale-105 transform'
                    >
                      <MessageCircle className='w-4 h-4' />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>

            {course.modalContent?.includes &&
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
              )}

            {course.modalContent?.specialNotes && (
              <div className='bg-gradient-to-r from-[#f9bbc4] to-[#eba2a8] p-4 rounded-lg text-center'>
                <p className='text-white font-primary font-bold text-lg'>
                  {course.modalContent.specialNotes}
                </p>
              </div>
            )}

            <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
              <h3 className='text-xl font-primary font-bold text-[#660e1b] mb-4'>
                ¿A quién está dirigido?
              </h3>
              <p className='text-[#2b2b2b] leading-relaxed'>
                {course.modalContent?.targetAudience ||
                  `Este curso está diseñado para profesionales de la belleza que desean perfeccionar sus técnicas en ${course.title.toLowerCase()}, desde principiantes con conocimientos básicos hasta expertos que buscan actualizar sus métodos y obtener resultados más naturales y duraderos.`}
              </p>
            </div>

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
