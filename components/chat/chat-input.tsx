'use client';

import { useRef, useState, useEffect } from 'react';
import { ImageIcon, Send, Loader2 } from 'lucide-react';

interface Props {
  disabled?: boolean;
  onSendText: (text: string) => Promise<void> | void;
  onSendImage: (file: File) => Promise<void> | void;
  onTyping?: (typing: boolean) => void;
  placeholder?: string;
}

export function ChatInput({
  disabled,
  onSendText,
  onSendImage,
  onTyping,
  placeholder = 'Escribí un mensaje…',
}: Props) {
  const [value, setValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // EFECTO PREMIUM: Auto-resize + Ocultar scroll si no es necesario
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = textarea.scrollHeight;
      textarea.style.height = `${newHeight}px`;

      // Si el texto es corto, ocultamos el scroll para evitar las flechas
      // 128px es el max-h-32 que pusimos en Tailwind
      if (newHeight > 120) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [value]);

  const triggerTyping = () => {
    if (!onTyping) return;
    onTyping(true);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleSend = async () => {
    if (!value.trim() || disabled) return;
    const text = value;
    setValue('');
    onTyping?.(false);
    try {
      await onSendText(text);
    } catch (err) {
      setValue(text);
      alert((err as Error).message);
    }
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    try {
      await onSendImage(file);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className='border-t border-border bg-white dark:bg-card px-3 py-3 flex items-end gap-2 w-full relative' style={{ touchAction: 'none' }}>
      {/* ESTILO PARA QUITAR FLECHAS (SCROLLBAR) */}
      <style jsx>{`
        textarea::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        textarea {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
      `}</style>

      <input
        ref={fileRef}
        type='file'
        accept='image/png,image/jpeg,image/jpg,image/webp'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImage(f);
        }}
      />
      
      <button
        type='button'
        className='p-2 rounded-full hover:bg-muted disabled:opacity-50 shrink-0 transition-colors mb-0.5'
        disabled={disabled || uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className='w-5 h-5 animate-spin' />
        ) : (
          <ImageIcon className='w-5 h-5 text-[#eba2a8]' />
        )}
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          triggerTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        // min-w-0 y overflow-hidden por defecto son la clave
        className='flex-1 min-w-0 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm leading-normal max-h-32 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] disabled:opacity-60 transition-all overflow-hidden'
      />

      <button
        type='button'
        disabled={disabled || !value.trim()}
        onClick={() => void handleSend()}
        className='p-2.5 rounded-full bg-[#f9bbc4] text-white hover:bg-[#eba2a8] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shrink-0 transition-all flex items-center justify-center shadow-sm mb-0.5'
      >
        <Send className='w-5 h-5' />
      </button>
    </div>
  );
}