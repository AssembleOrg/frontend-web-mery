'use client';

import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Lesson } from '@/types/course';

interface LessonContentProps {
  lesson: Lesson;
  className?: string;
}

export default function LessonContent({ lesson, className = "" }: LessonContentProps) {
  // Contenido específico por lección - Solo capítulo 1 tiene PDFs
  const lessonExtras = {
    'lesson-1': {
      materials: [
        { type: 'pdf', title: 'Manual de Introducción al Tatuaje Cosmético', size: '2.5 MB' },
        { type: 'pdf', title: 'Guía de Herramientas y Materiales', size: '1.8 MB' },
        { type: 'text', title: 'Lista de herramientas básicas' },
        { type: 'link', title: 'Proveedores recomendados', url: '#' }
      ],
      notes: 'En esta lección aprenderás los fundamentos básicos del tatuaje cosmético, incluyendo la preparación del área de trabajo y las herramientas esenciales.'
    },
    'lesson-2': {
      materials: [], // Solo explicativo, sin descargas
      notes: 'Domina las técnicas avanzadas de aplicación de pigmentos para lograr resultados naturales y duraderos. Esta lección es puramente explicativa.'
    },
    'lesson-3': {
      materials: [], // Solo explicativo, sin descargas
      notes: 'Comprende la estructura facial para crear diseños personalizados que realcen la belleza natural de cada cliente. Contenido teórico especializado.'
    },
    'lesson-4': {
      materials: [],
      notes: 'Introducción a la técnica revolucionaria de nanoblading para cejas ultra naturales.'
    },
    'lesson-5': {
      materials: [],
      notes: 'Preparación y protocolos específicos para nanoblading.'
    },
    'lesson-6': {
      materials: [],
      notes: 'Análisis específico para la técnica de nanoblading.'
    },
    'lesson-7': {
      materials: [],
      notes: 'Técnicas de diseño y mapeo para nanoblading.'
    },
    'lesson-8': {
      materials: [],
      notes: 'Selección de pigmentos y teoría del color aplicada.'
    },
    'lesson-9': {
      materials: [],
      notes: 'Preparación completa del equipo y anestesia.'
    },
    'lesson-10': {
      materials: [],
      notes: 'Demostración práctica completa de la técnica.'
    },
    'lesson-11': {
      materials: [],
      notes: 'Fundamentos del microblading tradicional.'
    },
    'lesson-12': {
      materials: [],
      notes: 'Protocolo de cuidados después del procedimiento.'
    }
  };

  const extras = lessonExtras[lesson.id as keyof typeof lessonExtras];

  if (!extras) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <img src="/pdf-icon.png" alt="PDF" className="w-5 h-5" />;
      case 'text':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'link':
        return <ExternalLink className="w-5 h-5 text-[#f9bbc4]" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-[#2d2d2d]/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 ${className}`}>
      {/* Header con estilo de la imagen */}
      <div className="bg-gradient-to-r from-[#2d2d2d] to-[#3d3d3d] p-4 rounded-t-lg border-b border-gray-600">
        <h3 className="text-sm font-medium text-white tracking-wide">
          DESCARGAS
        </h3>
      </div>

      <div className="p-6">
        {/* Notas de la lección */}
        {extras.notes && (
          <div className="bg-[#f9bbc4]/10 border border-[#f9bbc4]/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-[#f9bbc4] mb-2">Notas importantes:</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {extras.notes}
            </p>
          </div>
        )}

        {/* Materiales adicionales */}
        {extras.materials.length > 0 && (
          <div className="space-y-3">
            {extras.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#3d3d3d]/50 rounded-lg border border-gray-600 hover:bg-[#3d3d3d]/70 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  {getIcon(material.type)}
                  <div>
                    <p className="font-medium text-white text-sm">
                      {material.title}
                    </p>
                    {material.size && (
                      <p className="text-xs text-gray-400">
                        Tamaño: {material.size}
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  className="flex items-center space-x-2 bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  onClick={() => {
                    if (material.type === 'link' && material.url) {
                      window.open(material.url, '_blank');
                    } else {
                      console.log(`Descargando: ${material.title}`);
                      // Aquí iría la lógica real de descarga
                    }
                  }}
                >
                  <Download className="w-3 h-3" />
                  <span>
                    {material.type === 'link' ? 'Abrir' : 'Descargar'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje si no hay materiales */}
        {extras.materials.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Esta lección no tiene materiales adicionales
            </p>
          </div>
        )}
      </div>
    </div>
  );
}