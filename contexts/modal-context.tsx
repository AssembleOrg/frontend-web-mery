'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog } from '@/components/ui/dialog';

interface ModalOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  showAlert: (options: ModalOptions) => void;
  showConfirm: (options: ModalOptions) => Promise<boolean>;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    confirmText?: string;
    cancelText?: string;
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: '',
    type: 'info',
    showCancel: false,
  });

  const [confirmResolve, setConfirmResolve] = useState<((value: boolean) => void) | null>(null);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolve) {
      confirmResolve(false);
      setConfirmResolve(null);
    }
  }, [confirmResolve]);

  const showAlert = useCallback((options: ModalOptions) => {
    setModalState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || 'Aceptar',
      showCancel: false,
    });
  }, []);

  const showConfirm = useCallback((options: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmResolve(() => resolve);
      setModalState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        showCancel: true,
        onConfirm: () => {
          resolve(true);
          setConfirmResolve(null);
        },
      });
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({ message, title: title || '¡Éxito!', type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert({ message, title: title || 'Error', type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({ message, title: title || 'Advertencia', type: 'warning' });
  }, [showAlert]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showSuccess, showError, showWarning }}>
      {children}
      <Dialog
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        onConfirm={modalState.onConfirm}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

