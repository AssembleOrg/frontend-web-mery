'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, ShoppingBag, LogOut, BookOpen } from 'lucide-react';

export default function MiCuentaPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('mis-cursos');

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