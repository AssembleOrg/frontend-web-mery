import { create } from 'zustand';
import type { AppNotification } from '@/lib/notifications-api';

const MAX = 50;

interface NotificationsState {
  items: AppNotification[];
  unread: number;
  loaded: boolean;
  setAll: (items: AppNotification[], unread: number) => void;
  setUnread: (n: number) => void;
  add: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unread: 0,
  loaded: false,
  setAll: (items, unread) => set({ items, unread, loaded: true }),
  setUnread: (unread) => set({ unread }),
  add: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s;
      return {
        items: [n, ...s.items].slice(0, MAX),
        unread: s.unread + (n.readAt ? 0 : 1),
      };
    }),
  markRead: (id) =>
    set((s) => {
      const item = s.items.find((x) => x.id === id);
      if (!item || item.readAt) return s;
      const now = new Date().toISOString();
      return {
        items: s.items.map((x) => (x.id === id ? { ...x, readAt: now } : x)),
        unread: Math.max(0, s.unread - 1),
      };
    }),
  markAllRead: () =>
    set((s) => {
      const now = new Date().toISOString();
      return {
        items: s.items.map((x) => (x.readAt ? x : { ...x, readAt: now })),
        unread: 0,
      };
    }),
  clear: () => set({ items: [], unread: 0, loaded: false }),
}));
