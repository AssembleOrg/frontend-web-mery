'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
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
      <Link href='/es/mi-cuenta'>
        <a className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary font-bold transition-colors duration-200'>
          Ir a Mis Cursos
        </a>
      </Link>
    </div>
  );
}
