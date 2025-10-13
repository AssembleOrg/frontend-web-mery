'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MailCheck, MailWarning, LoaderCircle } from 'lucide-react';

function VerificationComponent() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No se proporcionó un token de verificación.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'El token es inválido o ha expirado.'
          );
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message);
      }
    };

    verifyEmail();
  }, [token]);

  const handleRedirect = () => {
    router.push(`/${locale}/login`);
  };

  return (
    <div className='container mx-auto px-4 py-16 max-w-lg'>
      <div className='bg-card p-8 rounded-lg border text-center'>
        {status === 'verifying' && (
          <>
            <LoaderCircle className='w-16 h-16 mx-auto text-[#f9bbc4] mb-4 animate-spin' />
            <h1 className='text-2xl font-primary font-bold text-foreground'>
              Verificando tu cuenta...
            </h1>
            <p className='text-muted-foreground mt-2'>
              Por favor, espera un momento.
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <MailCheck className='w-16 h-16 mx-auto text-green-500 mb-4' />
            <h1 className='text-2xl font-primary font-bold text-foreground'>
              ¡Email Verificado!
            </h1>
            <p className='text-muted-foreground mt-2'>
              Tu cuenta ha sido activada correctamente. Ya puedes iniciar
              sesión.
            </p>
            <button
              onClick={handleRedirect}
              className='mt-6 w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium'
            >
              Ir a Iniciar Sesión
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <MailWarning className='w-16 h-16 mx-auto text-red-500 mb-4' />
            <h1 className='text-2xl font-primary font-bold text-foreground'>
              Error de Verificación
            </h1>
            <p className='text-muted-foreground mt-2'>
              {errorMessage ||
                'No pudimos verificar tu cuenta. El enlace puede haber expirado.'}
            </p>
            <button
              onClick={handleRedirect}
              className='mt-6 w-full bg-mg-gray hover:opacity-90 text-white px-6 py-3 rounded-lg font-primary font-medium'
            >
              Volver a Intentarlo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <Suspense fallback={<div>Cargando...</div>}>
        <VerificationComponent />
      </Suspense>
      <Footer />
    </div>
  );
}
