import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type PresencialClassStatus =
  | 'TENTATIVE'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type PresencialSignupStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface PresencialCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface PresencialClass {
  id: string;
  title: string;
  description: string | null;
  /** YYYY-MM-DD (hora Argentina) */
  date: string;
  startHour: number;
  endHour: number;
  startAt: string;
  endAt: string;
  status: PresencialClassStatus;
  restrictToStudents: boolean;
  confirmedAt: string | null;
  categories: PresencialCategory[];
}

/** Clase para la alumna: incluye el estado de SU inscripción (nunca cupos). */
export interface PresencialClassForStudent extends PresencialClass {
  mySignup: { id: string; status: PresencialSignupStatus } | null;
}

export interface PresencialSignupMine {
  id: string;
  status: PresencialSignupStatus;
  note: string | null;
  confirmedAt: string | null;
  createdAt: string;
  class: PresencialClass;
}

export interface PresencialSignupAdmin {
  id: string;
  status: PresencialSignupStatus;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

/** Clase para el admin: inscriptas + conteos. */
export interface PresencialClassAdmin extends PresencialClass {
  signups: PresencialSignupAdmin[];
  counts: { pending: number; confirmed: number; active: number };
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

export interface PresencialClassPayload {
  title: string;
  description?: string | null;
  /** YYYY-MM-DD */
  date: string;
  startHour: number;
  endHour: number;
  categoryIds?: string[];
  restrictToStudents?: boolean;
}

export const presencialApi = {
  // Alumna
  upcoming: () => api<PresencialClassForStudent[]>('/presencial-classes/upcoming'),
  mine: () => api<PresencialSignupMine[]>('/presencial-classes/mine'),
  signup: (classId: string, note?: string) =>
    api<{ id: string; status: PresencialSignupStatus }>(
      `/presencial-classes/${classId}/signup`,
      { method: 'POST', body: JSON.stringify({ note }) },
    ),
  cancelSignup: (signupId: string) =>
    api<{ cancelled: boolean }>(`/presencial-classes/signups/${signupId}/cancel`, {
      method: 'POST',
    }),

  // Admin
  adminCalendar: (filter?: { from?: string; to?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (filter?.from) q.set('from', filter.from);
    if (filter?.to) q.set('to', filter.to);
    if (filter?.status) q.set('status', filter.status);
    const s = q.toString();
    return api<PresencialClassAdmin[]>(
      `/presencial-classes/admin/calendar${s ? `?${s}` : ''}`,
    );
  },
  adminCreate: (payload: PresencialClassPayload) =>
    api<PresencialClass>('/presencial-classes/admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminUpdate: (id: string, payload: Partial<PresencialClassPayload>) =>
    api<PresencialClass>(`/presencial-classes/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminDelete: (id: string) =>
    api<{ deleted: boolean }>(`/presencial-classes/admin/${id}`, {
      method: 'DELETE',
    }),
  adminConfirmClass: (id: string) =>
    api<{ confirmed: boolean; notified: number }>(
      `/presencial-classes/admin/${id}/confirm`,
      { method: 'POST' },
    ),
  adminCancelClass: (id: string) =>
    api<{ cancelled: boolean; notified: number }>(
      `/presencial-classes/admin/${id}/cancel`,
      { method: 'POST' },
    ),
  adminConfirmSignup: (id: string) =>
    api<{ confirmed: boolean }>(`/presencial-classes/admin/signups/${id}/confirm`, {
      method: 'POST',
    }),
  adminRejectSignup: (id: string) =>
    api<{ rejected: boolean }>(`/presencial-classes/admin/signups/${id}/reject`, {
      method: 'POST',
    }),
};

// Helpers
export const HOUR_OPTIONS = Array.from({ length: 10 }, (_, i) => 9 + i); // 9..18

export function hourLabel(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function formatPresencialDate(dateStr: string): string {
  // dateStr = YYYY-MM-DD; se formatea al mediodía AR para evitar corrimientos.
  return new Date(`${dateStr}T12:00:00-03:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export const SIGNUP_STATUS_LABEL: Record<PresencialSignupStatus, string> = {
  PENDING: 'Anotada · pendiente de confirmación',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Sin lugar',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Realizada',
};

export const CLASS_STATUS_LABEL: Record<PresencialClassStatus, string> = {
  TENTATIVE: 'Tentativa',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Realizada',
};
