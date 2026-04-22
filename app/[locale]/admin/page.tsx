'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Gift,
  MessageCircle,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

const sections = [
  {
    href: 'admin/cursos',
    label: 'Cursos',
    description: 'Crear, editar y publicar formaciones',
    icon: GraduationCap,
    cta: 'Ver cursos',
  },
  {
    href: 'admin/usuarios',
    label: 'Usuarios',
    description: 'Asignar acceso manual a cursos',
    icon: Users,
    cta: 'Ver usuarios',
  },
  {
    href: 'admin/cupones',
    label: 'Cupones',
    description: 'Crear y gestionar descuentos',
    icon: Gift,
    cta: 'Ver cupones',
  },
  {
    href: 'admin/chats',
    label: 'Chats',
    description: 'Mensajes de alumnos activos',
    icon: MessageCircle,
    cta: 'Ver chats',
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
        className='flex items-center justify-between gap-4 bg-[#660e1b] hover:bg-[#4a0a14] text-white px-5 py-4 rounded-xl transition-all shadow-sm hover:shadow-md group'
      >
        <div className='flex items-center gap-3'>
          <PlusCircle className='w-5 h-5 flex-shrink-0' />
          <div>
            <p className='text-sm font-semibold'>Crear nuevo curso</p>
            <p className='text-xs text-white/70 mt-0.5'>Publicar una nueva formación</p>
          </div>
        </div>
        <ChevronRight className='w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform' />
      </Link>

      {/* Nav cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {sections.map(({ href, label, description, icon: Icon, cta }) => (
          <Link
            key={href}
            href={`/${locale}/${href}`}
            className='group flex items-center gap-4 bg-white border border-gray-100 hover:border-[#F7CBCB] rounded-xl px-5 py-4 transition-all shadow-sm hover:shadow-md'
          >
            <div className='w-10 h-10 rounded-lg bg-[#FBE8EA] flex items-center justify-center flex-shrink-0 group-hover:bg-[#F7CBCB] transition-colors'>
              <Icon className='w-5 h-5 text-[#660e1b]' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900'>{label}</p>
              <p className='text-xs text-gray-500 mt-0.5 truncate'>{description}</p>
            </div>
            <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-[#660e1b] group-hover:translate-x-0.5 transition-all flex-shrink-0' />
          </Link>
        ))}
      </div>
    </div>
  );
}
