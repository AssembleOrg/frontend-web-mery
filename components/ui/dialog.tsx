'use client';

import { Fragment } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const iconMap = {
  info: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  warning: { Icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  error: { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  showCancel = false,
}: DialogProps) {
  if (!isOpen) return null;

  const { Icon, color, bg } = iconMap[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Content */}
        <div className='p-6'>
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>

          {/* Title */}
          {title && (
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {title}
            </h3>
          )}

          {/* Message */}
          <p className='text-gray-600 mb-6 whitespace-pre-wrap'>
            {message}
          </p>

          {/* Actions */}
          <div className='flex gap-3 justify-end'>
            {showCancel && (
              <button
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                type === 'error' || type === 'warning'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#660e1b] hover:bg-[#4a0a14]'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

