'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useChatRoom } from '@/hooks/useChat';
import { useAuthStore } from '@/stores/auth-store';
import type { ChatRoom } from '@/lib/chat-api';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatInput } from './chat-input';
import { ChatWarning } from './chat-warning';
import { Loader2, Lock, Clock } from 'lucide-react';

interface Props {
  room: ChatRoom;
  /** Si se muestra encabezado con datos del alumno (vista admin). */
  showCounterpart?: boolean;
}

export function ChatRoomPanel({ room, showCounterpart = false }: Props) {
  const messages = useChatStore((s) => s.messages[room.id] ?? []);
  const typing = useChatStore((s) => s.typing[room.id] ?? null);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUBADMIN';

  const { loadInitial, loadOlder, sendText, sendImage, setTyping, markRead } =
    useChatRoom(room.id);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingInitial(true);
      try {
        await loadInitial();
      } finally {
        if (mounted) setLoadingInitial(false);
      }
      void markRead();
    })();
    return () => {
      mounted = false;
    };
  }, [room.id, loadInitial, markRead]);

  // auto scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  const disabled =
    room.status === 'LOCKED' || room.status === 'CLOSED' ? true : false;
  const disabledReason =
    room.status === 'CLOSED'
      ? 'Esta conversación quedó en solo lectura después de 90 días.'
      : room.status === 'LOCKED'
      ? 'Completá los videos del curso (95% o más) para desbloquear el chat.'
      : null;

  const counterpartName =
    [room.user.firstName, room.user.lastName].filter(Boolean).join(' ') ||
    room.user.email;

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop < 40 &&
      !loadingOlder &&
      messages.length > 0 &&
      olderCursor !== null
    ) {
      setLoadingOlder(true);
      try {
        const next = await loadOlder(olderCursor ?? messages[0].id);
        setOlderCursor(next);
      } finally {
        setLoadingOlder(false);
      }
    }
  };

  return (
    <div className='flex flex-col h-full bg-[#fafafa] dark:bg-background'>
      {showCounterpart && (
        <div className='border-b border-border bg-white dark:bg-card px-4 py-3 flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-sm font-semibold'>
            {counterpartName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='font-medium text-foreground truncate'>
              {counterpartName}
            </div>
            <div className='text-xs text-muted-foreground truncate'>
              {room.category.name} · {room.user.email}
            </div>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
      )}

      {!showCounterpart && <ChatWarning roomId={room.id} />}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className='flex-1 overflow-y-auto px-3 py-4 space-y-2'
      >
        {loadingInitial ? (
          <div className='h-full flex items-center justify-center text-muted-foreground'>
            <Loader2 className='w-5 h-5 animate-spin' />
          </div>
        ) : messages.length === 0 ? (
          <div className='h-full flex items-center justify-center text-muted-foreground text-sm text-center px-8'>
            {isAdmin
              ? 'Sin mensajes todavía.'
              : 'Saludá a tu profesora y empezá la conversación cuando quieras.'}
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              mine={m.senderId === user?.id}
            />
          ))
        )}
        {typing && (
          <div className='text-xs text-muted-foreground px-2'>
            {typing.role === 'ADMIN' ? 'Mery' : counterpartName} está escribiendo…
          </div>
        )}
      </div>

      {disabled ? (
        <div className='border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2'>
          {room.status === 'CLOSED' ? (
            <Clock className='w-4 h-4' />
          ) : (
            <Lock className='w-4 h-4' />
          )}
          <span>{disabledReason}</span>
        </div>
      ) : (
        <ChatInput
          onSendText={sendText}
          onSendImage={sendImage}
          onTyping={setTyping}
        />
      )}
    </div>
  );
}

function RoomStatusBadge({ status }: { status: ChatRoom['status'] }) {
  const map: Record<ChatRoom['status'], { label: string; className: string }> =
    {
      ACTIVE: {
        label: 'Activo',
        className:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      },
      GRACE: {
        label: 'En gracia',
        className:
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      },
      LOCKED: {
        label: 'Bloqueado',
        className:
          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
      },
      CLOSED: {
        label: 'Cerrado',
        className:
          'bg-gray-200 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400',
      },
    };
  const meta = map[status];
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
