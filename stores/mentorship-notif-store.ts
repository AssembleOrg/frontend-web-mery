import { create } from 'zustand';

export interface MentorshipNotif {
  id: string;
  mentorshipId: string;
  type: 'booked' | 'rescheduled' | 'cancelled';
  studentName: string;
  courseName: string;
  start: string;
  receivedAt: number;
  read: boolean;
}

interface State {
  items: MentorshipNotif[];
  unread: number;
  add: (n: Omit<MentorshipNotif, 'id' | 'receivedAt' | 'read'>) => void;
  markAllRead: () => void;
  clear: () => void;
}

const MAX = 30;

export const useMentorshipNotifStore = create<State>((set) => ({
  items: [],
  unread: 0,
  add: (n) =>
    set((s) => {
      const item: MentorshipNotif = {
        ...n,
        id: `${n.mentorshipId}-${n.type}-${Date.now()}`,
        receivedAt: Date.now(),
        read: false,
      };
      return {
        items: [item, ...s.items].slice(0, MAX),
        unread: s.unread + 1,
      };
    }),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((i) => ({ ...i, read: true })),
      unread: 0,
    })),
  clear: () => set({ items: [], unread: 0 }),
}));
