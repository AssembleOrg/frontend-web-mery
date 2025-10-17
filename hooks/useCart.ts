/**
 * useCart Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [isAuthenticated])
 * - Orchestrates API calls (api-client) + updates local data
 * - Loading/error states AQUÍ (NO en store)
 * - Integración con backend API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'react-hot-toast';
import {
  getCart as getCartService,
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  getCartSummary as getCartSummaryService,
  Cart,
  CartSummary,
} from '@/lib/api-client';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-init: Load cart on mount if authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCart(null);
        setSummary(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const cartData = await getCartService();
        setCart(cartData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar el carrito';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Add course to cart
  const addCourse = useCallback(
    async (categoryId: string) => {
      if (!isAuthenticated) {
        setError('Debes iniciar sesión para agregar cursos al carrito');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        const updatedCart = await addToCartService(categoryId);
        setCart(updatedCart);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al agregar al carrito';
        setError(errorMessage);

        // Show friendly toast based on error type
        if (errorMessage.includes('Ya compraste')) {
          toast.success('Ya compraste este curso. Puedes verlo en "Mis Cursos"', {
            duration: 4000,
          });
        } else if (errorMessage.includes('carrito')) {
          toast.error('Este curso ya está en tu carrito', {
            duration: 3000,
          });
        } else {
          toast.error(errorMessage, {
            duration: 3000,
          });
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        setError('Debes iniciar sesión');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        const updatedCart = await removeFromCartService(itemId);
        setCart(updatedCart);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al eliminar del carrito';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Clear entire cart
  const clear = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await clearCartService();
      setCart(null);
      setSummary(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al vaciar el carrito';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load summary (for checkout page)
  const loadSummary = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const summaryData = await getCartSummaryService();
      setSummary(summaryData);
      return summaryData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar resumen';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh cart manually
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const cartData = await getCartService();
      setCart(cartData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar el carrito';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Check if course is in cart
  const isInCart = useCallback(
    (categoryId: string): boolean => {
      if (!cart || !cart.items) return false;
      return cart.items.some((item) => item.categoryId === categoryId);
    },
    [cart]
  );

  return {
    cart,
    summary,
    isLoading,
    error,
    addCourse,
    removeItem,
    clear,
    loadSummary,
    refresh,
    isInCart,
    itemCount: cart?.itemCount || 0,
    totalARS: cart?.totalARS || 0,
    totalUSD: cart?.totalUSD || 0,
  };
}
