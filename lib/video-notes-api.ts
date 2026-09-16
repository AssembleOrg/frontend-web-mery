import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface VideoNote {
  id: string;
  videoId: string;
  categoryId: string;
  /** Segundo del video al que refiere la nota. */
  timeSeconds: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  video: { id: string; title: string; order: number; duration: number | null };
}

export interface VideoNoteAdmin extends VideoNote {
  category: { id: string; name: string; slug: string };
}

export interface VideoNotesAdminByUser {
  user: { id: string; firstName: string | null; lastName: string | null; email: string };
  notes: VideoNoteAdmin[];
}

export interface VideoNotesAdminSummaryRow {
  user: { id: string; firstName: string | null; lastName: string | null; email: string };
  count: number;
  lastNoteAt: string;
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

export const videoNotesApi = {
  byVideo: (videoId: string) => api<VideoNote[]>(`/video-notes/video/${videoId}`),
  byCategory: (categoryId: string) =>
    api<VideoNote[]>(`/video-notes/category/${categoryId}`),
  create: (p: { videoId: string; timeSeconds: number; content: string }) =>
    api<VideoNote>('/video-notes', { method: 'POST', body: JSON.stringify(p) }),
  update: (id: string, p: { timeSeconds?: number; content?: string }) =>
    api<VideoNote>(`/video-notes/${id}`, { method: 'PATCH', body: JSON.stringify(p) }),
  remove: (id: string) =>
    api<{ deleted: boolean }>(`/video-notes/${id}`, { method: 'DELETE' }),

  adminSummary: () => api<VideoNotesAdminSummaryRow[]>('/video-notes/admin/summary'),
  adminByUser: (userId: string, categoryId?: string) =>
    api<VideoNotesAdminByUser>(
      `/video-notes/admin/user/${userId}${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''}`,
    ),
};

/** 754 → "12:34"; 3725 → "1:02:05". */
export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}
