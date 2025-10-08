'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FaGraduationCap, FaVideo, FaUsers, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  const dashboardCards = [
    {
      title: 'Gestión de Cursos',
      description: 'Crear, editar y administrar cursos y formaciones',
      icon: FaGraduationCap,
      href: `/${locale}/admin/cursos`,
      color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
      iconBg: 'bg-pink-100',
    },
    {
      title: 'Videos',
      description: 'Administrar contenido de video de los cursos',
      icon: FaVideo,
      href: `/${locale}/admin/cursos`,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Usuarios',
      description: 'Próximamente: Gestión de usuarios y permisos',
      icon: FaUsers,
      href: '#',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      iconBg: 'bg-blue-100',
      disabled: true,
    },
    {
      title: 'Estadísticas',
      description: 'Próximamente: Ver métricas y análisis',
      icon: FaChartLine,
      href: '#',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      iconBg: 'bg-green-100',
      disabled: true,
    },
  ];

  const handleCardClick = (href: string, disabled?: boolean) => {
    if (!disabled && href !== '#') {
      router.push(href);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="mt-2 text-gray-600">
          Gestiona el contenido y configuración de la plataforma Mery García
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => handleCardClick(card.href, card.disabled)}
              disabled={card.disabled}
              className={`
                ${card.color}
                rounded-xl p-6 text-left transition-all duration-200
                ${
                  card.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`${card.iconBg} rounded-lg p-3 flex-shrink-0`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm opacity-80">{card.description}</p>
                  {card.disabled && (
                    <span className="inline-block mt-3 text-xs font-medium bg-white bg-opacity-50 px-3 py-1 rounded-full">
                      En desarrollo
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acceso Rápido
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/${locale}/admin/cursos/nuevo`)}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
          >
            <span className="text-gray-700 group-hover:text-pink-600 transition-colors">
              ➕ Crear nuevo curso
            </span>
            <span className="text-gray-400 group-hover:text-pink-600 transition-colors">
              →
            </span>
          </button>
          <button
            onClick={() => router.push(`/${locale}/admin/cursos`)}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
          >
            <span className="text-gray-700 group-hover:text-pink-600 transition-colors">
              📚 Ver todos los cursos
            </span>
            <span className="text-gray-400 group-hover:text-pink-600 transition-colors">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Información importante
            </h3>
            <p className="text-sm text-blue-700">
              Actualmente solo está disponible la gestión de cursos. Las
              funciones de usuarios y estadísticas estarán disponibles
              próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

