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
  /** true cuando el admin bloqueó el chat: el alumno ya no puede escribir */
  blocked: boolean;
  blockedAt: string | null;
  /** Fin de vida del chat. Al vencer pasa a CLOSED (solo lectura). */
  expiresAt: string | null;
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
  quizRequired: boolean;
  quizPassed: boolean;
  mentorshipRequired: boolean;
  mentorshipCompleted: boolean;
}

export interface RoomMutationResult {
  room: ChatRoom;
  changed: boolean;
}

export interface QuickReply {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
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

export interface CategoryEligibility {
  room: ChatRoom;
  computed: EligibilityInfo;
}

// ---------------------------------------------------------------------------
// Batching de elegibilidad por curso
// ---------------------------------------------------------------------------
// La pantalla "mi cuenta" monta un CourseChatButton por curso y cada uno pedía
// /chat/rooms/by-category/:id por su cuenta — N requests al montar y otros N en
// cada focus de la ventana. Acá se juntan todas las peticiones que caen en la
// misma ventana de tiempo y se resuelven con un solo GET
// /chat/rooms/by-categories?ids=a,b,c. Además hay un micro-cache por id para
// que dos focus seguidos no vuelvan a pegarle al backend.

const BATCH_WINDOW_MS = 40;
const ELIGIBILITY_TTL_MS = 10_000;
const MAX_IDS_PER_BATCH = 50;

interface PendingRequest {
  resolve: (value: CategoryEligibility) => void;
  reject: (reason: unknown) => void;
}

const eligibilityCache = new Map<
  string,
  { at: number; value: CategoryEligibility }
>();
const pending = new Map<string, PendingRequest[]>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEligibilityBatch() {
  batchTimer = null;
  const ids = [...pending.keys()];
  if (!ids.length) return;

  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_BATCH) {
    batches.push(ids.slice(i, i + MAX_IDS_PER_BATCH));
  }

  await Promise.all(
    batches.map(async (batchIds) => {
      const waiters = new Map(
        batchIds.map((id) => [id, pending.get(id) ?? []] as const),
      );
      for (const id of batchIds) pending.delete(id);

      try {
        const { items } = await api<{
          items: Array<{
            categoryId: string;
            room: ChatRoom;
            computed: EligibilityInfo;
          }>;
        }>(`/chat/rooms/by-categories?ids=${batchIds.join(',')}`);

        const byCategory = new Map(items.map((i) => [i.categoryId, i]));
        const now = Date.now();
        for (const id of batchIds) {
          const item = byCategory.get(id);
          const callbacks = waiters.get(id) ?? [];
          if (!item) {
            const err = new Error('No se encontró el chat de este curso');
            for (const cb of callbacks) cb.reject(err);
            continue;
          }
          const value: CategoryEligibility = {
            room: item.room,
            computed: item.computed,
          };
          eligibilityCache.set(id, { at: now, value });
          for (const cb of callbacks) cb.resolve(value);
        }
      } catch (err) {
        for (const id of batchIds) {
          for (const cb of waiters.get(id) ?? []) cb.reject(err);
        }
      }
    }),
  );
}

function requestEligibility(
  categoryId: string,
  { force = false }: { force?: boolean } = {},
): Promise<CategoryEligibility> {
  if (!force) {
    const cached = eligibilityCache.get(categoryId);
    if (cached && Date.now() - cached.at < ELIGIBILITY_TTL_MS) {
      return Promise.resolve(cached.value);
    }
  }

  return new Promise<CategoryEligibility>((resolve, reject) => {
    const waiters = pending.get(categoryId);
    if (waiters) waiters.push({ resolve, reject });
    else pending.set(categoryId, [{ resolve, reject }]);

    batchTimer ??= setTimeout(() => void flushEligibilityBatch(), BATCH_WINDOW_MS);
  });
}

/** Invalida el cache de elegibilidad (todo, o un curso puntual). */
export function invalidateEligibility(categoryId?: string) {
  if (categoryId) eligibilityCache.delete(categoryId);
  else eligibilityCache.clear();
}

export const chatApi = {
  myRooms: () => api<ChatRoom[]>('/chat/rooms'),
  /**
   * Coalescido: varias llamadas simultáneas (una por curso) terminan en un solo
   * request al backend. `force: true` saltea el micro-cache — usalo después de
   * aprobar el examen o completar la mentoría.
   */
  myRoomForCategory: (
    categoryId: string,
    options?: { force?: boolean },
  ): Promise<CategoryEligibility> => requestEligibility(categoryId, options),
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
  /** Bloquea el chat: el alumno deja de poder enviar mensajes. */
  blockRoom: (roomId: string) =>
    api<RoomMutationResult>(`/chat/admin/rooms/${roomId}/block`, {
      method: 'POST',
    }),
  /** Desbloquea el chat. */
  unblockRoom: (roomId: string) =>
    api<RoomMutationResult>(`/chat/admin/rooms/${roomId}/unblock`, {
      method: 'POST',
    }),
  /** Extiende/reabre la vida del chat (días opcional; default = configurado). */
  extendRoom: (roomId: string, days?: number) =>
    api<RoomMutationResult>(`/chat/admin/rooms/${roomId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  /** Transcribe un audio vía Groq (backend). No persiste el audio. */
  transcribe: async (blob: Blob): Promise<string> => {
    const token = Cookies.get('auth_token');
    const ext = blob.type.includes('mp4')
      ? 'm4a'
      : blob.type.includes('ogg')
        ? 'ogg'
        : 'webm';
    const file = new File([blob], `nota_de_voz.${ext}`, { type: blob.type });
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/chat/transcribe`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message ||
          'No se pudo transcribir el audio',
      );
    }
    const json = (await res.json()) as { data: { text: string } };
    return json.data.text;
  },

  quickReplies: {
    list: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return api<QuickReply[]>(`/chat/admin/quick-replies${q}`);
    },
    create: (payload: { title: string; body: string }) =>
      api<QuickReply>('/chat/admin/quick-replies', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: { title?: string; body?: string }) =>
      api<QuickReply>(`/chat/admin/quick-replies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      api<{ deleted: boolean }>(`/chat/admin/quick-replies/${id}`, {
        method: 'DELETE',
      }),
  },
};
