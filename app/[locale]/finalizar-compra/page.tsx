'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { toast } from 'react-hot-toast';
import {
  validateCoupon,
  confirmCouponConsumption,
  type ValidateCouponResponse,
} from '@/lib/api-client';

export default function FinalizarCompraPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cart, totalARS, isLoading: isCartLoading, removeItem } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state (in-memory, lost on refresh)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Compute initial form data based on user data
  const initialFormData = useMemo(() => {
    if (!user) {
      return { nombre: '', apellido: '' };
    }
    let firstName = user.firstName || '';
    let lastName = user.lastName || '';
    if (!firstName && !lastName && user.name) {
      const nameParts = user.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    return { nombre: firstName, apellido: lastName };
  }, [user]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=/es/finalizar-compra`);
    }
  }, [isAuthenticated, isAuthLoading, locale, router]);

  // Calculate discounted total
  const discountedTotalARS = useMemo(() => {
    if (!cart || !appliedCoupon?.valid) return totalARS;
    let total = 0;
    for (const item of cart.items) {
      const isEligible = appliedCoupon.applicableCategoryIds.includes(item.category.id);
      if (isEligible) {
        total += Math.round(item.priceARS * (1 - appliedCoupon.discountPercent / 100));
      } else {
        total += item.priceARS;
      }
    }
    return total;
  }, [cart, appliedCoupon, totalARS]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidateCoupon = useCallback(async () => {
    if (!couponCode.trim() || !cart) return;
    setIsValidatingCoupon(true);
    setAppliedCoupon(null);
    try {
      const categoryIds = cart.items.map((item) => item.category.id);
      const result = await validateCoupon(couponCode.trim(), categoryIds);
      setAppliedCoupon(result);
    } catch {
      setAppliedCoupon({
        valid: false,
        discountPercent: 0,
        couponCode: couponCode,
        couponId: null,
        applicableCategoryIds: [],
        message: 'Error al validar el cupón. Intenta nuevamente.',
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  }, [couponCode, cart]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !cart) {
      toast.error('Debes iniciar sesión y tener un carrito para continuar.');
      return;
    }

    setIsProcessing(true);
    toast.loading('Procesando tu pago...', { id: 'payment-toast' });
    setError(null);

    try {
      // Step 1: Build items with discounted prices
      const itemsForAPI = cart.items.map((item) => {
        const isEligible = appliedCoupon?.valid &&
          appliedCoupon.applicableCategoryIds.includes(item.category.id);
        const price = isEligible
          ? Math.round(item.priceARS * (1 - appliedCoupon!.discountPercent / 100))
          : item.priceARS;

        return {
          id: item.category.id,
          title: item.category.name,
          description: item.category.description || `Curso: ${item.category.name}`,
          price,
          quantity: 1,
        };
      });

      // Step 2: Create MercadoPago preference
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsForAPI,
          locale,
          userId: user.id,
          userEmail: user.email,
          couponId: appliedCoupon?.couponId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Error en el servidor al crear la preferencia.'
        );
      }

      const data = await response.json();
      const paymentUrl = data.url || data.init_point || data.sandbox_init_point;

      if (!paymentUrl) {
        throw new Error('No se recibió una URL de pago válida.');
      }

      // Step 3: Reserve coupon usage on preference creation (pending until payment approval)
      if (appliedCoupon?.valid && appliedCoupon.couponId) {
        await confirmCouponConsumption(appliedCoupon.couponId, user.id, data.id);
      }

      toast.success('Redirigiendo a la pasarela de pago...', {
        id: 'payment-toast',
      });
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(
        err.message || 'No se pudo procesar el pago. Intenta de nuevo.',
        { id: 'payment-toast' }
      );
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const isFormValid = !!(formData.nombre && formData.apellido);

  if (isAuthLoading || isCartLoading) {
    return (
      <div className='min-h-screen bg-background flex flex-col'>
        <Navigation />
        <CheckoutSkeleton />
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className='min-h-screen bg-background flex flex-col'>
        <Navigation />
        <div className='flex-grow container mx-auto px-4 flex items-center justify-center'>
          <div className='text-center'>
            <ShoppingBag className='w-24 h-24 mx-auto text-muted-foreground mb-6' />
            <h1 className='text-3xl font-primary font-bold text-foreground'>
              No hay cursos en tu carrito
            </h1>
            <p className='text-muted-foreground my-4'>
              Agrega algunos cursos antes de finalizar la compra.
            </p>
            <button
              onClick={() => router.push('/es/formaciones')}
              className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary'
            >
              Ver Formaciones
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <CheckoutView
        cart={cart}
        user={user}
        formData={formData}
        isProcessing={isProcessing}
        isFormValid={isFormValid}
        error={error}
        totalARS={totalARS}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        onRemoveItem={removeItem}
        couponCode={couponCode}
        onCouponCodeChange={setCouponCode}
        appliedCoupon={appliedCoupon}
        isValidatingCoupon={isValidatingCoupon}
        onValidateCoupon={handleValidateCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        discountedTotalARS={discountedTotalARS}
      />
      <Footer />
    </div>
  );
}
