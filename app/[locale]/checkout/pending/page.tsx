'use client';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function CheckoutPendingPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background text-center px-4'>
      <AlertCircle className='w-24 h-24 text-yellow-500 mb-6' />
      <h1 className='text-4xl font-primary font-bold text-foreground mb-4'>
        Tu pago está pendiente
      </h1>
      <p className='text-muted-foreground max-w-md mb-8'>
        Tu pago está siendo procesado y estamos a la espera de la confirmación.
      </p>
      <Link href='/es/formaciones'>
        <a className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary font-bold transition-colors duration-200'>
          Explorar más formaciones
        </a>
      </Link>
    </div>
  );
}
