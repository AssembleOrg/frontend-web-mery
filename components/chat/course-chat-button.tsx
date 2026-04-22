'use client';

import { MessageCircle, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { chatApi, type ChatRoom, type EligibilityInfo } from '@/lib/chat-api';
import { CourseChatModal } from './course-chat-modal';

interface Props {
  categoryId: string;
  categoryName: string;
}

export function CourseChatButton({ categoryId, categoryName }: Props) {
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [info, setInfo] = useState<EligibilityInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { room, computed } = await chatApi.myRoomForCategory(categoryId);
        if (!cancelled) {
          setRoom(room);
          setInfo(computed);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  if (loading) {
    return (
      <button
        disabled
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm opacity-60'
      >
        <MessageCircle className='w-4 h-4' />
        Cargando chat…
      </button>
    );
  }

  if (error || !room || !info) {
    return null;
  }

  const locked = room.status === 'LOCKED';
  const closed = room.status === 'CLOSED';

  if (closed) {
    return (
      <div className='mt-3 text-xs text-muted-foreground text-center'>
        Chat cerrado (período de 90 días post-expiración finalizado).
      </div>
    );
  }

  if (locked) {
    const remaining = Math.max(
      0,
      info.videosTotal - info.videosCompleted,
    );
    return (
      <button
        disabled
        title='Completá todos los videos del curso (95% o más) para desbloquear el chat'
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm cursor-not-allowed'
      >
        <Lock className='w-4 h-4' />
        <span>
          Chat bloqueado · faltan {remaining} video
          {remaining === 1 ? '' : 's'}
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-[#f9bbc4] text-[#660e1b] dark:text-[#f9bbc4] hover:bg-[#f9bbc4] hover:text-white dark:hover:text-[#3a1f26] text-sm font-primary font-medium transition-colors'
      >
        <MessageCircle className='w-4 h-4' />
        Entrar al chat
      </button>
      {open && (
        <CourseChatModal
          room={room}
          title={categoryName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
