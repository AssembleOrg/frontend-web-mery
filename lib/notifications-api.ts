import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  data?: unknown;
  readAt: string | null;
  createdAt: string;
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

export const notificationsApi = {
  list: () => api<{ items: AppNotification[]; unread: number }>('/notifications'),
  unreadCount: () => api<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) =>
    api<{ read: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => api<{ read: number }>('/notifications/read-all', { method: 'POST' }),

  // Web Push
  pushPublicKey: () =>
    api<{ enabled: boolean; publicKey: string | null }>('/notifications/push/public-key'),
  pushSubscribe: (sub: PushSubscriptionJSON) =>
    api<{ subscribed: boolean }>('/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub),
    }),
  pushUnsubscribe: (endpoint: string) =>
    api<{ unsubscribed: boolean }>('/notifications/push/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    }),
};
