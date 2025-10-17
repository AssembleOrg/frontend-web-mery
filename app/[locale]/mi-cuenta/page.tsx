'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  LogOut,
  BookOpen,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useUserCourses } from '@/hooks/useUserCourses';
import { MiCuentaSkeleton } from '@/components/mi-cuenta/MiCuentaSkeleton';

export default function MiCuentaPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('mis-cursos');

  const { logout, user, updateProfile, isLoading: authLoading } = useAuth();
  const { courses: userCourses, isLoading: loading } = useUserCourses();

  // Estado del formulario de perfil
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Cargar datos del usuario en el formulario
  useEffect(() => {
    if (user) {
      // Use firstName/lastName if available, otherwise parse name
      let firstName = user.firstName || '';
      let lastName = user.lastName || '';
      
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      setProfileForm({
        firstName,
        lastName,
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const menuItems = [
    { id: 'mis-cursos', label: 'Mis Cursos', icon: BookOpen },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
    { id: 'detalles', label: 'Detalles de la Cuenta', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/es');
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileSaved(false);
    setProfileError('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);
    setProfileError('');

    const result = await updateProfile({
      firstName: profileForm.firstName || undefined,
      lastName: profileForm.lastName || undefined,
      phone: profileForm.phone || undefined,
      country: profileForm.country || undefined,
      city: profileForm.city || undefined,
    });

    if (result.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileError(result.error || 'Error al guardar cambios');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'mis-cursos':
        return (
          <div>
            <h2 className='text-2xl font-primary font-bold text-foreground mb-6'>
              Mis Cursos
            </h2>

            {loading ? (
              <MiCuentaSkeleton />
            ) : userCourses.length === 0 ? (
              <div className='bg-card p-8 rounded-lg border text-center'>
                <BookOpen className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>
                  Aún no tienes cursos comprados. ¡Explora nuestras formaciones!
                </p>
                <button
                  onClick={() => router.push('/es/formaciones')}
                  className='mt-4 bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-2 rounded-lg font-primary font-medium transition-colors duration-200'
                >
                  Ver Formaciones
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr'>
                {userCourses.map((userCourse) => {
                  const { course, progress, enrolledAt } = userCourse;
                  const progressPercentage = progress.progressPercentage || 0;
                  const isCompleted = progressPercentage === 100;

                  return (
                    <div
                      key={course.id}
                      className='bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full'
                    >
                      {/* Imagen del curso */}
                      <div className='relative h-48 bg-gray-200 dark:bg-gray-700'>
                        <div
                          className='w-full h-full object-cover bg-cover bg-center'
                          style={{ backgroundImage: `url(${course.image})` }}
                        />
                        {isCompleted && (
                          <div className='absolute top-4 right-4 success-bg text-white p-2 rounded-full'>
                            <Trophy className='w-4 h-4' />
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className='p-6 flex flex-col h-full'>
                        <h3 className='text-lg font-bold text-foreground mb-2'>
                          {course.title}
                        </h3>

                        <p className='text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow'>
                          {course.description}
                        </p>

                        {/* Progreso COMENTADO BY JULY */}
                        {/* <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">
                              Progreso
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {progress.lessonsCompleted.length} / {progress.totalLessons} lecciones
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progressPercentage)}% completado
                            </span>
                            {progress.lastAccessed && (
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(progress.lastAccessed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div> */}

                        {/* Botón de acceso */}
                        <Link
                          href={`/es/cursos/${course.id}`}
                          className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg font-primary font-medium transition-colors duration-200 text-center block'
                        >
                          {progressPercentage === 0
                            ? 'Comenzar Curso'
                            : 'Continuar Curso'}
                        </Link>

                        {/* Información adicional */}
                        <div className='mt-4 pt-4 border-t border-border'>
                          <div className='flex justify-between text-xs text-muted-foreground'>
                            <span>
                              Inscrito:{' '}
                              {new Date(enrolledAt).toLocaleDateString()}
                            </span>
                            {course.modalContent?.duration && (
                              <span>
                                Duración: {course.modalContent.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'compras':
        return (
          <div>
            <h2 className='text-2xl font-primary font-bold text-foreground mb-6'>
              Historial de Compras
            </h2>
            <div className='bg-card p-8 rounded-lg border text-center'>
              <ShoppingBag className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>
                No hay compras registradas en tu cuenta.
              </p>
            </div>
          </div>
        );

      case 'detalles':
        return (
          <div>
            <h2 className='text-2xl font-primary font-bold text-foreground mb-6'>
              Detalles de la Cuenta
            </h2>
            <div className='bg-card p-6 rounded-lg border'>
              <form
                onSubmit={handleProfileSubmit}
                className='space-y-6'
              >
                {/* Nombre y Apellido */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Nombre *
                    </label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                      <input
                        type='text'
                        name='firstName'
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                        placeholder='Juan'
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Apellido *
                    </label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                      <input
                        type='text'
                        name='lastName'
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                        placeholder='Pérez'
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                    <input
                      type='email'
                      value={user?.email || ''}
                      className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed'
                      placeholder='tu@email.com'
                      disabled
                      readOnly
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    El email no puede ser modificado
                  </p>
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
                        value={profileForm.phone}
                        onChange={handleProfileChange}
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
                        value={profileForm.country}
                        onChange={handleProfileChange}
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
                      value={profileForm.city}
                      onChange={handleProfileChange}
                      className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                      placeholder='Buenos Aires'
                    />
                  </div>
                </div>

                {/* Success Message */}
                {profileSaved && (
                  <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
                    <p className='text-sm text-green-600 dark:text-green-400'>
                      ✓ Cambios guardados exitosamente
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {profileError && (
                  <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      {profileError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={authLoading}
                  className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-3 rounded-lg font-primary font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {authLoading ? (
                    <span className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <Navigation />

        <div className='container mx-auto px-4 py-16 max-w-7xl'>
          <h1 className='text-3xl font-primary font-bold text-foreground mb-8'>
            Mi Cuenta
          </h1>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <div className='bg-card p-6 rounded-lg border'>
                <nav className='space-y-2'>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                          activeSection === item.id
                            ? 'bg-[#f9bbc4] text-white'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className='w-5 h-5' />
                        {item.label}
                      </button>
                    );
                  })}

                  <hr className='my-4 border-border' />

                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors duration-200'
                  >
                    <LogOut className='w-5 h-5' />
                    Cerrar Sesión
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className='lg:col-span-3'>{renderContent()}</div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
