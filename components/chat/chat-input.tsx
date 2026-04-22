'use client';

import { useRef, useState } from 'react';
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
      // eslint-disable-next-line no-alert
      alert((err as Error).message);
    }
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    try {
      await onSendImage(file);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className='border-t border-border bg-white dark:bg-card px-3 py-2 flex items-end gap-2'>
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
        className='p-2 rounded-full hover:bg-muted disabled:opacity-50'
        disabled={disabled || uploading}
        onClick={() => fileRef.current?.click()}
        aria-label='Adjuntar imagen'
      >
        {uploading ? (
          <Loader2 className='w-5 h-5 animate-spin' />
        ) : (
          <ImageIcon className='w-5 h-5 text-[#eba2a8]' />
        )}
      </button>
      <textarea
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
        className='flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2 text-sm leading-relaxed max-h-32 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] disabled:opacity-60'
      />
      <button
        type='button'
        disabled={disabled || !value.trim()}
        onClick={() => void handleSend()}
        className='p-2 rounded-full bg-[#f9bbc4] text-white hover:bg-[#eba2a8] disabled:opacity-50 disabled:cursor-not-allowed'
        aria-label='Enviar'
      >
        <Send className='w-5 h-5' />
      </button>
    </div>
  );
}
