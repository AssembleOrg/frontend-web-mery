'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Gift,
  MessageCircle,
  CalendarClock,
  ClipboardList,
  Settings,
  ChevronRight,
  Mail,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Section {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface Group {
  title: string;
  sections: Section[];
}

const groups: Group[] = [
  {
    title: 'Formación',
    sections: [
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
    ],
  },
  {
    title: 'Mentoría & Presencialidad',
    sections: [
      {
        href: 'admin/mentorias',
        label: 'Mentoría / Presencialidad',
        description: 'Reservas, disponibilidad y reprogramaciones',
        icon: CalendarClock,
      },
      {
        href: 'admin/productos-mentoria',
        label: 'Productos mentoría',
        description: 'Gestionar productos y paquetes de mentoría',
        icon: Package,
      },
    ],
  },
  {
    title: 'Ventas & Comunicación',
    sections: [
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
        href: 'admin/emails',
        label: 'Emails',
        description: 'Enviar promociones a clientes',
        icon: Mail,
      },
      {
        href: 'admin/formularios',
        label: 'Formularios',
        description: 'Formularios públicos, respuestas y analítica',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Sistema',
    sections: [
      {
        href: 'admin/configuracion',
        label: 'Configuración',
        description: 'Ajustes generales del portal',
        icon: Settings,
      },
    ],
  },
];

export default function AdminDashboard() {
  const params = useParams();
  const locale = (params.locale as string) || 'es';

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Bienvenida, Mery
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Panel de administración · Mery García Formaciones
        </p>
      </div>

      {/* Grouped nav cards */}
      {groups.map(({ title, sections }) => (
        <section key={title} className='space-y-3'>
          <h2 className='text-xs font-semibold text-[#EBA2A8] uppercase tracking-widest'>
            {title}
          </h2>
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
        </section>
      ))}
    </div>
  );
}
