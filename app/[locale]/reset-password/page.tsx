'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { KeyRound, Lock, CheckCircle } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setError('El enlace es inválido o ha expirado');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Ocurrió un error al restablecer la contraseña.'
        );
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al restablecer la contraseña.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <div className='text-center space-y-4'>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            El enlace es inválido o ha expirado. Por favor, solicita un nuevo
            enlace de recuperación.
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors'
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  // Si fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className='text-center space-y-4'>
        <CheckCircle className='w-16 h-16 mx-auto text-green-500' />
        <h2 className='text-2xl font-primary font-bold text-foreground'>
          ¡Contraseña restablecida!
        </h2>
        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
          <p className='text-sm text-green-700 dark:text-green-300'>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar
            sesión con tu nueva contraseña.
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors'
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  // Formulario de reset
  return (
    <>
      <div className='text-center mb-8'>
        <KeyRound className='w-12 h-12 mx-auto text-[#f9bbc4] mb-4' />
        <h1 className='text-3xl font-primary font-bold text-foreground'>
          Restablecer Contraseña
        </h1>
        <p className='text-muted-foreground mt-2'>Ingresa tu nueva contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Nueva Contraseña
          </label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='w-full pl-10 pr-12 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
              placeholder='Mínimo 8 caracteres'
              required
              minLength={8}
            />
            <button
              type='button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              aria-label={
                showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Confirmar Contraseña
          </label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full pl-10 pr-12 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
              placeholder='Repetir contraseña'
              required
              minLength={8}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              aria-label={
                showConfirmPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !newPassword || !confirmPassword}
          className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          ¿Recordaste tu contraseña?{' '}
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className='text-[#f9bbc4] hover:text-[#eba2a8] font-medium transition-colors'
          >
            Iniciar Sesión
          </button>
        </p>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <div className='container mx-auto px-4 py-16 max-w-md'>
        <div className='bg-card p-8 rounded-lg border'>
          <Suspense
            fallback={
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#f9bbc4] mx-auto'></div>
                <p className='mt-4 text-muted-foreground'>Cargando...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
