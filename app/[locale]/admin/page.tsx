'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Gift,
  Sparkles,
  MessageCircle,
  CalendarClock,
  ClipboardList,
  Settings,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

const sections = [
  {
    href: 'admin/cursos',
    label: 'Cursos',
    description: 'Crear, editar y publicar formaciones',
    icon: GraduationCap,
  },
  {
    href: 'admin/usuarios',
    label: 'Usuarios',
    description: 'Asignar acceso manual a cursos',
    icon: Users,
  },
  {
    href: 'admin/mentorias',
    label: 'Mentorías',
    description: 'Reservas, disponibilidad y reprogramaciones',
    icon: CalendarClock,
  },
  {
    href: 'admin/chats',
    label: 'Chats',
    description: 'Mensajes de alumnos activos',
    icon: MessageCircle,
  },
  {
    href: 'admin/cupones',
    label: 'Cupones',
    description: 'Crear y gestionar descuentos',
    icon: Gift,
  },
  {
    href: 'admin/promos',
    label: 'Promos',
    description: 'Campañas y cupones-regalo',
    icon: Sparkles,
  },
  {
    href: 'admin/formularios',
    label: 'Formularios',
    description: 'Formularios públicos, respuestas y analítica',
    icon: ClipboardList,
  },
  {
    href: 'admin/configuracion',
    label: 'Configuración',
    description: 'Ajustes generales del portal',
    icon: Settings,
  },
];

export default function AdminDashboard() {
  const params = useParams();
  const locale = (params.locale as string) || 'es';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Bienvenida, Mery
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Panel de administración · Mery García Formaciones
        </p>
      </div>

      {/* Quick action */}
      <Link
        href={`/${locale}/admin/cursos/nuevo`}
        className='flex items-center justify-between gap-4 bg-[#2B2B2B] hover:bg-[#1f1f1f] text-white px-5 py-4 rounded-2xl transition-all shadow-sm hover:shadow-md group'
      >
        <div className='flex items-center gap-3'>
          <PlusCircle className='w-5 h-5 flex-shrink-0 text-[#EBA2A8]' />
          <div>
            <p className='text-sm font-semibold'>Crear nuevo curso</p>
            <p className='text-xs text-white/60 mt-0.5'>Publicar una nueva formación</p>
          </div>
        </div>
        <ChevronRight className='w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform' />
      </Link>

      {/* Nav cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {sections.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={`/${locale}/${href}`}
            className='group flex items-center gap-4 bg-white border border-gray-100 hover:border-[#EBA2A8] rounded-2xl px-5 py-4 transition-all shadow-sm hover:shadow-md'
          >
            <div className='w-10 h-10 rounded-xl bg-[#2B2B2B] flex items-center justify-center flex-shrink-0'>
              <Icon className='w-5 h-5 text-[#EBA2A8]' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900'>{label}</p>
              <p className='text-xs text-gray-500 mt-0.5 truncate'>{description}</p>
            </div>
            <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-[#EBA2A8] group-hover:translate-x-0.5 transition-all flex-shrink-0' />
          </Link>
        ))}
      </div>
    </div>
  );
}
