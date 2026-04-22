'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useChatRoom } from '@/hooks/useChat';
import { useAuthStore } from '@/stores/auth-store';
import type { ChatMessage, ChatRoom } from '@/lib/chat-api';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatInput } from './chat-input';
import { ChatWarning } from './chat-warning';
import { Loader2, Lock, Clock, ChevronLeft } from 'lucide-react';

interface Props {
  room: ChatRoom;
  showCounterpart?: boolean;
  onMobileBack?: () => void;
}

const EMPTY_MESSAGES: readonly ChatMessage[] = Object.freeze([]);

export function ChatRoomPanel({ room, showCounterpart = false, onMobileBack }: Readonly<Props>) {
  const messages = useChatStore((s) => s.messages[room.id] ?? EMPTY_MESSAGES);
  const typing = useChatStore((s) => s.typing[room.id] ?? null);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUBADMIN';

  const { loadInitial, loadOlder, sendText, sendImage, setTyping, markRead } = useChatRoom(room.id);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(0);

  // 1. CARGA INICIAL
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingInitial(true);
      try {
        const nextCursor = await loadInitial();
        if (mounted) setOlderCursor(nextCursor ?? null);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
      void markRead();
    })();
    return () => { mounted = false; };
  }, [room.id, loadInitial, markRead]);

  // 2. FIX: AUTO-SCROLL AL FINAL CUANDO CARGA POR PRIMERA VEZ
  useEffect(() => {
    if (!loadingInitial && scrollRef.current) {
      const el = scrollRef.current;
      // Pequeño timeout para asegurar que el DOM de los mensajes ya se renderizó
      const timeout = setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loadingInitial]);

  // 3. AUTO-SCROLL CUANDO LLEGAN MENSAJES NUEVOS
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const prevLen = prevMessagesLengthRef.current;
    const nextLen = messages.length;
    if (nextLen > prevLen) {
      el.scrollTop = el.scrollHeight;
    }
    prevMessagesLengthRef.current = nextLen;
  }, [messages.length, typing]);

  const handleLoadOlder = async () => {
    if (loadingOlder || !olderCursor) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const next = await loadOlder(olderCursor);
      setOlderCursor(next);
      requestAnimationFrame(() => {
        if (!el) return;
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
      });
    } finally {
      setLoadingOlder(false);
    }
  };

  const disabled = room.status === 'LOCKED' || room.status === 'CLOSED';
  const counterpartName = [room.user.firstName, room.user.lastName].filter(Boolean).join(' ') || room.user.email;

  return (
    // Estructura Rígida: h-full y overflow-hidden para que el footer no se escape
    <div className='flex flex-col h-full w-full overflow-hidden bg-[#fafafa] dark:bg-background m-0 p-0'>
      
      {/* Header: shrink-0 garantiza que NO se mueva */}
      {showCounterpart && (
        <div className='shrink-0 border-b border-border bg-white/80 backdrop-blur-md dark:bg-card px-3 py-3 flex items-center gap-3 z-20 w-full'>
          {onMobileBack && (
            <button onClick={onMobileBack} className='md:hidden p-1.5 -ml-1 text-muted-foreground hover:bg-muted/50 rounded-full shrink-0'>
              <ChevronLeft className='w-6 h-6' />
            </button>
          )}
          <div className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-xs md:text-sm font-semibold shrink-0'>
            {counterpartName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='font-medium text-foreground truncate text-sm md:text-base'>{counterpartName}</div>
            <div className='text-[10px] md:text-xs text-muted-foreground truncate'>{room.category.name}</div>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
      )}

      {/* Zona de Mensajes: Es el ÚNICO que tiene permitido scrollear */}
<div ref={scrollRef} className='flex-1 overflow-y-auto min-h-0 w-full px-3 py-4 space-y-3'>
        {loadingInitial ? (
          <div className='h-full flex items-center justify-center'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <>
            {olderCursor && messages.length > 0 && (
              <div className='flex justify-center pb-4'>
                <button type='button' onClick={handleLoadOlder} disabled={loadingOlder} className='text-[11px] px-4 py-1.5 rounded-full border border-border bg-white text-muted-foreground hover:border-[#f9bbc4] transition-colors'>
                  {loadingOlder ? 'Cargando...' : 'Ver mensajes anteriores'}
                </button>
              </div>
            )}
            {messages.length === 0 ? (
              <div className='h-full flex items-center justify-center text-muted-foreground text-sm text-center px-10'>
                {isAdmin ? 'Sin mensajes todavía.' : '¡Hola! Escribe tu primera duda aquí.'}
              </div>
            ) : (
              messages.map((m) => (
                <ChatMessageBubble key={m.id} message={m} mine={m.senderId === user?.id} />
              ))
            )}
            {typing && (
              <div className='text-[11px] text-muted-foreground italic px-2'>
                {typing.role === 'ADMIN' ? 'Mery' : counterpartName} está escribiendo...
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer / Input: shrink-0 y fuera del div de scroll asegura que sea STICKY */}
<div className="shrink-0 w-full bg-white dark:bg-card border-t border-border/50 z-20">
        {disabled ? (
          <div className='px-4 py-4 text-[11px] text-muted-foreground flex items-center gap-2 italic'>
             <Lock className='w-3.5 h-3.5' /> Chat deshabilitado.
          </div>
        ) : (
          <ChatInput onSendText={sendText} onSendImage={sendImage} onTyping={setTyping} />
        )}
      </div>
    </div>
  );
}

function RoomStatusBadge({ status }: { status: ChatRoom['status'] }) {
  const map: Record<ChatRoom['status'], { bg: string; dot: string }> = {
    ACTIVE: { bg: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
    GRACE: { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
    LOCKED: { bg: 'bg-gray-50 text-gray-500', dot: 'bg-gray-400' },
    CLOSED: { bg: 'bg-gray-100 text-gray-400', dot: 'bg-gray-300' },
  };
  const meta = map[status];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full shrink-0 ${meta.bg}`}>
      <span className={`w-2 h-2 rounded-full ${meta.dot} animate-pulse`}></span>
      <span className="hidden md:block text-[9px] font-bold uppercase tracking-tighter">Activo</span>
    </div>
  );
}