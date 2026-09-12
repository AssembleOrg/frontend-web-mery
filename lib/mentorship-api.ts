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
  /** Ya usó su mentoría gratuita (una por cuenta). */
  freeUsed?: boolean;
  /** Créditos pagos disponibles para reservar (0/1). */
  availableCredits?: number;
  /** Ya usó la gratis y no tiene crédito → tiene que comprar. */
  needsPurchase?: boolean;
  /** Compat: alias de needsPurchase. */
  blockedByOtherCourse?: boolean;
  canBook: boolean;
}

export type MentorshipProductType = 'MENTORSHIP' | 'ONE_TO_ONE';

export interface MentorshipVariant {
  id: string;
  productId: string;
  label: string;
  amount: string; // Decimal serializado
  currency: 'ARS' | 'USD';
  isActive: boolean;
  sortOrder: number;
}

export interface MentorshipProduct {
  id: string;
  categoryId: string | null;
  category?: { id: string; name: string; slug?: string } | null;
  name: string;
  description: string | null;
  type: MentorshipProductType;
  isActive: boolean;
  sortOrder: number;
  variants: MentorshipVariant[];
}

export interface MentorshipCredit {
  id: string;
  userId: string;
  productId: string | null;
  product?: { id: string; name: string; type: MentorshipProductType } | null;
  categoryId: string | null;
  type: MentorshipProductType;
  amount: string | null;
  currency: string | null;
  note: string | null;
  status: 'AVAILABLE' | 'USED';
  mentorshipId: string | null;
  createdAt: string;
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

  // Productos pagos (público) + créditos del alumno
  products: () => api<MentorshipProduct[]>('/mentorship/products'),
  myCredits: () => api<MentorshipCredit[]>('/mentorship/my-credits'),

  // Admin: catálogo de productos + variantes
  adminProducts: () => api<MentorshipProduct[]>('/mentorship/admin/products'),
  adminCreateProduct: (payload: {
    name: string;
    type?: MentorshipProductType;
    categoryId?: string | null;
    description?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }) =>
    api<MentorshipProduct>('/mentorship/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminUpdateProduct: (
    id: string,
    payload: Partial<{
      name: string;
      type: MentorshipProductType;
      categoryId: string | null;
      description: string | null;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) =>
    api<MentorshipProduct>(`/mentorship/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminDeleteProduct: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/admin/products/${id}`, {
      method: 'DELETE',
    }),
  adminAddVariant: (
    productId: string,
    payload: {
      label: string;
      amount: number;
      currency?: 'ARS' | 'USD';
      isActive?: boolean;
      sortOrder?: number;
    },
  ) =>
    api<MentorshipVariant>(`/mentorship/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminUpdateVariant: (
    id: string,
    payload: Partial<{
      label: string;
      amount: number;
      currency: 'ARS' | 'USD';
      isActive: boolean;
      sortOrder: number;
    }>,
  ) =>
    api<MentorshipVariant>(`/mentorship/admin/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminDeleteVariant: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/admin/variants/${id}`, {
      method: 'DELETE',
    }),

  // Admin: créditos pagos (validación manual)
  adminListCredits: (userId: string) =>
    api<MentorshipCredit[]>(`/mentorship/admin/credits?userId=${encodeURIComponent(userId)}`),
  adminGrantCredit: (payload: {
    userId: string;
    productId?: string;
    categoryId?: string;
    type?: MentorshipProductType;
    amount?: number;
    currency?: 'ARS' | 'USD';
    note?: string;
  }) =>
    api<MentorshipCredit>('/mentorship/admin/credits', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminRevokeCredit: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/admin/credits/${id}`, {
      method: 'DELETE',
    }),

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
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

// Solo la hora (HH:MM), útil para el fin de un rango
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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
