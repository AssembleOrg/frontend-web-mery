import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ChatMessage, ChatRoom } from '@/lib/chat-api';

type RoomId = string;

interface ChatState {
  rooms: Record<RoomId, ChatRoom>;
  messages: Record<RoomId, ChatMessage[]>;
  typing: Record<RoomId, { userId: string; role: string } | null>;
  unreadTotal: number;
  activeRoomId: RoomId | null;
  mobileFullScreen: boolean;
}

interface ChatActions {
  setRooms: (rooms: ChatRoom[]) => void;
  upsertRoom: (room: ChatRoom) => void;
  setMessages: (roomId: RoomId, messages: ChatMessage[]) => void;
  prependMessages: (roomId: RoomId, messages: ChatMessage[]) => void;
  appendMessage: (roomId: RoomId, message: ChatMessage) => void;
  /**
   * Marca como leídos (setea `readAt`) todos los mensajes de una sala
   * que vienen de `fromRole`. Se invoca cuando llega el `read_receipt`
   * del otro lado.
   */
  markMessagesReadFrom: (
    roomId: RoomId,
    fromRole: 'STUDENT' | 'ADMIN',
    readAt: string,
  ) => void;
  markRoomRead: (roomId: RoomId) => void;
  setTyping: (
    roomId: RoomId,
    typing: { userId: string; role: string } | null,
  ) => void;
  setUnreadTotal: (n: number) => void;
  setActiveRoom: (roomId: RoomId | null) => void;
  bumpUnread: (delta: number) => void;
  setMobileFullScreen: (v: boolean) => void;
  clear: () => void;
}

const initialState: ChatState = {
  rooms: {},
  messages: {},
  typing: {},
  unreadTotal: 0,
  activeRoomId: null,
  mobileFullScreen: false,
};

export const useChatStore = create<ChatState & ChatActions>()(
  immer((set) => ({
    ...initialState,
    setRooms: (rooms) =>
      set((s) => {
        s.rooms = Object.fromEntries(rooms.map((r) => [r.id, r]));
      }),
    upsertRoom: (room) =>
      set((s) => {
        s.rooms[room.id] = { ...(s.rooms[room.id] ?? {}), ...room };
      }),
    setMessages: (roomId, messages) =>
      set((s) => {
        s.messages[roomId] = messages;
      }),
    prependMessages: (roomId, messages) =>
      set((s) => {
        const existing = s.messages[roomId] ?? [];
        const ids = new Set(existing.map((m) => m.id));
        const deduped = messages.filter((m) => !ids.has(m.id));
        s.messages[roomId] = [...deduped, ...existing];
      }),
    appendMessage: (roomId, message) =>
      set((s) => {
        const existing = s.messages[roomId] ?? [];
        if (existing.some((m) => m.id === message.id)) return;
        s.messages[roomId] = [...existing, message];
        if (s.rooms[roomId]) {
          s.rooms[roomId].lastMessageAt = message.createdAt;
        }
      }),
    markMessagesReadFrom: (roomId, fromRole, readAt) =>
      set((s) => {
        const list = s.messages[roomId];
        if (!list) return;
        s.messages[roomId] = list.map((m) =>
          m.senderRole === fromRole && !m.readAt ? { ...m, readAt } : m,
        );
      }),
    markRoomRead: (roomId) =>
      set((s) => {
        if (s.rooms[roomId]) s.rooms[roomId].unread = 0;
      }),
    setTyping: (roomId, typing) =>
      set((s) => {
        s.typing[roomId] = typing;
      }),
    setUnreadTotal: (n) =>
      set((s) => {
        s.unreadTotal = Math.max(0, n);
      }),
    setActiveRoom: (roomId) =>
      set((s) => {
        s.activeRoomId = roomId;
      }),
    bumpUnread: (delta) =>
      set((s) => {
        s.unreadTotal = Math.max(0, s.unreadTotal + delta);
      }),
    setMobileFullScreen: (v) =>
      set((s) => {
        s.mobileFullScreen = v;
      }),
    clear: () => set(() => ({ ...initialState })),
  })),
);
