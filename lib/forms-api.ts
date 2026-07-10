// API client para el creador de formularios públicos.
// Sigue el mismo patrón que lib/api-client.ts (envelope { success, data, meta }).

import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ============ Tipos ============

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'yesno'
  | 'info';

export interface FormFieldOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  allowContext?: boolean;
  contextLabel?: string;
}

export type FormStatus = 'draft' | 'published' | 'closed';

export interface FormDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: FormStatus;
  fields: FormField[];
  successMessage?: string | null;
  closedMessage?: string | null;
  submitLabel?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { responses: number };
}

export interface PublicForm {
  id: string;
  slug: string;
  title: string;
  status: FormStatus;
  description?: string | null;
  fields?: FormField[];
  submitLabel?: string | null;
  successMessage?: string | null;
  closedMessage?: string | null;
}

export type YesNoAnswer = { value: boolean; context?: string };
export type FormAnswerValue = string | string[] | YesNoAnswer;
export type FormAnswers = Record<string, FormAnswerValue>;

export type FormResponseStatus = 'pending' | 'accepted' | 'rejected';

export interface FormResponseDto {
  id: string;
  formId: string;
  answers: FormAnswers;
  status: FormResponseStatus;
  invitationSentAt: string | null;
  createdAt: string;
}

export interface FormAnalytics {
  form: { id: string; title: string; slug: string; status: FormStatus };
  total: number;
  today: number;
  last7Days: number;
  firstResponseAt: string | null;
  lastResponseAt: string | null;
  byDay: { date: string; count: number }[];
  distributions: {
    fieldId: string;
    label: string;
    type: FormFieldType;
    answered: number;
    options: { id: string; label: string; count: number; percent: number }[];
  }[];
  statusCounts: { pending: number; accepted: number; rejected: number };
}

export interface CreateFormInput {
  title: string;
  slug?: string;
  description?: string;
  status?: FormStatus;
  fields?: Omit<FormField, 'id'>[] | FormField[];
  successMessage?: string;
  closedMessage?: string;
  submitLabel?: string;
}

export type UpdateFormInput = Partial<CreateFormInput>;

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

export class FormsApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FormsApiError';
  }
}

// ============ Core ============

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (Array.isArray(errorData.message) ? errorData.message[0] : errorData.message) ||
      `Error ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', { detail: { status: response.status, endpoint } }),
      );
    }
    throw new FormsApiError(response.status, message);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

// ============ Público ============

export async function getPublicForm(slug: string): Promise<PublicForm> {
  return request<PublicForm>(`/forms/public/${encodeURIComponent(slug)}`);
}

export async function submitFormResponse(
  slug: string,
  answers: FormAnswers,
): Promise<{ success: boolean; message: string }> {
  return request(`/forms/public/${encodeURIComponent(slug)}/responses`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// ============ Admin ============

export async function getForms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: FormStatus;
}): Promise<{ data: FormDto[]; meta: PaginationMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/forms${query}`);
}

export async function getForm(id: string): Promise<FormDto> {
  return request<FormDto>(`/forms/${id}`);
}

export async function createForm(input: CreateFormInput): Promise<FormDto> {
  return request<FormDto>('/forms', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateForm(id: string, input: UpdateFormInput): Promise<FormDto> {
  return request<FormDto>(`/forms/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteForm(id: string): Promise<void> {
  await request(`/forms/${id}`, { method: 'DELETE' });
}

export async function duplicateForm(id: string): Promise<FormDto> {
  return request<FormDto>(`/forms/${id}/duplicate`, { method: 'POST' });
}

export async function getFormResponses(
  id: string,
  params?: { page?: number; limit?: number; status?: FormResponseStatus },
): Promise<{
  data: { form: Pick<FormDto, 'id' | 'title' | 'slug' | 'fields'>; responses: FormResponseDto[] };
  meta: PaginationMeta;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/forms/${id}/responses${query}`);
}

/** Cambia el estado de una respuesta. Al aceptar, el backend envía el email de invitación. */
export async function updateFormResponseStatus(
  formId: string,
  responseId: string,
  status: FormResponseStatus,
): Promise<FormResponseDto> {
  return request<FormResponseDto>(`/forms/${formId}/responses/${responseId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getFormAnalytics(id: string): Promise<FormAnalytics> {
  return request<FormAnalytics>(`/forms/${id}/analytics`);
}

/** Descarga el CSV de respuestas disparando un download en el navegador. */
export async function downloadFormResponsesCsv(id: string, filename?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}/export`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new FormsApiError(response.status, `Error ${response.status} al exportar`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'respuestas.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** URL pública del formulario (para compartir). */
export function getPublicFormUrl(slug: string): string {
  if (typeof window === 'undefined') return `/f/${slug}`;
  return `${window.location.origin}/f/${slug}`;
}
