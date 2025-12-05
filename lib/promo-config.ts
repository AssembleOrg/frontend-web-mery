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
  START_DATE: DateTime.fromObject(
    { year: 2025, month: 12, day: 6, hour: 0, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  END_DATE: DateTime.fromObject(
    { year: 2025, month: 12, day: 10, hour: 23, minute: 59, second: 59 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  // Fecha de desactivación completa (después de esta fecha se bloquea todo)
  DISABLE_DATE: DateTime.fromObject(
    { year: 2025, month: 12, day: 11, hour: 1, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  // Período de compra activo: desde 00:00 del 6/12 hasta 00:00 del 11/12
  PURCHASE_START: DateTime.fromObject(
    { year: 2025, month: 12, day: 6, hour: 0, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),
  PURCHASE_END: DateTime.fromObject(
    { year: 2025, month: 12, day: 11, hour: 0, minute: 0, second: 0 },
    { zone: 'America/Argentina/Buenos_Aires' }
  ),

  // Porcentaje de descuento
  DISCOUNT_PERCENTAGE: 50,

  // Intervalo para mostrar el modal nuevamente (en milisegundos)
  //mostrar cada 15 minutos
  // MODAL_SHOW_INTERVAL: 15 * 60 * 1000,
  MODAL_SHOW_INTERVAL: 0 * 60 * 1000,

  // Delay antes de mostrar el modal por primera vez (en milisegundos)
  MODAL_INITIAL_DELAY: 2000, // 2 segundos

  // Textos configurables
  TEXTS: {
    modalTitle: '50% OFF',
    modalSubtitle: 'en todas las formaciones',
    modalDateRange: 'Del 6 al 10 de Diciembre',
    modalCTA: 'Ver Ofertas Especiales',
    modalDescription:
      'No dejes pasar esta oportunidad para sumar nuevos servicios y/o perfeccionar tus resultados',

    pageTitle: '50% OFF',
    pageSubtitle: 'En todas las formaciones',
    pageSubtitleExtra: '(Incluye nanoblading y camuflaje)',
    pageDescription:
      'Las últimas técnicas en Cosmetic Tattoo y servicios Premium 50% OFF',

    navbarLink: 'OFERTAS ESPECIALES',

    countdownActive: 'La promoción termina en:',
    countdownBeforeStart: 'La promoción comienza en:',
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
 * Verifica si la promoción está completamente desactivada (después del 11/12 a la 1 AM)
 */
export function isPromoDisabled(): boolean {
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  return now >= PROMO_CONFIG.DISABLE_DATE;
}

/**
 * Verifica si los botones de compra están activos
 * Solo activos entre las 00:00 del 6/12 y las 00:00 del 11/12
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
