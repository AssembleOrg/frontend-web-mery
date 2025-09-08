'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, ShoppingBag, LogOut, BookOpen, Clock, Trophy } from 'lucide-react';
import { useCourseStore } from '@/stores';
import { getUserCourses } from '@/lib/api-client';
import Link from 'next/link';

export default function MiCuentaPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('mis-cursos');
  const [loading, setLoading] = useState(true);

  const { userCourses, setUserCourses } = useCourseStore();

  useEffect(() => {
    const loadUserCourses = async () => {
      try {
        setLoading(true);
        const courses = await getUserCourses();
        setUserCourses(courses);
      } catch (error) {
        console.error('Error loading user courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserCourses();
  }, [setUserCourses]);

  const menuItems = [
    { id: 'mis-cursos', label: 'Mis Cursos', icon: BookOpen },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
    { id: 'detalles', label: 'Detalles de la Cuenta', icon: User },
  ];

  const handleLogout = () => {
    router.push('/es');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'mis-cursos':
        return (
          <div>
            <h2 className="text-2xl font-primary font-bold text-foreground mb-6">
              Mis Cursos
            </h2>
            
            {loading ? (
              <div className="bg-card p-8 rounded-lg border text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando tus cursos...</p>
              </div>
            ) : userCourses.length === 0 ? (
              <div className="bg-card p-8 rounded-lg border text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aún no tienes cursos comprados. ¡Explora nuestras formaciones!
                </p>
                <button
                  onClick={() => router.push('/es/formaciones')}
                  className="mt-4 bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-6 py-2 rounded-lg font-primary font-medium transition-colors duration-200"
                >
                  Ver Formaciones
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                {userCourses.map((userCourse) => {
                  const { course, progress, enrolledAt } = userCourse;
                  const progressPercentage = progress.progressPercentage || 0;
                  const isCompleted = progressPercentage === 100;
                  
                  return (
                    <div key={course.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                      {/* Imagen del curso */}
                      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                        <div 
                          className="w-full h-full object-cover bg-cover bg-center"
                          style={{ backgroundImage: `url(${course.image})` }}
                        />
                        {isCompleted && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
                            <Trophy className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Contenido */}
                      <div className="p-6 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                          {course.description}
                        </p>
                        
                        {/* Progreso */}
                        <div className="mb-4">
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
                        </div>
                        
                        {/* Botón de acceso */}
                        <Link 
                          href={`/es/cursos/${course.id}`}
                          className="w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg font-primary font-medium transition-colors duration-200 text-center block"
                        >
                          {progressPercentage === 0 ? 'Comenzar Curso' : 'Continuar Curso'}
                        </Link>
                        
                        {/* Información adicional */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Inscrito: {new Date(enrolledAt).toLocaleDateString()}
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
            <h2 className="text-2xl font-primary font-bold text-foreground mb-6">
              Historial de Compras
            </h2>
            <div className="bg-card p-8 rounded-lg border text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay compras registradas en tu cuenta.
              </p>
            </div>
          </div>
        );

      case 'detalles':
        return (
          <div>
            <h2 className="text-2xl font-primary font-bold text-foreground mb-6">
              Detalles de la Cuenta
            </h2>
            <div className="bg-card p-6 rounded-lg border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Tu teléfono"
                  />
                </div>
                <button className="bg-[#660e1b] hover:bg-[#4a0a14] text-white px-6 py-2 rounded-lg font-primary font-medium transition-colors duration-200">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <h1 className="text-3xl font-primary font-bold text-foreground mb-8">
          Mi Cuenta
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg border">
              <nav className="space-y-2">
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
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
                
                <hr className="my-4 border-border" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}