'use client';

import { useEffect, useRef, useState } from 'react';
import { shopApi, type CartLine, type ShopPaymentMethod, type ShopQuote } from '@/lib/mentorship-shop-api';

/**
 * Cotización del carrito contra el backend (precios y promos salen de ahí).
 * Debounce corto para no pegarle en cada toque del +/−, y descarta respuestas
 * viejas si llega una más nueva.
 */
export function useShopQuote(lines: CartLine[], paymentMethod: ShopPaymentMethod, code: string) {
  const [quote, setQuote] = useState<ShopQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const key = JSON.stringify({ lines, paymentMethod, code });

  useEffect(() => {
    const mine = ++seq.current;
    if (lines.length === 0) {
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      shopApi
        .quote({ lines, paymentMethod, ...(code ? { code } : {}) })
        .then((q) => {
          if (mine !== seq.current) return;
          setQuote(q);
          setError(null);
        })
        .catch((e: Error) => {
          if (mine !== seq.current) return;
          setQuote(null);
          setError(e.message);
        })
        .finally(() => {
          if (mine === seq.current) setLoading(false);
        });
    }, 220);
    return () => clearTimeout(t);
    // key resume lines/paymentMethod/code (las líneas cambian de identidad en cada render del store)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, loading, error };
}
