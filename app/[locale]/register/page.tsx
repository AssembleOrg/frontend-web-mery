// app/[locale]/register/page.tsx

'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { RegisterSkeleton } from '@/components/auth/RegisterSkeleton';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { register, isLoading, error: apiError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    city: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (apiError) {
      toast.error(apiError);
    }
  }, [apiError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
      country?: string;
      city?: string;
    } = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    if (formData.phone) payload.phone = formData.phone;
    if (formData.country) payload.country = formData.country;
    if (formData.city) payload.city = formData.city;

    const result = await register(payload);

    if (result.success) {
      toast.success(
        '¡Registro exitoso! Revisa tu email para verificar tu cuenta.'
      );
      router.push(`/${locale}/login?registered=true`);
    }
  };

  if (isLoading && !formData.email) {
    return <RegisterSkeleton />;
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <div className='container mx-auto px-4 py-16 max-w-2xl'>
        <div className='bg-card p-8 rounded-lg border'>
          <div className='text-center mb-8'>
            <UserPlus className='w-12 h-12 mx-auto text-[#f9bbc4] mb-4' />
            <h1 className='text-3xl font-primary font-bold text-foreground'>
              Crear Cuenta
            </h1>
            <p className='text-muted-foreground mt-2'>
              Completa tus datos para registrarte
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-6'
          >
            {/* Nombre y Apellido */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Nombre */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Nombre *
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                    placeholder='Juan'
                    required
                  />
                </div>
              </div>

              {/* Apellido */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Apellido *
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                    placeholder='Pérez'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Email *
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                  placeholder='tu@email.com'
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Contraseña *
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                  placeholder='Mínimo 8 caracteres'
                  required
                />
              </div>
            </div>

            {/* Grid para Teléfono y País */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Teléfono */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Teléfono
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                    placeholder='+54 11 1234-5678'
                  />
                </div>
              </div>

              {/* País */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  País
                </label>
                <div className='relative'>
                  <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] appearance-none'
                  >
                    <option value=''>Seleccionar país</option>
                    <option value='Argentina'>Argentina</option>
                    <option value='Brasil'>Brasil</option>
                    <option value='Chile'>Chile</option>
                    <option value='Uruguay'>Uruguay</option>
                    <option value='Paraguay'>Paraguay</option>
                    <option value='Bolivia'>Bolivia</option>
                    <option value='Otro'>Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ciudad */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Ciudad
              </label>
              <div className='relative'>
                <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                  placeholder='Buenos Aires'
                />
              </div>
            </div>

            {/* Bloque de Error Unificado */}
            {(apiError || formError) && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {formError || apiError}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type='submit'
              disabled={
                isLoading ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password
              }
              className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <span className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Link a Login */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push(`/${locale}/login`)}
                className='text-[#f9bbc4] hover:text-[#eba2a8] font-medium transition-colors'
              >
                Iniciar Sesión
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
