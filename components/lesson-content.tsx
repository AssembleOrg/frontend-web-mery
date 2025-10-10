'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Lesson } from '@/types/course';

interface LessonContentProps {
  lesson: Lesson;
  courseId: string;
  className?: string;
}

export default function LessonContent({
  lesson,
  courseId,
  className = '',
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'downloads'>(
    'content'
  );

  // Contenido específico por curso y lección usando courseId + lesson.order
  const courseContent: Record<
    string,
    Record<number, { content: string; downloads: any[] }>
  > = {
    // ============================================
    // CURSO: Autostyling Estilismo de cejas
    // ID: cmgiq73k90000li1vnzzy7l39
    // ============================================
    cmgiq73k90000li1vnzzy7l39: {
      0: {
        content: `En este capítulo podrás aprender:

    Las fases del ciclo vital del pelo.
    Deficiencias y anomalías en el crecimiento del vello.
    Como crear la caja, nuestra principal herramienta de diseño.
    Partes de la Ceja.
    Tiempos del pelo.`,
        downloads: [],
      },
      1: {
        content: `En este capítulo podrás aprender:

    Concepto de estructura (proporciones aceptables)
    Definición de Textura o trama (disposición del pelo)
    Densidad (proporciones correctas)`,
        downloads: [],
      },
      2: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio de Modelado de Cejas. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Modelado.pdf'],
      },
      3: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio de Laminado o Alisado de Cejas. Conocé todas las herramientas e insumos que utilizo y que recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Laminado.pdf'],
      },
      4: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestros servicios de Maquillaje hiper realista de Cejas. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Maquillaje.pdf'],
      },
      5: {
        content: `En este capítulo te cuento como creé esta increíble técnica que brinda respuesta a infinidad de casos. Sus fundamentos y su lógica. Porque todo tiene una explicación te voy a compartir todo acerca de este servicio exclusivo By Mery Garcia.`,
        downloads: [],
      },
      6: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio exclusivo: Refill created By Mery Garcia. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/refill/Servicios-Refill.pdf'],
      },
      7: {
        content: `En este capítulo te cuento como creé esta increíble técnica que brinda respuesta a infinidad de casos. Sus fundamentos y su lógica. Porque todo tiene una explicación te voy a compartir todo acerca de este servicio exclusivo By Mery Garcia.`,
        downloads: [],
      },
      8: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio exclusivo: Refill created By Mery Garcia. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: [],
      },
      9: {
        content: `En este video te muestro como realizar tus prácticas para poder aplicar todos los conceptos aprendidos acerca de esta técnica..`,
        downloads: [],
      },
    },

    // ============================================
    // CURSO: Estilismo de ceja
    // ID: cmghaunrh0000gxi93jbbd0oa
    // ============================================
    cmghaunrh0000gxi93jbbd0oa: {
      0: {
        content: `En este capítulo podrás aprender:
    Las fases del ciclo vital del pelo.
    Deficiencias y anomalías en el crecimiento del vello.
    Como crear la caja, nuestra principal herramienta de diseño.
    Partes de la Ceja.  Tiempos del pelo.`,
        downloads: [
          '/pdf-mery/estilismo-cejas/Estilismo-de-Cejas-Capitulo-I.pdf',
          '/pdf-mery/mat-consultas/Mat-de-consulta-Las-cejas-a-traves-de-las-decadas.pdf',
          '/pdf-mery/mat-consultas/Mat-de-consulta-Visagismo.pdf',
        ],
      },
      1: {
        content: `En este capítulo podrás aprender:
    Concepto de estructura (proporciones aceptables)
    Definición de Textura o trama (disposición del pelo)
    Densidad (proporciones correctas)`,
        downloads: [
          '/pdf-mery/estilismo-cejas/Estilismo-de-Cejas-Capitulo-II.pdf',
        ],
      },
      2: {
        content: `

En este video te muestro como realizar tus prácticas para poder aplicar todos los conceptos aprendidos. 

    ✔ Práctica de caja en revistas.
    ✔ Práctica de tiempos del pelo, proporciones de estructura y densidad en fotos.
    ✔ Ejercicio de Estructura, proporciones y textura descargable. Imprimilo para poder resolverlo.

`,
        downloads: ['/pdf-mery/practicas/Practicas-para-imprimir.pdf'],
      },
      3: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio de Modelado de Cejas. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Modelado.pdf'],
      },
      4: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio de Laminado o Alisado de Cejas. Conocé todas las herramientas e insumos que utilizo y que recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Laminado.pdf'],
      },
      5: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestros servicios de Maquillaje hiper realista de Cejas. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/estilismo-cejas/Servicios-Maquillaje.pdf'],
      },
      6: {
        content: `En este capítulo te cuento como creé esta increíble técnica que brinda respuesta a infinidad de casos. Sus fundamentos y su lógica. Porque todo tiene una explicación te voy a compartir todo acerca de este servicio exclusivo By Mery Garcia.`,
        downloads: ['/pdf-mery/refill/Refill-Teoria-y-fundamentos.pdf'],
      },
      7: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio exclusivo: Refill created By Mery Garcia. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: ['/pdf-mery/refill/Servicios-Refill.pdf'],
      },
      8: {
        content: `En este video te muestro como realizar tus prácticas para poder aplicar todos los conceptos aprendidos acerca de esta técnica. `,
        downloads: [],
      },
    },

    // ============================================
    // CURSO: Camuflaje
    // ID: cmgj1h3qk000mo11vxtffk6ny
    // ============================================
    cmgj1h3qk000mo11vxtffk6ny: {
      0: {
        content: `Introducción`,
        downloads: ['/pdf-mery/camuflaje/CAMUFLAJE-SIMPLE-Introduccion.pdf'],
      },
      1: {
        content: `Fundamentos`,
        downloads: ['/pdf-mery/camuflaje/CAMUFLAJE-SIMPLE-Fundamentals.pdf'],
      },
      2: {
        content: `Movimientos`,
        downloads: ['/pdf-mery/camuflaje/CAMUFLAJE-SIMPLE-Colorimetria.pdf'],
      },
      3: {
        content: `Anestesia y Consulta`,
        downloads: [
          '/pdf-mery/camuflaje/CAMUFLAJE-SIMPLE-Piel-y-profundidad.pdf',
        ],
      },
      4: {
        content: `Paso a Paso`,
        downloads: ['/pdf-mery/camuflaje/CAMUFLAJE-SIMPLE-Paso-a-Paso.pdf'],
      },
    },

    // ============================================
    // CURSO: Microblading
    // ID: cmgizyuju0000ql1vruyxxpi8
    // ============================================
    cmgizyuju0000ql1vruyxxpi8: {
      0: {
        content: `Bievenido al primer capitulo.`,
        downloads: ['/pdf-mery/microblading/Microblading-Introduccion.pdf'],
      },
      1: {
        content: `En este video te muestro los principales aspectos a tener en cuenta con respecto a la higiene y cuidados durante el proceso de armado y desarmado de tu estación de trabajo. En el PDF te brindo mucha más información acerca de Bioseguridad para que brindes un servicio seguro, cuidando a tus clientas, tu equipo y tu persona.`,
        downloads: [
          '/pdf-mery/microblading/Microblading-Higiene-armado-y-desarmado-de-estacion.pdf',
        ],
      },
      2: {
        content: `En este capítulo podrás aprender:

    Las capas de la piel.
    El músculo superciliar: como regular la profundidad.
    El movimiento pendular.
    En que casos no es oportuno realizar el servicio de Microblading.`,
        downloads: [
          '/pdf-mery/microblading/Microblading-Piel-y-Profundidad.pdf',
        ],
      },
      3: {
        content: `En este capítulo te muestro los dos dibujos posibles dentro de la técnica MG para crear la trama. Trama unidireccional y trama bidireccional.`,
        downloads: [
          '/pdf-mery/microblading/Microblading-Dibujo-y-estructura.pdf',
        ],
      },
      4: {
        content: `En este video dedicado 100% a Colorimetría te muestro como formar el principal color con el que trabajaremos: El Marrón. Además, te muestro toda la colorimetría aplicada a los pigmentos: mi selección y mis combinaciones.`,
        downloads: ['/pdf-mery/microblading/Microblading-Colorimetria.pdf'],
      },
      5: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestros servicios de Maquillaje hiper realista de Cejas. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: [],
      },
      6: {
        content: `En este capítulo te cuento como creé esta increíble técnica que brinda respuesta a infinidad de casos. Sus fundamentos y su lógica. Porque todo tiene una explicación te voy a compartir todo acerca de este servicio exclusivo By Mery Garcia.`,
        downloads: [],
      },
      7: {
        content: `Te muestro el paso a paso, de principio a fin, de nuestro servicio exclusivo: Refill created By Mery Garcia. Conocé todas las herramientas e insumos que utilizo y recomiendo. Lográ resultados increíbles.`,
        downloads: [],
      },
    },
  };

  // Lookup usando courseId + lesson.order
  const extras = courseContent[courseId]?.[lesson.order];

  if (!extras) {
    return null;
  }

  return (
    <div
      className={`bg-[#FBE8EA] dark:bg-[#2d2d2d]/80 rounded-lg shadow-xl overflow-hidden font-admin ${className}`}
    >
      {/* Tabs Header */}
      <div className='flex border-b border-gray-300 dark:border-gray-600'>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-6 py-3 text-sm font-medium tracking-wide transition-colors ${
            activeTab === 'content'
              ? 'bg-white dark:bg-[#3d3d3d] text-[#2B2B2B] dark:text-white border-b-2 border-[#EBA2A8]'
              : 'text-[#2B2B2B] dark:text-gray-400 hover:bg-white/50 dark:hover:bg-[#3d3d3d]/50'
          }`}
        >
          CONTENIDOS
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex-1 px-6 py-3 text-sm font-medium tracking-wide transition-colors ${
            activeTab === 'downloads'
              ? 'bg-white dark:bg-[#3d3d3d] text-[#2B2B2B] dark:text-white border-b-2 border-[#EBA2A8]'
              : 'text-[#2B2B2B] dark:text-gray-400 hover:bg-white/50 dark:hover:bg-[#3d3d3d]/50'
          }`}
        >
          DESCARGAS
        </button>
      </div>

      {/* Tab Content */}
      <div className='p-6 bg-[#EBA2A8]'>
        {activeTab === 'content' ? (
          <div className='text-white leading-relaxed'>
            <p className='whitespace-pre-line'>{extras.content}</p>
          </div>
        ) : extras.downloads && extras.downloads.length > 0 ? (
          <div className='space-y-3'>
            {extras.downloads.map((pdfUrl: string, index: number) => {
              const fileName =
                pdfUrl.split('/').pop()?.replace('.pdf', '') ||
                `Documento ${index + 1}`;
              const formattedName = fileName.replace(/-/g, ' ');

              return (
                <a
                  key={index}
                  href={pdfUrl}
                  download
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-4 p-4 bg-white/90 hover:bg-white rounded-lg transition-colors group border border-white/50 hover:border-white shadow-sm'
                >
                  <img
                    src='/pdf-icon.png'
                    alt='PDF'
                    className='w-8 h-8 flex-shrink-0'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-[#2B2B2B] font-medium text-sm group-hover:text-[#660e1b] transition-colors'>
                      {formattedName}
                    </p>
                    <p className='text-xs text-[#545454] mt-1'>
                      Click para descargar PDF
                    </p>
                  </div>
                  <svg
                    className='w-5 h-5 text-[#660e1b] flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </a>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-12'>
            <FileText className='w-16 h-16 text-white/60 mx-auto mb-4' />
            <p className='text-white text-sm font-medium mb-2'>
              Sin descargas disponibles
            </p>
            <p className='text-xs text-white/80'>
              Esta lección no tiene materiales adicionales para descargar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
