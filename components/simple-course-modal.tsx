'use client';

import { Modal } from './ui/modal';
import CourseInclude from './course-include';
import { Course } from '@/types/course';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { Play, Loader2, ShoppingCart, CheckCircle, Landmark } from 'lucide-react';
import { BankTransferModal } from './bank-transfer-modal';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { getPresentationVideo } from '@/lib/api-client';
import { useModal } from '@/contexts/modal-context';
import { PROMO_CONFIG, isPromoActive } from '@/lib/promo-config';
import { INSTALLMENTS_CONFIG, INSTALLMENTS_DISCOUNT_HINT, PDF_CONFIG, PROPUESTA_PEDAGOGICA_PDF, PROPUESTA_PEDAGOGICA_PDF_BY_SLUG } from '@/lib/installments-config';
import { isAutostylismCourse } from '@/lib/utils';
import { MarkdownText } from './ui/markdown-text';

const AUTOSTYLING_BOOKING_URL = 'https://merygarciabooking.com/autostyling';

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
  const [bankModalCurrency, setBankModalCurrency] = useState<'ARS' | 'USD' | null>(null);
  const [bankModalAmount, setBankModalAmount] = useState<string>('');
  const [bankModalListAmount, setBankModalListAmount] = useState<string | undefined>(undefined);
  const [bankModalDiscountPercent, setBankModalDiscountPercent] = useState<number | undefined>(undefined);
  const [bankModalWhatsappMessage, setBankModalWhatsappMessage] = useState<string | undefined>(undefined);

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
    // Si es un curso en USD (placeholder price) y NO es gratuito, incluir el precio en el mensaje
    const isUSDCourse = course.priceARS === 99999999 && course.priceUSD > 0 && !course.isFree;
    const priceInfo = isUSDCourse
      ? ` (USD ${course.priceUSD.toLocaleString('en-US')})`
      : '';
    const message = `Hola chicas, como están? Quisiera más info sobre el curso de ${course.title}${priceInfo}`;
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

  // Si es un curso gratuito
  const isFreeCourse = course.isFree;
  const isUSDCourse = course.priceARS === 99999999 && course.priceUSD > 0;
  
  // Verificar si es Nanoblading o Camuflaje Senior (por título o slug)
  const isSpecialUSDCourse =
    course.title.toLowerCase().includes('nanoblading') ||
    course.slug.toLowerCase().includes('nanoblading') ||
    course.title.toLowerCase().includes('camuflaje senior') ||
    course.slug.toLowerCase().includes('camuflaje senior') ||
    course.title.toLowerCase().includes('camuflaje señor') ||
    course.slug.toLowerCase().includes('camuflaje señor');

  const pedagogicPdf = PROPUESTA_PEDAGOGICA_PDF_BY_SLUG[course.slug] ?? PROPUESTA_PEDAGOGICA_PDF;

  // Calcular precio original (ficticio) y precio final (real)
  // Para USD: solo Nanoblading y Camuflaje Senior tienen descuento ficticio
  // Para ARS: todos tienen descuento ficticio
  const discountMultiplier = 100 / (100 - PROMO_CONFIG.DISCOUNT_PERCENTAGE);
  const showFakeDiscount = isPromoActive() && !isFreeCourse && (
    (isUSDCourse && isSpecialUSDCourse && course.priceUSD > 0) ||
    (!isUSDCourse && course.priceARS > 0)
  );

  const originalPrice = showFakeDiscount
    ? isUSDCourse && isSpecialUSDCourse
      ? `USD ${Math.round(course.priceUSD * discountMultiplier).toLocaleString('en-US')}`
      : !isUSDCourse
      ? `$${Math.round(course.priceARS * discountMultiplier).toLocaleString('es-AR')}`
      : null
    : null;
  const finalPrice = showFakeDiscount
    ? isUSDCourse && isSpecialUSDCourse
      ? `USD ${course.priceUSD.toLocaleString('en-US')}`
      : !isUSDCourse
      ? `$${course.priceARS.toLocaleString('es-AR')}`
      : null
    : null;

  // Determinar qué precio mostrar (precio real)
  const displayPrice =
    isUSDCourse && course.priceUSD > 0
      ? `USD ${course.priceUSD.toLocaleString('en-US')}`
      : course.priceDisplay;

  // Para usuarios internacionales, mostrar opción de WhatsApp con USD (solo si NO es curso USD)
  const showUSDOption =
    !isUSDCourse && course.priceUSD && course.priceUSD > 0;

  const installmentsText = INSTALLMENTS_CONFIG[course.slug] ?? null;
  const isAutostylism = isAutostylismCourse(course.slug, course.title);
  // Cursos ARS regulares (no autostyling, no USD-only, no gratis) tienen
  // 20% OFF al pagar por transferencia. Autostyling tiene su propio 10%.
  const isRegularArsCourse =
    !isUSDCourse && !isAutostylism && !isFreeCourse && course.priceARS > 0;
  const handleAutostylingReserva = () => {
    window.open(AUTOSTYLING_BOOKING_URL, '_blank', 'noopener,noreferrer');
  };

  const openBankTransferModalARS = () => {
    setBankModalCurrency('ARS');
    if (isAutostylism && course.priceARS > 0) {
      const discounted = Math.round(course.priceARS * 0.9);
      setBankModalAmount(`$${discounted.toLocaleString('es-AR')}`);
      setBankModalListAmount(displayPrice ?? undefined);
      setBankModalDiscountPercent(10);
      setBankModalWhatsappMessage(
        'Hola, ya transferí para esta formación, quiero un turno para mi clase presencial también. Adjunto transferencia realizada.'
      );
    } else if (isRegularArsCourse) {
      const discounted = Math.round(course.priceARS * 0.8);
      setBankModalAmount(`$${discounted.toLocaleString('es-AR')}`);
      setBankModalListAmount(displayPrice ?? undefined);
      setBankModalDiscountPercent(20);
      setBankModalWhatsappMessage(undefined);
    } else {
      setBankModalAmount(showFakeDiscount && finalPrice ? finalPrice : (displayPrice ?? ''));
      setBankModalListAmount(undefined);
      setBankModalDiscountPercent(undefined);
      setBankModalWhatsappMessage(undefined);
    }
  };

  const openBankTransferModalUSD = () => {
    setBankModalCurrency('USD');
    setBankModalAmount(`USD ${course.priceUSD}`);
    setBankModalListAmount(undefined);
    setBankModalDiscountPercent(undefined);
    setBankModalWhatsappMessage(undefined);
  };

  // Check if course is already in cart
  const courseInCart = isInCart(course.id);
  const buttonDisabled = addingToCart || cartLoading;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='w-full max-w-4xl h-[90vh] mx-auto flex flex-col'>
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
                <MarkdownText className='text-[#2b2b2b]'>{course.long_description}</MarkdownText>
              ) : course.modalContent?.detailedDescription ? (
                <MarkdownText className='text-[#2b2b2b]'>{course.modalContent.detailedDescription}</MarkdownText>
              ) : (
                <p className='text-[#2b2b2b] leading-relaxed text-left'>
                  {course.description ||
                    `Descubre las técnicas más avanzadas de ${course.title.toLowerCase()}. Este curso te proporcionará todas las herramientas necesarias para perfeccionar tu técnica y ofrecer resultados profesionales excepcionales.`}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              {PDF_CONFIG[course.slug] && (
                <a
                  href={`/downloable/formaciones/${encodeURIComponent(PDF_CONFIG[course.slug])}`}
                  download
                  className='group flex items-center justify-between gap-3 w-full bg-[#fdf4f5] border border-[#f0e0e2] rounded-lg px-4 py-3 hover:border-[#eba2a8] hover:bg-[#fef8f8] transition-all duration-200'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 flex-shrink-0 text-[#eba2a8]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                    <div className='min-w-0'>
                      <p className='text-xs text-[#eba2a8] font-semibold uppercase tracking-wider leading-none mb-0.5'>Introducción al programa</p>
                      <p className='text-sm font-semibold text-[#2b2b2b] truncate'>Descargar el programa de {course.title}</p>
                    </div>
                  </div>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 flex-shrink-0 text-[#660e1b] group-hover:translate-y-0.5 transition-transform duration-200' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                  </svg>
                </a>
              )}

              <a
                href={`/downloable/formaciones/${encodeURIComponent(pedagogicPdf)}`}
                download
                className='group flex items-center justify-between gap-3 w-full bg-[#fdf4f5] border border-[#f0e0e2] rounded-lg px-4 py-3 hover:border-[#eba2a8] hover:bg-[#fef8f8] transition-all duration-200'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 flex-shrink-0 text-[#eba2a8]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                  <div className='min-w-0'>
                    <p className='text-xs text-[#eba2a8] font-semibold uppercase tracking-wider leading-none mb-0.5'>Propuesta pedagógica</p>
                    <p className='text-sm font-semibold text-[#2b2b2b] truncate'>Accedé a la propuesta pedagógica e información sobre la cursada</p>
                  </div>
                </div>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 flex-shrink-0 text-[#660e1b] group-hover:translate-y-0.5 transition-transform duration-200' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                </svg>
              </a>
            </div>

            <div className='bg-gradient-to-r from-[#f9bbc4] to-[#eba2a8] p-4 sm:p-6 rounded-lg shadow-lg'>
              {/* Desktop layout */}
              {isUSDCourse ? (
                /* Cursos en USD: Solo WhatsApp */
                <div className='hidden md:flex items-center justify-between'>
                  <div className='flex-1 text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
                    </p>
                    <p className='text-white/90 text-sm mt-2 font-semibold flex items-center justify-center gap-1.5'>
                      <FaWhatsapp className='w-4 h-4' />
                      Consultar por este curso vía WhatsApp
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
                /* Cursos en ARS: solo Carrito (WhatsApp se movió al final) */
                <div className='hidden md:flex items-center justify-between'>
                  <div className='text-center flex-1'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    {showFakeDiscount && originalPrice ? (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-center gap-2'>
                          <p className='text-lg text-white/70 line-through'>
                            {originalPrice}
                          </p>
                          <span className='bg-white text-[#8b1538] px-3 py-1 rounded-full text-sm font-bold font-primary-medium shadow-md'>
                            {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                          </span>
                        </div>
                        <div className='flex items-baseline justify-center gap-2'>
                          <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                            {displayPrice}
                          </p>
                          {installmentsText && (
                            <p className='text-white/80 text-sm'>({installmentsText})</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-baseline justify-center gap-2'>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        {installmentsText && (
                          <p className='text-white/80 text-sm'>({installmentsText})</p>
                        )}
                      </div>
                    )}
                    {installmentsText && (
                      <p className='text-[#660e1b] text-xs font-primary-medium mt-1 text-center'>
                        {INSTALLMENTS_DISCOUNT_HINT}
                      </p>
                    )}
                    {isRegularArsCourse && (
                      <p className='text-[#660e1b] text-xs font-primary-medium mt-1 text-center'>
                        20% OFF pagando por transferencia
                      </p>
                    )}
                    {!isAutostylism && (
                      <button
                        type='button'
                        onClick={openBankTransferModalARS}
                        className='mt-2 inline-flex items-center gap-1.5 bg-[#111111]/80 hover:bg-[#111111] text-white text-xs font-primary-medium px-3.5 py-2 rounded-full transition-all'
                      >
                        <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                        Pagar por transferencia bancaria
                      </button>
                    )}
                    {showUSDOption && !isAutostylism && (
                      <div className='mt-1.5 flex flex-col items-center gap-1'>
                        <p className='text-white text-sm font-primary-medium'>
                          Si residís en el exterior de Argentina
                        </p>
                        <button
                          type='button'
                          onClick={openBankTransferModalUSD}
                          className='inline-flex items-center gap-1.5 bg-[#111111]/80 hover:bg-[#111111] text-white text-xs font-primary-medium px-3.5 py-2 rounded-full transition-all'
                        >
                          <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                          U$S {course.priceUSD} · Transferencia / PayPal
                        </button>
                      </div>
                    )}
                  </div>

                  {isAutostylism ? (
                    <button
                      onClick={handleAutostylingReserva}
                      className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2'
                    >
                      Realizar Reserva
                    </button>
                  ) : (
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
                  )}
                </div>
              )}

              {/* Mobile layout */}
              {isUSDCourse ? (
                /* Cursos en USD: Solo WhatsApp */
                <div className='md:hidden space-y-4'>
                  <div className='text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                      {displayPrice}
                    </p>

                    <p className='text-white/90 text-sm mt-2 font-semibold flex items-center justify-center gap-1.5'>
                      <FaWhatsapp className='w-4 h-4' />
                      Consultar por este curso vía WhatsApp
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
                /* Cursos en ARS: solo Carrito (WhatsApp se movió al final) */
                <div className='md:hidden space-y-4'>
                  <div className='text-center'>
                    <h3 className='text-lg font-primary font-bold text-white mb-1'>
                      Inversión del Curso
                    </h3>
                    {showFakeDiscount && originalPrice ? (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-center gap-2'>
                          <p className='text-lg text-white/70 line-through'>
                            {originalPrice}
                          </p>
                          <span className='bg-white text-[#8b1538] px-3 py-1 rounded-full text-sm font-bold font-primary-medium shadow-md'>
                            {PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF
                          </span>
                        </div>
                        <div className='flex items-baseline justify-center gap-2'>
                          <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                            {displayPrice}
                          </p>
                          {installmentsText && (
                            <p className='text-white/80 text-sm'>({installmentsText})</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-baseline justify-center gap-2'>
                        <p className='text-3xl font-primary font-bold text-white drop-shadow-lg'>
                          {displayPrice}
                        </p>
                        {installmentsText && (
                          <p className='text-white/80 text-sm'>({installmentsText})</p>
                        )}
                      </div>
                    )}
                    {installmentsText && (
                      <p className='text-[#660e1b] text-xs font-primary-medium mt-1 text-center'>
                        {INSTALLMENTS_DISCOUNT_HINT}
                      </p>
                    )}
                    {isRegularArsCourse && (
                      <p className='text-[#660e1b] text-xs font-primary-medium mt-1 text-center'>
                        20% OFF pagando por transferencia
                      </p>
                    )}
                    {!isAutostylism && (
                      <button
                        type='button'
                        onClick={openBankTransferModalARS}
                        className='mt-2 inline-flex items-center gap-1.5 bg-[#111111]/80 hover:bg-[#111111] text-white text-xs font-primary-medium px-3.5 py-2 rounded-full transition-all'
                      >
                        <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                        Pagar por transferencia bancaria
                      </button>
                    )}
                    {showUSDOption && !isAutostylism && (
                      <div className='mt-1.5 flex flex-col items-center gap-1'>
                        <p className='text-white text-sm font-primary-medium'>
                          Si residís en el exterior de Argentina
                        </p>
                        <button
                          type='button'
                          onClick={openBankTransferModalUSD}
                          className='inline-flex items-center gap-1.5 bg-[#111111]/80 hover:bg-[#111111] text-white text-xs font-primary-medium px-3.5 py-2 rounded-full transition-all'
                        >
                          <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                          U$S {course.priceUSD} · Transferencia / PayPal
                        </button>
                      </div>
                    )}
                  </div>

                  {isAutostylism ? (
                    <button
                      onClick={handleAutostylingReserva}
                      className='py-4 px-8 rounded-full font-primary font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl bg-[#660e1b] hover:bg-[#4a0a14] text-white flex items-center gap-2 justify-center w-full'
                    >
                      Realizar Reserva
                    </button>
                  ) : (
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
                  )}
                </div>
              )}
            </div>

            {/* Modalidad */}
            {course.modalidad && course.modalidad.trim() !== '' && (
              <div className='bg-[#faf6f7] p-6 rounded-lg border border-[#f0e6e8]'>
                <h3 className='text-xl font-primary font-bold text-[#660e1b] mb-3 text-center'>
                  Modalidad
                </h3>
                <MarkdownText className='text-[#2b2b2b] text-center'>{course.modalidad}</MarkdownText>
              </div>
            )}

            {/* ¿Qué aprenderás? */}
            {course.learn && course.learn.trim() !== '' && (
              <div className='bg-white p-6 rounded-lg border border-[#f0e6e8]'>
                <h3 className='text-2xl font-primary font-bold text-[#660e1b] mb-4'>
                  INFORMACIÓN SOBRE LA CURSADA
                </h3>
                <MarkdownText className='text-[#2b2b2b]'>{course.learn}</MarkdownText>
              </div>
            )}

            {/* ¿Qué incluye? - Prioridad a includes_category sobre modalContent.includes */}
            {course.includes_category && course.includes_category.length > 0 ? (
              <div>
                <h3 className='text-2xl font-primary font-bold text-[#660e1b] mb-6 text-center'>
                  ¿Qué incluye este curso?
                </h3>
                {(() => {
                  const required = course.includes_category!.filter(i => !(i.texto || i.text || '').startsWith('OPCIONAL:'));
                  const optional = course.includes_category!.filter(i => (i.texto || i.text || '').startsWith('OPCIONAL:'));
                  return (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {required.map((item, index) => (
                          <CourseInclude
                            key={index}
                            iconImage={item.url_icon}
                            text={item.texto || item.text || ''}
                          />
                        ))}
                      </div>
                      {optional.length > 0 && (
                        <div className='mt-8'>
                          <h4 className='text-lg font-primary font-bold text-[#660e1b] mb-4 text-center tracking-wide'>
                            OPCIONALES DE LA CURSADA:
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {optional.map((item, index) => (
                              <CourseInclude
                                key={index}
                                iconImage={item.url_icon}
                                text={(item.texto || item.text || '').slice('OPCIONAL:'.length).trimStart()}
                              />
                            ))}
                          </div>
                          <p className='text-center text-sm text-gray-500 mt-4 italic'>
                            (Consultar valor adicional, horarios y fechas disponibles)
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
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

            {/* Botón WhatsApp */}
            <div className='flex justify-center'>
              <button
                onClick={handleWhatsApp}
                className='bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-8 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 transform'
              >
                <FaWhatsapp className='w-5 h-5' />
                Consultar por WhatsApp
              </button>
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

    <BankTransferModal
      isOpen={bankModalCurrency !== null}
      onClose={() => setBankModalCurrency(null)}
      currency={bankModalCurrency ?? 'ARS'}
      amount={bankModalAmount}
      listAmount={bankModalListAmount}
      discountPercent={bankModalDiscountPercent}
      whatsappMessage={bankModalWhatsappMessage}
    />
    </>
  );
}
