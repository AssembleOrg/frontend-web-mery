'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Mail, Lock } from 'lucide-react';
import { RecoverPass } from '@/components/auth/RecoverPass';
import { toast } from 'react-hot-toast';
import { LoginSkeleton } from '@/components/auth/LoginSkeleton';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecoverView, setShowRecoverView] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const result = await login({ email, password });

    if (result.success && result.user) {
      toast.success(
        `¡Bienvenida de nuevo, ${result.user.firstName || 'Estudiante'}!`
      );
      if (result.user.role === 'admin') {
        router.push(`/${locale}/admin/cursos`);
      } else {
        router.push(`/${locale}/mi-cuenta`);
      }
    }
  };

  if (isLoading && !email) {
    return <LoginSkeleton />;
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <div className='container mx-auto px-4 py-16 max-w-md'>
        <div className='bg-card p-8 rounded-lg border'>
          {/* --- 3. RENDERIZADO CONDICIONAL --- */}
          {showRecoverView ? (
            // Si showRecoverView es true, muestra el componente de recuperación
            <RecoverPass onClose={() => setShowRecoverView(false)} />
          ) : (
            // Si es false, muestra el formulario de login (tu código original)
            <>
              <div className='text-center mb-8'>
                <LogIn className='w-12 h-12 mx-auto text-[#f9bbc4] mb-4' />
                <h1 className='text-3xl font-primary font-bold text-foreground'>
                  Iniciar Sesión
                </h1>
                <p className='text-muted-foreground mt-2'>
                  Accede a tus cursos y contenido
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className='space-y-6'
              >
                {/* Email */}
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

                {/* Password */}
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Contraseña
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                    <input
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                      placeholder='Tu contraseña'
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type='submit'
                  disabled={isLoading || !email || !password}
                  className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-sm text-muted-foreground'>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => router.push(`/${locale}/register`)}
                    className='text-[#f9bbc4] hover:text-[#eba2a8] font-medium transition-colors'
                  >
                    Regístrate
                  </button>
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  ¿Olvidaste tu contraseña?{' '}
                  {/* --- 4. ACTUALIZA EL ONCLICK --- */}
                  <button
                    onClick={() => setShowRecoverView(true)}
                    className='text-[#f9bbc4] hover:text-[#eba2a8] font-medium transition-colors'
                  >
                    Recuperar clave
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
