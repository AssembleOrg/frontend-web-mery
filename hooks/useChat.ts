'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import {
  chatApi,
  type ChatMessage,
  type ChatRoom,
} from '@/lib/chat-api';
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
      appendMessage(message.roomId, message);
      // Si no es la sala activa, incrementar badge
      const active = useChatStore.getState().activeRoomId;
      if (active !== message.roomId) {
        bumpUnread(1);
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
    const onReadReceipt = (p: { roomId: string }) => {
      upsertRoom({ id: p.roomId } as ChatRoom);
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

export function useChatRoom(roomId: string | null) {
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const upsertRoom = useChatStore((s) => s.upsertRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const markRoomRead = useChatStore((s) => s.markRoomRead);

  useEffect(() => {
    if (!roomId) return;
    setActiveRoom(roomId);
    const socket = getChatSocket();
    const join = () => socket.emit('join_room', { roomId });
    if (socket.connected) join();
    else socket.once('connect', join);

    return () => {
      socket.emit('leave_room', { roomId });
      setActiveRoom(null);
    };
  }, [roomId, setActiveRoom]);

  const loadInitial = useCallback(async () => {
    if (!roomId) return;
    const { items } = await chatApi.messages(roomId);
    setMessages(roomId, items);
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
      const socket = getChatSocket();
      socket.emit('send_message', { roomId, content: content.trim() });
    },
    [roomId],
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!roomId) return;
      const { url, key } = await chatApi.uploadImage(roomId, file);
      const socket = getChatSocket();
      socket.emit('send_message', { roomId, imageUrl: url, imageKey: key });
    },
    [roomId],
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      if (!roomId) return;
      const socket = getChatSocket();
      socket.emit('typing', { roomId, typing });
    },
    [roomId],
  );

  const markRead = useCallback(async () => {
    if (!roomId) return;
    const socket = getChatSocket();
    socket.emit('mark_read', { roomId });
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
