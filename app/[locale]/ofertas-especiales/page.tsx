'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import CourseCard from '@/components/course-card';
import { Loader2, Clock, Sparkles } from 'lucide-react';
import {
  PROMO_CONFIG,
  isPromoDisabled,
  isPromoActive,
  isPromoUpcoming,
} from '@/lib/promo-config';
import { DateTime } from 'luxon';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const WHATSAPP_NUMBER = '5491153336627';

interface Course {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  priceARS: number;
  priceUSD: number;
  duration?: string;
  level?: string;
  isActive: boolean;
}

interface TimeLeft {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export default function OfertasEspecialesPage() {
  const t = useTranslations();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [countdownText, setCountdownText] = useState('La oferta termina en:');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
      const startDate = PROMO_CONFIG.START_DATE;
      const endDate = PROMO_CONFIG.END_DATE;

      // Determinar el target y el texto según la fecha actual
      let target: DateTime;
      let text: string;

      if (now < startDate) {
        // Antes del inicio: contar hacia START_DATE
        target = startDate;
        text = PROMO_CONFIG.TEXTS.countdownBeforeStart;
      } else if (now >= startDate && now <= endDate) {
        // Durante la promoción: contar hacia END_DATE
        target = endDate;
        text = PROMO_CONFIG.TEXTS.countdownActive;
      } else {
        // Después de la promoción
        setTimeLeft({ days: 0, hours: '00', minutes: '00', seconds: '00' });
        setCountdownText(PROMO_CONFIG.TEXTS.countdownEnded);
        return;
      }

      const diff = target.diff(now, ['days', 'hours', 'minutes', 'seconds']);

      if (diff.toMillis() <= 0) {
        setTimeLeft({ days: 0, hours: '00', minutes: '00', seconds: '00' });
        setCountdownText(PROMO_CONFIG.TEXTS.countdownEnded);
        return;
      }

      setCountdownText(text);
      setTimeLeft({
        days: Math.floor(diff.days),
        hours: Math.floor(diff.hours % 24)
          .toString()
          .padStart(2, '0'),
        minutes: Math.floor(diff.minutes % 60)
          .toString()
          .padStart(2, '0'),
        seconds: Math.floor(diff.seconds % 60)
          .toString()
          .padStart(2, '0'),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/all`);

      if (!response.ok) throw new Error('Error al cargar formaciones');

      const result = await response.json();
      const coursesData = result.data || [];

      // Filtrar: solo activos y excluir "private sessions"
      setCourses(
        coursesData.filter(
          (course: Course) =>
            course.isActive &&
            !course.name.toLowerCase().includes('private sessions') &&
            !course.name.toLowerCase().includes('private session')
        )
      );
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si la promoción está desactivada
  const promoDisabled = isPromoDisabled();

  if (promoDisabled) {
    return (
      <div className='min-h-screen bg-[var(--mg-pink-light)]'>
        <Navigation />
        <div className='max-w-4xl mx-auto px-4 py-20 text-center'>
          <h1 className='text-4xl font-bold text-[var(--mg-dark)] mb-4'>
            Promoción Finalizada
          </h1>
          <p className='text-lg text-[var(--mg-gray)] mb-8'>
            La promoción especial ha finalizado. Gracias por tu interés.
          </p>
          <a
            href='/formaciones'
            className='inline-block bg-[var(--mg-pink-cta)] hover:bg-[var(--mg-pink)] text-[var(--mg-dark)] font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
          >
            Ver Formaciones
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--mg-pink-light)]'>
      <Navigation />
      {/* Header con banner de promoción */}
      <div
        className='py-12 px-4 font-admin'
        style={{ backgroundColor: '#5f0001' }}
      >
        <div className='max-w-7xl mx-auto'>
          <div className='text-center space-y-6'>
            {/* Badge */}
            <div className='inline-flex items-center bg-[#fbe8ea]/30 px-6 py-2 rounded-full text-[#fbe8ea]'>
              <span className='font-bold tracking-wider text-sm uppercase'>
                por tiempo limitado
              </span>
            </div>

            {/* Título principal */}
            <div className='space-y-3 text-[#fbe8ea]'>
              <h1 className='text-5xl md:text-7xl font-bold'>
                {PROMO_CONFIG.TEXTS.pageTitle}
              </h1>
              <p className='text-xl md:text-2xl font-semibold'>
                {PROMO_CONFIG.TEXTS.pageSubtitle}
              </p>
              <p className='text-sm md:text-base font-semibold'>
                {PROMO_CONFIG.TEXTS.pageSubtitleExtra}
              </p>
              <p className='text-base md:text-lg opacity-90'>
                {PROMO_CONFIG.TEXTS.modalDateRange}
                <br />
                <br />
                No dejes pasar esta oportunidad para sumar nuevos servicios y/o
                perfeccionar tus resultados
                <br />
                Las últimas técnicas en Cosmetic Tattoo y servicios Premiun 50%
                OFF
              </p>
            </div>

            {/* Contador regresivo */}
            <div className='flex justify-center pt-4'>
              <div className='px-8 py-6'>
                <div className='flex items-center gap-2 mb-3 justify-center'>
                  <Clock className='w-5 h-5 text-[#fbe8ea]' />
                  <p className='text-sm font-semibold text-[#fbe8ea]'>{countdownText}</p>
                </div>
                <div className='flex gap-4'>
                  {[
                    { value: timeLeft.days, label: 'Días' },
                    { value: timeLeft.hours, label: 'Horas' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Seg' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className='flex flex-col items-center '
                    >
                      <div
                        id={`countdown-number-${idx}`}
                        className='countdown-number-box rounded-lg px-4 py-3 min-w-[70px] font-mono text-3xl font-bold bg-(--mg-pink-cta)'
                      >
                        {item.value}
                      </div>
                      <span className='text-xs mt-2 font-medium text-[#fbe8ea]'>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className='max-w-7xl mx-auto px-4 py-16 font-admin'>
        {/* Sección de explicación */}
        <div className='text-center mb-12 space-y-4'>
          <h2 className='text-3xl font-bold text-[var(--mg-dark)]'>
            No dejes pasar esta oportunidad para sumar nuevos servicios y/o
            perfeccionar tus resultados
          </h2>
          <p className='text-lg text-[var(--mg-gray)] max-w-2xl mx-auto'>
            {PROMO_CONFIG.TEXTS.pageDescription}
          </p>
        </div>

        {/* Grid de cursos */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-12 h-12 text-pink-600 animate-spin' />
          </div>
        ) : courses.length === 0 ? (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-lg'>
              No hay formaciones disponibles en este momento
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {courses.map((course) => (
              <div
                key={course.id}
                className='relative group flex flex-col'
              >
                {/* Badge de descuento flotante */}
                <div className='absolute -top-4 -right-4 z-10'>
                  <div className='bg-[#5f0001] text-white px-4 py-2 rounded-full font-bold text-lg shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300 font-admin'>
                    -{PROMO_CONFIG.DISCOUNT_PERCENTAGE}%
                  </div>
                </div>

                {/* Card del curso con overlay de descuento */}
                <div className='relative overflow-hidden rounded-2xl border border-[var(--mg-gray)] hover:border-[var(--mg-gray)] transition-all duration-300 shadow-lg hover:shadow-2xl flex-1 flex flex-col'>
                  {/* Efecto de brillo */}
                  <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                  <CourseCard
                    id={course.id}
                    name={course.name}
                    description={course.description}
                    thumbnailUrl={course.thumbnailUrl}
                    priceARS={course.priceARS}
                    priceUSD={course.priceUSD}
                    showDiscount={true}
                    discountPercentage={PROMO_CONFIG.DISCOUNT_PERCENTAGE}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer informativo */}
        <div className='mt-16 bg-[var(--mg-pink-light)] rounded-2xl p-8 text-center border border-[var(--mg-pink)]'>
          <h3 className='text-2xl font-bold text-[var(--mg-dark)] mb-3'>
            ¿Tenés dudas?
          </h3>
          <p className='text-[var(--mg-gray)] mb-4'>
            Comunícate con nosotros para ayudarte a elegir junt@s la formación
            para vos!
          </p>
          <a
            href='/contact'
            className='inline-block bg-[var(--mg-pink-cta)] hover:bg-[var(--mg-pink)] text-[var(--mg-dark)] font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
          >
            Contactar
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
