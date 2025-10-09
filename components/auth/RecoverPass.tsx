'use client';

import { useState } from 'react';
import { Mail, KeyRound, X } from 'lucide-react';

interface RecoverPassProps {
  onClose: () => void;
}

export const RecoverPass = ({ onClose }: RecoverPassProps) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Ocurrió un error al enviar la solicitud.'
        );
      }

      setMessage(
        'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.'
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative'>
      {' '}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors'
        aria-label='Cerrar vista de recuperación'
      >
        <X size={24} />
      </button>
      <div className='text-center mb-8'>
        <KeyRound className='w-12 h-12 mx-auto text-[#f9bbc4] mb-4' />
        <h1 className='text-3xl font-primary font-bold text-foreground'>
          Recuperar Contraseña
        </h1>
        <p className='text-muted-foreground mt-2'>
          Ingresa tu email para recibir instrucciones
        </p>
      </div>
      {message ? (
        <div className='text-center space-y-4'>
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
            <p className='text-sm text-green-700 dark:text-green-300'>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-full bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors'
          >
            Volver
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                placeholder='tu@email.com'
                required
              />
            </div>
          </div>

          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={isLoading || !email}
            className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>
        </form>
      )}
    </div>
  );
};
