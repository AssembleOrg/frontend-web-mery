import type { MentorshipProduct } from '@/lib/mentorship-api';

/**
 * Promo 3x2 de mentorías: se eligen 3 mentorías (se pueden mezclar) y se
 * pagan las 2 más caras; la tercera es de regalo. Las clases one-to-one no
 * entran. No se muestra fecha de vencimiento: se apaga sola al pasar END.
 */
export const MENTORSHIP_3X2 = {
  BUY: 3,
  PAY: 2,
  // Último día: 31/03/2027 (hora de Argentina).
  END: new Date('2027-03-31T23:59:59-03:00'),
} as const;

export function isMentorship3x2Active(now: Date = new Date()): boolean {
  return now <= MENTORSHIP_3X2.END;
}

/** Precio de una mentoría en la moneda pedida (primera variante activa). */
export function mentorshipPrice(
  product: MentorshipProduct,
  currency: 'ARS' | 'USD',
): number | null {
  const variant = product.variants.find(
    (v) => v.isActive !== false && v.currency === currency,
  );
  if (!variant) return null;
  const amount = Number(variant.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export interface Promo3x2Quote {
  subtotal: number;
  /** Precio de la mentoría de regalo (la más barata). */
  gift: number;
  total: number;
}

/** Cotiza exactamente 3 precios; null si no son 3. */
export function quote3x2(prices: number[]): Promo3x2Quote | null {
  if (prices.length !== MENTORSHIP_3X2.BUY) return null;
  const subtotal = prices.reduce((a, b) => a + b, 0);
  const gift = Math.min(...prices);
  return { subtotal, gift, total: subtotal - gift };
}
