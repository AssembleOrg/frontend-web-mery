import { getRecentRequests } from '@/lib/request-tracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface CreateProblemReportDto {
  email: string;
  phone?: string;
  description: string;
}

interface ProblemReportResponse {
  id: string;
  email: string;
  phone?: string;
  description: string;
  createdAt: string;
}

interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class ProblemReportService {
  private static readonly BASE_PATH = '/problem-report';

  static async create(data: CreateProblemReportDto): Promise<ProblemReportResponse> {
    const payload = {
      ...data,
      recentRequests: getRecentRequests(),
    };

    const response = await fetch(`${API_BASE_URL}${this.BASE_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'No se pudo enviar el reporte');
    }

    const json: BackendResponse<ProblemReportResponse> = await response.json();
    return json.data;
  }
}
