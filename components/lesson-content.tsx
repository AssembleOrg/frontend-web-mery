'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  // Este objeto debe llenarse dinámicamente desde el backend o lesson.description
  const courseContent: Record<
    string,
    Record<number, { content: string; downloads: any[] }>
  > = {
    // Objeto vacío - los datos ahora vienen del backend en lesson.description y lesson.downloadableFiles
  };

  // Lookup usando courseId + lesson.order
  const extras = courseContent[courseId]?.[lesson.order];

  // Si no hay extras hardcodeados, usar los datos del lesson directamente
  const content = extras?.content || lesson.description || 'Sin contenido disponible';
  const downloads = extras?.downloads || lesson.downloadableFiles || [];

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
            <p className='whitespace-pre-line'>{content}</p>
          </div>
        ) : downloads && downloads.length > 0 ? (
          <div className='space-y-3'>
            {downloads.map((file: any, index: number) => {
              // Soporte para ambos formatos: string (URL) o objeto DownloadableFile
              const pdfUrl = typeof file === 'string' ? file : file.url;
              const fileName =
                (typeof file === 'object' ? file.name : null) ||
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
                  <Image
                    src='/pdf-icon.png'
                    alt='PDF'
                    width={32}
                    height={32}
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
