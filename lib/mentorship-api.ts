import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type MentorshipStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface MentorshipSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface Mentorship {
  id: string;
  categoryId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: MentorshipStatus;
  rescheduleCount: number;
  canReschedule: boolean;
  meetingEmail: string;
  meetLink: string | null;
  category?: { id: string; name: string; slug?: string };
}

export interface MentorshipEligibility {
  purchased: boolean;
  examPassed: boolean;
  alreadyBooked: boolean;
  mentorship: Mentorship | null;
  canBook: boolean;
}

export interface AdminMentorship extends Mentorship {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: { id: string; name: string };
}

export interface MentorshipAvailability {
  id: string;
  weekday: number;
  startMin: number;
  endMin: number;
  isActive: boolean;
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

export const mentorshipApi = {
  slots: () => api<MentorshipSlot[]>('/mentorship/slots'),
  eligibility: (categoryId: string) =>
    api<MentorshipEligibility>(`/mentorship/eligibility/${categoryId}`),
  mine: () => api<Mentorship[]>('/mentorship/mine'),
  book: (payload: { categoryId: string; start: string; meetingEmail: string }) =>
    api<Mentorship>('/mentorship/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reschedule: (id: string, start: string) =>
    api<Mentorship>(`/mentorship/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ start }),
    }),
  cancel: (id: string) =>
    api<{ cancelled: boolean }>(`/mentorship/${id}/cancel`, { method: 'POST' }),

  // Admin
  adminCalendar: (filter?: { from?: string; to?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (filter?.from) q.set('from', filter.from);
    if (filter?.to) q.set('to', filter.to);
    if (filter?.status) q.set('status', filter.status);
    const s = q.toString();
    return api<AdminMentorship[]>(`/mentorship/admin/calendar${s ? `?${s}` : ''}`);
  },
  adminSlots: () => api<MentorshipSlot[]>('/mentorship/admin/slots'),
  adminCancel: (id: string) =>
    api<{ cancelled: boolean }>(`/mentorship/admin/${id}/cancel`, {
      method: 'POST',
    }),
  adminReschedule: (id: string, start: string) =>
    api<Mentorship>(`/mentorship/admin/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ start }),
    }),
  adminAvailability: () =>
    api<MentorshipAvailability[]>('/mentorship/admin/availability'),
  adminCreateAvailability: (payload: {
    weekday: number;
    startMin: number;
    endMin: number;
    isActive?: boolean;
  }) =>
    api<MentorshipAvailability>('/mentorship/admin/availability', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminUpdateAvailability: (
    id: string,
    payload: Partial<{
      weekday: number;
      startMin: number;
      endMin: number;
      isActive: boolean;
    }>,
  ) =>
    api<MentorshipAvailability>(`/mentorship/admin/availability/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminDeleteAvailability: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/admin/availability/${id}`, {
      method: 'DELETE',
    }),
};

// Helpers de formato (hora Argentina)
export function formatSlot(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function minutesToHHMM(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export const WEEKDAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
