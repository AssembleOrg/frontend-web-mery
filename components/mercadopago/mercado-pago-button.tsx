// File: components/mercadopago/MercadoPagoButton.tsx
'use client';

import { useState } from 'react';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useCartStore } from '@/stores/cart-store';
if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
}

export function MercadoPagoButton() {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items } = useCartStore();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    const itemsForAPI = items.map((item) => ({
      id: item.course.id,
      title: item.course.title,
      description: item.course.description || `Curso: ${item.course.title}`,
      price: item.course.price,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsForAPI),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al crear la preferencia.');
      }

      const { id } = await response.json();
      setPreferenceId(id);
    } catch (_err: any) {
      setError('No se pudo procesar el pago. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center w-full'>
      {!preferenceId && (
        <button
          onClick={handleCheckout}
          disabled={isLoading || items.length === 0}
          className='w-full bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-muted disabled:text-muted-foreground text-white py-4 px-6 rounded-lg font-primary font-bold text-lg transition-colors duration-200'
        >
          {isLoading ? 'Procesando...' : 'Finalizar Compra'}
        </button>
      )}

      {error && <p className='text-red-500 mt-2'>{error}</p>}

      {preferenceId && (
        <div className='w-full mt-4'>
          <Wallet initialization={{ preferenceId }} />
        </div>
      )}
    </div>
  );
}
