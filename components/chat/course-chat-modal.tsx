'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { ChatRoom } from '@/lib/chat-api';
import { ChatRoomPanel } from './chat-room-panel';

interface Props {
  room: ChatRoom;
  title: string;
  onClose: () => void;
}

export function CourseChatModal({ room, title, onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4'>
      <div className='w-full sm:max-w-2xl h-[92vh] sm:h-[80vh] bg-white dark:bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-[#f9bbc4]/20'>
          <div className='min-w-0'>
            <div className='text-xs uppercase tracking-wider text-[#660e1b] dark:text-[#f9bbc4]'>
              Chat del curso
            </div>
            <div className='font-bold text-foreground truncate'>{title}</div>
          </div>
          <button
            onClick={onClose}
            aria-label='Cerrar'
            className='p-2 rounded-full hover:bg-white/60 dark:hover:bg-card transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='flex-1 min-h-0'>
          <ChatRoomPanel room={room} />
        </div>
      </div>
    </div>
  );
}
