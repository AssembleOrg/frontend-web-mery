'use client';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutFailurePage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background text-center px-4'>
      <XCircle className='w-24 h-24 text-destructive mb-6' />
      <h1 className='text-4xl font-primary font-bold text-foreground mb-4'>
        Hubo un problema con tu pago
      </h1>
      <p className='text-muted-foreground max-w-md mb-8'>
        El pago fue rechazado o cancelado. Por favor, intenta nuevamente.
      </p>
      <Link href='/es/compra-de-cursos'>
        <a className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary font-bold transition-colors duration-200'>
          Volver al Carrito
        </a>
      </Link>
    </div>
  );
}
