'use client';
import { Course } from './types/course';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isPromoDisabled, arePurchaseButtonsActive, PROMO_CONFIG } from '@/lib/promo-config';
import { X } from 'lucide-react';
import OfertasCourseModal from './ofertas-course-modal';

const WHATSAPP_NUMBER = '5491153336627';

interface CourseCardProps {
  course?: Course;
  onOpenModal?: (course: Course) => void;
  // Props alternativas para página de ofertas
  id?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  priceARS?: number;
  priceUSD?: number;
  showDiscount?: boolean;
  discountPercentage?: number;
}

// Función para formatear números con separadores de miles
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function CourseCard({ 
  course, 
  onOpenModal,
  id,
  name,
  description,
  thumbnailUrl,
  priceARS,
  priceUSD,
  showDiscount = false,
  discountPercentage = 0
}: CourseCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoadingMP, setIsLoadingMP] = useState(false);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [showOfertasModal, setShowOfertasModal] = useState(false);
  const promoDisabled = isPromoDisabled();
  const purchaseButtonsActive = arePurchaseButtonsActive();
  
  // Usar datos del curso o props individuales
  // Remover el símbolo ® del título
  const rawTitle = course?.title || name || '';
  let cardTitle = rawTitle.replace(/®/g, '').trim();
  
  // Convertir " - MODULO X" o " - MÓDULO X" a "(Módulo X)"
  cardTitle = cardTitle.replace(/\s*-\s*M[ÓO]DULO\s+(\d+)/gi, ' (Módulo $1)');
  
  // Verificar si es Auto Styling
  const isAutoStyling = cardTitle.toLowerCase().includes('auto styling') || cardTitle.toLowerCase().includes('autostyling');
  
  // Remover "(Módulo X)" de Auto Styling si lo tiene
  if (isAutoStyling) {
    cardTitle = cardTitle.replace(/\s*\(M[ÓO]DULO\s+\d+\)/gi, '').trim();
  }
  
  // Agregar "(Módulo 1)" a "ESTILISMO DE CEJAS" si no lo tiene (excepto Auto Styling)
  if (cardTitle.toLowerCase().includes('estilismo de cejas') && !cardTitle.toLowerCase().includes('módulo') && !isAutoStyling) {
    cardTitle = `${cardTitle} (Módulo 1)`;
  }
  const cardDescription = course?.description || description || '';
  const cardPrice = course?.price || priceARS || 0;
  const cardImage = thumbnailUrl || '';
  const courseId = course?.id || id || '';
  
  // Verificar si es Nanoblading o Camuflaje Senior
  const isSpecialCourse = cardTitle.toLowerCase().includes('nanoblading') || 
                          cardTitle.toLowerCase().includes('camuflaje senior') ||
                          cardTitle.toLowerCase().includes('camuflaje señor');

  // Calcular precio con descuento
  // Para cursos especiales, usar precio USD; para otros, usar ARS
  const basePrice = isSpecialCourse ? (priceUSD || 0) : (typeof cardPrice === 'number' ? cardPrice : parseFloat(cardPrice as string) || 0);
  const originalPrice = basePrice;
  const discountedPrice = showDiscount && discountPercentage > 0 
    ? originalPrice * (1 - discountPercentage / 100) 
    : originalPrice;

  // Función para comprar con MercadoPago
  const handleBuyFormation = async () => {
    // Si es curso especial, mostrar modal en lugar de ir a MercadoPago
    if (isSpecialCourse) {
      setShowSpecialModal(true);
      return;
    }

    if (!isAuthenticated || !user) {
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
            title: cardTitle,
            description: cardDescription || `Curso: ${cardTitle}`,
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
        window.open(paymentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoadingMP(false);
    }
  };

  // Función para abrir WhatsApp desde el modal especial
  const handleWhatsAppContact = () => {
    const message = `Hola! Me interesa ${cardTitle} con la promoción del ${PROMO_CONFIG.DISCOUNT_PERCENTAGE}% OFF.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowSpecialModal(false);
  };

  // Función para comprar exterior (WhatsApp)
  const handleBuyExterior = () => {
    const message = `Quiero comprar ${cardTitle} en USD por la promoción!`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Modal de ofertas especiales */}
      <OfertasCourseModal
        courseId={courseId?.toString() || ''}
        courseTitle={cardTitle}
        courseDescription={cardDescription}
        courseImage={cardImage}
        priceARS={typeof cardPrice === 'number' ? cardPrice : parseFloat(cardPrice as string) || 0}
        priceUSD={priceUSD || 0}
        originalPrice={originalPrice}
        discountedPrice={discountedPrice}
        isSpecialCourse={isSpecialCourse}
        isOpen={showOfertasModal}
        onClose={() => setShowOfertasModal(false)}
      />

      {/* Modal especial para Nanoblading y Camuflaje Senior */}
      {showSpecialModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={() => setShowSpecialModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-[var(--mg-pink-light)] rounded-2xl shadow-2xl max-w-md w-full p-8 relative pointer-events-auto animate-in zoom-in-95 duration-300 border border-[var(--mg-gray)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSpecialModal(false)}
                className="absolute top-4 right-4 text-[var(--mg-gray)] hover:text-[var(--mg-dark)] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[var(--mg-dark)] mb-4">
                  Información Importante
                </h3>
                <div className="space-y-3 text-[var(--mg-dark)]">
                  <p className="text-base">
                    Incluye clase presencial hasta el 15/2/26.
                  </p>
                  <p className="text-base">
                    El pago se coordina por otros medios.
                  </p>
                  <p className="text-base">
                    Comunicarse por{' '}
                    <button
                      onClick={handleWhatsAppContact}
                      className="text-[#5f0001] hover:text-[#4a0c13] font-bold underline transition-colors"
                    >
                      WhatsApp
                    </button>
                  </p>
                </div>
                <button
                  onClick={() => setShowSpecialModal(false)}
                  className="w-full bg-[var(--mg-pink-cta)] hover:bg-[var(--mg-pink)] text-[var(--mg-dark)] font-bold py-3 px-4 rounded-lg border border-[var(--mg-gray)] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className='bg-[var(--mg-pink-light)] text-[var(--mg-dark)] relative overflow-hidden h-full flex flex-col justify-between rounded-lg border border-[var(--mg-gray)] hover:shadow-lg transition-shadow duration-300'>
      {/* Imagen del curso si está disponible */}
      {cardImage && (
        <div className='relative w-full h-48 overflow-hidden'>
          <img 
            src={cardImage} 
            alt={cardTitle}
            className='w-full h-full object-cover'
          />
          {showDiscount && discountPercentage > 0 && (
            <div className='absolute top-3 left-3 bg-[#5f0001] text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse font-admin'>
              -{discountPercentage}%
            </div>
          )}
        </div>
      )}

      <div className='p-6 flex flex-col flex-grow'>
        {/* Course Title */}
        <div className='flex-grow'>
          <h3 className='text-lg font-primary-medium mb-2 uppercase tracking-wide leading-tight text-[var(--mg-dark)]'>
            {cardTitle}
          </h3>
          <p className='text-sm text-[var(--mg-gray)] mb-4 leading-relaxed line-clamp-3'>
            {cardDescription}
          </p>
        </div>

        {/* Price and Buttons */}
        <div className='mt-4 space-y-3'>
          <div>
            {showDiscount && discountPercentage > 0 ? (
              <div className='space-y-1'>
                <p className='text-sm text-[var(--mg-gray)] line-through'>
                  {isSpecialCourse ? `USD ${formatPrice(originalPrice)}` : `$${formatPrice(originalPrice)}`}
                </p>
                <div className='flex items-baseline gap-2'>
                  <p className='text-2xl font-primary-medium text-[var(--mg-dark)]'>
                    {isSpecialCourse ? `USD ${formatPrice(discountedPrice)}` : `$${formatPrice(discountedPrice)}`}
                  </p>
                  <span className='text-xs text-[var(--mg-burgundy)] font-bold'>
                    ¡AHORRÁS {isSpecialCourse ? `USD ${formatPrice(originalPrice - discountedPrice)}` : `$${formatPrice(originalPrice - discountedPrice)}`}!
                  </span>
                </div>
              </div>
            ) : (
              <p className='text-2xl font-primary-medium text-[var(--mg-dark)]'>
                {cardPrice === 'Consultar' || cardPrice === 0 ? 'Consultar' : (isSpecialCourse ? `USD ${formatPrice(originalPrice)}` : `$${formatPrice(originalPrice)}`)}
              </p>
            )}
          </div>
          
          {/* Botones cuando showDiscount está activo */}
          {showDiscount && (
            <div className='flex flex-col gap-2'>
              {/* Botón "Más información" que abre el modal */}
              <button
                onClick={() => setShowOfertasModal(true)}
                className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-[var(--mg-dark)] px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide rounded border border-[var(--mg-gray)]'
              >
                Más información
              </button>
              
              {/* Botones de compra directa (mantener funcionalidad original) */}
              {isSpecialCourse ? (
                <button
                  onClick={handleBuyFormation}
                  disabled={!purchaseButtonsActive}
                  className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-[var(--mg-dark)] px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide rounded border border-[var(--mg-gray)] disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {!purchaseButtonsActive ? 'Fuera del período de compra' : 'Comprar formación'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyFormation}
                    disabled={isLoadingMP || !purchaseButtonsActive}
                    className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-[var(--mg-dark)] px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide rounded border border-[var(--mg-gray)] disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoadingMP ? 'Procesando...' : !purchaseButtonsActive ? 'Fuera del período de compra' : 'Comprar formación'}
                  </button>
                  <button
                    onClick={handleBuyExterior}
                    disabled={!purchaseButtonsActive}
                    className='w-full bg-white hover:bg-gray-100 text-[var(--mg-dark)] px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide rounded border border-[var(--mg-gray)] disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {!purchaseButtonsActive ? 'Fuera del período de compra' : 'Comprar desde el exterior'}
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Botón normal si no hay descuento */}
          {!showDiscount && (
            <button
              onClick={() => {
                if (course && onOpenModal) {
                  onOpenModal(course);
                } else if (id) {
                  router.push(`/cursos/${id}`);
                }
              }}
              className='w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 text-sm font-primary-medium transition-colors duration-200 uppercase tracking-wide rounded'
            >
              Más Información
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
