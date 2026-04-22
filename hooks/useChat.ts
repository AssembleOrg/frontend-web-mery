'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { chatApi, type ChatMessage } from '@/lib/chat-api';
import { disconnectChatSocket, getChatSocket } from '@/lib/chat-socket';

export function useChatConnection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUnreadTotal = useChatStore((s) => s.setUnreadTotal);
  const bumpUnread = useChatStore((s) => s.bumpUnread);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const upsertRoom = useChatStore((s) => s.upsertRoom);
  const setTyping = useChatStore((s) => s.setTyping);

  const boundRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectChatSocket();
      useChatStore.getState().clear();
      boundRef.current = false;
      return;
    }

    const socket = getChatSocket();

    const onMessage = (message: ChatMessage) => {
      console.info('[ChatSocket] 📨 message recibido', {
        roomId: message.roomId,
        from: message.senderRole,
      });
      appendMessage(message.roomId, message);
      const active = useChatStore.getState().activeRoomId;
      if (active !== message.roomId) {
        // sala no abierta → badge
        bumpUnread(1);
      } else {
        // sala abierta → marcar leído automáticamente para que
        // el otro lado vea el doble tick.
        void chatApi.markRead(message.roomId).catch(() => {});
        try {
          const s = getChatSocket();
          if (s.connected) s.emit('mark_read', { roomId: message.roomId });
        } catch {
          /* noop */
        }
      }
    };
    const onUnreadChanged = async () => {
      try {
        const { total } = await chatApi.unreadCount();
        setUnreadTotal(total);
      } catch {
        /* ignore */
      }
    };
    const onTyping = (p: {
      roomId: string;
      userId: string;
      role: string;
      typing: boolean;
    }) => {
      setTyping(p.roomId, p.typing ? { userId: p.userId, role: p.role } : null);
    };
    const onReadReceipt = (p: {
      roomId: string;
      readerRole: 'ADMIN' | 'SUBADMIN' | 'USER';
      readAt: string;
    }) => {
      // El que leyó es la contraparte; los mensajes que ahora quedan "vistos"
      // son los que YO mandé (rol opuesto al lector en el contexto del chat).
      const fromRole: 'STUDENT' | 'ADMIN' =
        p.readerRole === 'ADMIN' || p.readerRole === 'SUBADMIN'
          ? 'STUDENT'
          : 'ADMIN';
      useChatStore
        .getState()
        .markMessagesReadFrom(p.roomId, fromRole, p.readAt);
    };

    if (!boundRef.current) {
      socket.on('message', onMessage);
      socket.on('unread_changed', onUnreadChanged);
      socket.on('typing', onTyping);
      socket.on('read_receipt', onReadReceipt);
      boundRef.current = true;
    }

    // Inicial: cuenta global
    chatApi
      .unreadCount()
      .then((r) => setUnreadTotal(r.total))
      .catch(() => {});

    return () => {
      socket.off('message', onMessage);
      socket.off('unread_changed', onUnreadChanged);
      socket.off('typing', onTyping);
      socket.off('read_receipt', onReadReceipt);
      boundRef.current = false;
    };
  }, [isAuthenticated, appendMessage, bumpUnread, setTyping, setUnreadTotal, upsertRoom]);
}

/**
 * Intenta usar el socket si está conectado; devuelve true si se pudo emitir.
 * Si no está conectado, devuelve false y el caller debería hacer fallback a HTTP.
 */
function trySocketEmit(event: string, payload: unknown): boolean {
  try {
    const socket = getChatSocket();
    if (!socket.connected) return false;
    socket.emit(event, payload);
    return true;
  } catch {
    return false;
  }
}

export function useChatRoom(roomId: string | null) {
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const upsertRoom = useChatStore((s) => s.upsertRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const markRoomRead = useChatStore((s) => s.markRoomRead);

  useEffect(() => {
    if (!roomId) return;
    setActiveRoom(roomId);
    try {
      const socket = getChatSocket();
      const join = () => {
        console.info('[ChatSocket] → join_room', roomId);
        socket.emit(
          'join_room',
          { roomId },
          (ack: { ok: boolean; error?: string }) => {
            console.info('[ChatSocket] ← join_room ack', ack);
          },
        );
      };
      if (socket.connected) join();
      else socket.once('connect', join);
    } catch (err) {
      console.warn('[ChatSocket] join_room skipped:', err);
    }

    return () => {
      try {
        getChatSocket().emit('leave_room', { roomId });
      } catch {
        /* noop */
      }
      setActiveRoom(null);
    };
  }, [roomId, setActiveRoom]);

  const loadInitial = useCallback(async () => {
    if (!roomId) return null;
    const { items, nextCursor } = await chatApi.messages(roomId);
    setMessages(roomId, items);
    return nextCursor;
  }, [roomId, setMessages]);

  const loadOlder = useCallback(
    async (cursor: string) => {
      if (!roomId) return null;
      const { items, nextCursor } = await chatApi.messages(roomId, cursor);
      prependMessages(roomId, items);
      return nextCursor;
    },
    [roomId, prependMessages],
  );

  const sendText = useCallback(
    async (content: string) => {
      if (!roomId || !content.trim()) return;
      const clean = content.trim();
      // Envío primario vía HTTP — siempre funciona. El backend además
      // broadcastea por WS a otros clientes conectados.
      const msg = await chatApi.send(roomId, { content: clean });
      appendMessage(roomId, msg);
    },
    [roomId, appendMessage],
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!roomId) return;
      const { url, key } = await chatApi.uploadImage(roomId, file);
      const msg = await chatApi.send(roomId, { imageUrl: url, imageKey: key });
      appendMessage(roomId, msg);
    },
    [roomId, appendMessage],
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      if (!roomId) return;
      trySocketEmit('typing', { roomId, typing });
    },
    [roomId],
  );

  const markRead = useCallback(async () => {
    if (!roomId) return;
    // Mark read vía HTTP (fuente de verdad); socket opcional para UX realtime.
    try {
      await chatApi.markRead(roomId);
    } catch {
      /* noop */
    }
    trySocketEmit('mark_read', { roomId });
    markRoomRead(roomId);
    try {
      const r = await chatApi.unreadCount();
      useChatStore.getState().setUnreadTotal(r.total);
    } catch {
      /* noop */
    }
  }, [roomId, markRoomRead]);

  return {
    loadInitial,
    loadOlder,
    sendText,
    sendImage,
    setTyping,
    markRead,
    upsertRoom,
  };
}
