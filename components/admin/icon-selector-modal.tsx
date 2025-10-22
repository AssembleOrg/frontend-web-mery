'use client';

import { X, Check } from 'lucide-react';
import Image from 'next/image';

interface IconSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconPath: string) => void;
  selectedIcon?: string;
}

const AVAILABLE_ICONS = [
  { path: '/intro-icon.png', label: 'Introducción' },
  { path: '/icons/pdf.svg', label: 'PDF' },
  { path: '/icons/play.svg', label: 'Video' },
];

export function IconSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}: IconSelectorModalProps) {
  if (!isOpen) return null;

  const handleSelect = (iconPath: string) => {
    onSelect(iconPath);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-primary font-bold text-gray-900'>
            Selecciona un Icono
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Icon Grid */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon.path}
              onClick={() => handleSelect(icon.path)}
              className={`relative p-6 border-2 rounded-lg transition-all hover:shadow-md ${
                selectedIcon === icon.path
                  ? 'border-[#660e1b] bg-[#660e1b]/5'
                  : 'border-gray-200 hover:border-[#660e1b]/50'
              }`}
            >
              {selectedIcon === icon.path && (
                <div className='absolute top-2 right-2 bg-[#660e1b] text-white rounded-full p-1'>
                  <Check className='w-4 h-4' />
                </div>
              )}
              <div className='flex flex-col items-center gap-3'>
                <div className='relative w-16 h-16 flex items-center justify-center'>
                  <Image
                    src={icon.path}
                    alt={icon.label}
                    width={64}
                    height={64}
                    className='object-contain'
                  />
                </div>
                <p className='text-sm font-medium text-gray-700'>{icon.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 pt-4 border-t'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
