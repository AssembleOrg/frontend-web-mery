/**
 * Configuración central de la promoción de ofertas especiales
 *
 * Para actualizar las fechas de la promoción, modifica las constantes aquí.
 * Los cambios se aplicarán automáticamente en:
 * - Modal promocional
 * - Página de ofertas especiales
 * - Contadores regresivos
 */

import { DateTime } from 'luxon';

export const PROMO_CONFIG = {
  // Fechas de inicio y fin de la promoción (GMT-3, Buenos Aires)
  // Promoción hasta el 26 de enero de 2026 a las 23:59
  START_DATE: DateTime.fromObject(
    { year: 2026, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  END_DATE: DateTime.fromObject(
    { year: 2026, month: 1, day: 26, hour: 23, minute: 59, second: 59 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  // Fecha de desactivación completa (después de esta fecha se bloquea todo)
  DISABLE_DATE: DateTime.fromObject(
    { year: 2026, month: 1, day: 27, hour: 1, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  // Período de compra activo
  PURCHASE_START: DateTime.fromObject(
    { year: 2026, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  PURCHASE_END: DateTime.fromObject(
    { year: 2026, month: 1, day: 26, hour: 23, minute: 59, second: 59 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),

  // Porcentaje de descuento
  DISCOUNT_PERCENTAGE: 50,

  // Intervalo para mostrar el modal nuevamente (en milisegundos)
  // Mostrar cada 15 minutos
  MODAL_SHOW_INTERVAL: 15 * 60 * 1000,

  // Delay antes de mostrar el modal por primera vez (en milisegundos)
  MODAL_INITIAL_DELAY: 2000, // 2 segundos

  // Textos configurables
  TEXTS: {
    modalTitle: '50% OFF',
    modalSubtitle: 'en todas las formaciones',
    modalDateRange: 'Hasta el 26 de Enero',
    modalCTA: 'Ver Formaciones',
    modalDescription:
      'No dejes pasar esta oportunidad para sumar nuevos servicios y/o perfeccionar tus resultados',

    pageTitle: '50% OFF',
    pageSubtitle: 'En todas las formaciones',
    pageSubtitleExtra: '( Incluye Nanoblading & Camuflaje )',
    pageDescription:
      'Las últimas técnicas en Cosmetic Tattoo y servicios Premium 50% OFF',

    navbarLink: 'OFERTAS ESPECIALES',

    countdownActive: 'La oferta termina en:',
    countdownBeforeStart: 'La oferta comienza en:',
    countdownEnded: '¡No te pierdas estos descuentos!',
  },
} as const;

// Funciones de utilidad

/**
 * Verifica si la promoción está activa actualmente
 */
export function isPromoActive(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now >= PROMO_CONFIG.START_DATE && now <= PROMO_CONFIG.END_DATE;
}

/**
 * Verifica si la promoción ha terminado
 */
export function isPromoEnded(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now > PROMO_CONFIG.END_DATE;
}

/**
 * Verifica si la promoción aún no ha comenzado
 */
export function isPromoUpcoming(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now < PROMO_CONFIG.START_DATE;
}

/**
 * Verifica si la promoción está completamente desactivada (después del 13/12 a la 1 AM)
 */
export function isPromoDisabled(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now >= PROMO_CONFIG.DISABLE_DATE;
}

/**
 * Verifica si los botones de compra están activos
 * Solo activos entre las 00:00 del 6/12 y las 00:00 del 13/12
 */
export function arePurchaseButtonsActive(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now >= PROMO_CONFIG.PURCHASE_START && now < PROMO_CONFIG.PURCHASE_END;
}

/**
 * Calcula el precio con descuento
 */
export function calculateDiscountedPrice(originalPrice: number): number {
  return originalPrice * (1 - PROMO_CONFIG.DISCOUNT_PERCENTAGE / 100);
}

/**
 * Calcula el ahorro
 */
export function calculateSavings(originalPrice: number): number {
  return originalPrice - calculateDiscountedPrice(originalPrice);
}

/**
 * Obtiene el tiempo restante hasta el inicio o fin de la promoción
 */
export function getTimeUntilPromoChange(): {
  target: 'start' | 'end' | 'none';
  milliseconds: number;
} {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');

  if (isPromoUpcoming()) {
    const diff = PROMO_CONFIG.START_DATE.diff(now);
    return {
      target: 'start',
      milliseconds: diff.toMillis(),
    };
  }

  if (isPromoActive()) {
    const diff = PROMO_CONFIG.END_DATE.diff(now);
    return {
      target: 'end',
      milliseconds: diff.toMillis(),
    };
  }

  return {
    target: 'none',
    milliseconds: 0,
  };
}
