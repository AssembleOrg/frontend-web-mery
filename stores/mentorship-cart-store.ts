import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartLine, ShopLineKind, ShopPaymentMethod } from '@/lib/mentorship-shop-api';

/** Tope por renglón (el backend valida lo mismo). */
export const MAX_LINE_QTY = 10;

/**
 * Carrito de la tienda de mentorías. Solo guarda qué y cuánto: los precios y
 * las promos los calcula siempre el backend (POST /mentorship/shop/quote).
 */
interface MentorshipCartState {
  lines: CartLine[];
  paymentMethod: ShopPaymentMethod;
  code: string;
  add: (kind: ShopLineKind, id: string) => void;
  setQuantity: (kind: ShopLineKind, id: string, quantity: number) => void;
  remove: (kind: ShopLineKind, id: string) => void;
  setPaymentMethod: (m: ShopPaymentMethod) => void;
  setCode: (code: string) => void;
  clear: () => void;
  /** Saca renglones que ya no existen en el catálogo. */
  prune: (valid: { products: Set<string>; packs: Set<string> }) => void;
}

const same = (l: CartLine, kind: ShopLineKind, id: string) => l.kind === kind && l.id === id;

export const useMentorshipCart = create<MentorshipCartState>()(
  persist(
    (set) => ({
      lines: [],
      paymentMethod: 'MERCADOPAGO',
      code: '',
      add: (kind, id) =>
        set((s) => {
          const existing = s.lines.find((l) => same(l, kind, id));
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                same(l, kind, id) ? { ...l, quantity: Math.min(MAX_LINE_QTY, l.quantity + 1) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { kind, id, quantity: 1 }] };
        }),
      setQuantity: (kind, id, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => !same(l, kind, id))
              : s.lines.map((l) =>
                  same(l, kind, id) ? { ...l, quantity: Math.min(MAX_LINE_QTY, quantity) } : l,
                ),
        })),
      remove: (kind, id) => set((s) => ({ lines: s.lines.filter((l) => !same(l, kind, id)) })),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setCode: (code) => set({ code }),
      clear: () => set({ lines: [], code: '' }),
      prune: (valid) =>
        set((s) => ({
          lines: s.lines.filter((l) =>
            l.kind === 'PRODUCT' ? valid.products.has(l.id) : valid.packs.has(l.id),
          ),
        })),
    }),
    {
      name: 'mg-mentorship-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity, 0);
