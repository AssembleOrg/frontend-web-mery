import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type ChatRoomStatus = 'LOCKED' | 'ACTIVE' | 'GRACE' | 'CLOSED';
export type ChatMessageType = 'TEXT' | 'IMAGE';
export type ChatSenderRole = 'STUDENT' | 'ADMIN';

export interface ChatUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface ChatCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface ChatRoom {
  id: string;
  status: ChatRoomStatus;
  unlockedAt: string | null;
  gracePeriodEnd: string | null;
  lastMessageAt: string | null;
  studentInitiated: boolean;
  category: ChatCategory;
  user: ChatUser;
  createdAt: string;
  updatedAt: string;
  unread?: number;
  lastMessage?: {
    id: string;
    content: string | null;
    type: ChatMessageType;
    senderRole: ChatSenderRole;
    createdAt: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  type: ChatMessageType;
  content: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  readAt: string | null;
  createdAt: string;
  sender?: ChatUser;
}

export interface EligibilityInfo {
  status: ChatRoomStatus;
  gracePeriodEnd: string | null;
  progressPercent: number;
  videosTotal: number;
  videosCompleted: number;
  purchaseActive: boolean;
}

function authHeaders(): HeadersInit {
  const token = Cookies.get('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    credentials: 'include',
    headers: { ...authHeaders(), ...(init.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { message?: string }).message ||
        `Error ${res.status}: ${res.statusText}`,
    );
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export const chatApi = {
  myRooms: () => api<ChatRoom[]>('/chat/rooms'),
  myRoomForCategory: (categoryId: string) =>
    api<{ room: ChatRoom; computed: EligibilityInfo }>(
      `/chat/rooms/by-category/${categoryId}`,
    ),
  unreadCount: () => api<{ total: number }>('/chat/unread-count'),
  messages: (roomId: string, cursor?: string, limit = 50) => {
    const q = new URLSearchParams();
    if (cursor) q.set('cursor', cursor);
    q.set('limit', String(limit));
    return api<{ items: ChatMessage[]; nextCursor: string | null }>(
      `/chat/rooms/${roomId}/messages?${q.toString()}`,
    );
  },
  send: (
    roomId: string,
    payload: { content?: string; imageUrl?: string; imageKey?: string },
  ) =>
    api<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  markRead: (roomId: string) =>
    api<{ read: number }>(`/chat/rooms/${roomId}/read`, { method: 'POST' }),
  uploadImage: async (roomId: string, file: File) => {
    const token = Cookies.get('auth_token');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/images`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || 'No se pudo subir la imagen',
      );
    }
    const json = (await res.json()) as { data: { url: string; key: string } };
    return json.data;
  },
  adminRooms: (filter?: {
    categoryId?: string;
    search?: string;
    status?: ChatRoomStatus;
  }) => {
    const q = new URLSearchParams();
    if (filter?.categoryId) q.set('categoryId', filter.categoryId);
    if (filter?.search) q.set('search', filter.search);
    if (filter?.status) q.set('status', filter.status);
    const s = q.toString();
    return api<ChatRoom[]>(`/chat/admin/rooms${s ? `?${s}` : ''}`);
  },
};
