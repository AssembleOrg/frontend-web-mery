'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { toast } from 'react-hot-toast';
export default function FinalizarCompraPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cart, totalARS, isLoading: isCartLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    pais: '',
    ciudad: '',
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=/es/finalizar-compra`);
    }
  }, [isAuthenticated, isAuthLoading, locale, router]);

  // Autocomplete
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.trim().split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData((prev) => ({
        ...prev,
        nombre: firstName,
        apellido: lastName,
        telefono: user.phone || prev.telefono,
        pais: user.country || prev.pais,
        ciudad: user.city || prev.ciudad,
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !cart) {
      toast.error('Debes iniciar sesión y tener un carrito para continuar.');
      return;
    }

    setIsProcessing(true);
    toast.loading('Procesando tu pago...', { id: 'payment-toast' });
    setError(null);

    // Mapea los items del carrito para la API de MercadoPago
    const itemsForAPI = cart.items.map((item) => ({
      id: item.category.id,
      title: item.category.name,
      description: item.category.description || `Curso: ${item.category.name}`,
      price: item.priceARS,
      quantity: 1,
    }));

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsForAPI,
          locale,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error en el servidor al crear la preferencia.'
        );
      }

      const { url } = await response.json();
      if (url) {
        toast.success('Redirigiendo a la pasarela de pago...', {
          id: 'payment-toast',
        });
        router.push(url);
      } else {
        throw new Error('No se recibió una URL de pago.');
      }
    } catch (err: any) {
      toast.error(
        err.message || 'No se pudo procesar el pago. Intenta de nuevo.',
        { id: 'payment-toast' }
      );
      console.error(err);
      setIsProcessing(false);
    }
  };

  const isFormValid = !!(
    formData.nombre &&
    formData.apellido &&
    formData.telefono
  );

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
      />
      <Footer />
    </div>
  );
}
