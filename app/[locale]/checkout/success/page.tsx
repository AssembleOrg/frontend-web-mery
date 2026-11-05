'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const params = useParams();
  const locale = params.locale as string;

  // Google Analytics: compra aprobada, para saber qué canal trae ventas.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const transactionId = query.get('payment_id') ?? query.get('collection_id');
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
      .gtag;
    gtag?.('event', 'purchase', {
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background text-center px-4'>
      <CheckCircle className='w-24 h-24 text-green-500 mb-6' />
      <h1 className='text-4xl font-primary font-bold text-foreground mb-4'>
        ¡Pago Aprobado!
      </h1>
      <p className='text-muted-foreground max-w-md mb-8'>
        Gracias por tu compra. Hemos recibido tu pago correctamente y en breve
        tendrás acceso a tus cursos.
      </p>
      <Link
        href={`/${locale}/mi-cuenta`}
        className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary font-bold transition-colors duration-200'
      >
        Ir a Mis Cursos
      </Link>
    </div>
  );
}
