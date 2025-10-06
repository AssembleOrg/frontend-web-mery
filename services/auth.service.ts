/**
 * Auth Service
 * Layer 2: Services (Pure HTTP calls)
 *
 * ARQUITECTURA: NUNCA state management, solo HTTP
 */

import { LoginCredentials, LoginResponse, MeResponse, RegisterCredentials, RegisterResponse, UpdateProfileData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class AuthServiceError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

/**
 * Login - Authenticate user
 *
 * MVP: Solo email (password opcional)
 * PRODUCCIÓN: email + password required
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.error || `Error ${response.status}: Login failed`
    );
  }

  return response.json();
};

/**
 * Get current user from token
 * Verify session validity
 */
export const me = async (token: string): Promise<MeResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new AuthServiceError(
      response.status,
      'Session invalid or expired'
    );
  }

  return response.json();
};

/**
 * Register - Create new user account
 *
 * MVP: Crea usuario con datos completos
 * PRODUCCIÓN: Validación + confirmación email
 */
export const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.error || `Error ${response.status}: Registration failed`
    );
  }

  return response.json();
};

/**
 * Update user profile
 * Requires authentication token
 */
export const updateProfile = async (token: string, data: UpdateProfileData): Promise<MeResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Update failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.error || `Error ${response.status}: Profile update failed`
    );
  }

  return response.json();
};

/**
 * Logout
 * NOTA: Logout es solo client-side (clear localStorage)
 * Si backend requiere invalidar token, agregar endpoint aquí
 */
export const logout = async (token: string): Promise<void> => {
  // Futuro: Si backend tiene POST /auth/logout
  // await fetch(`${API_BASE_URL}/auth/logout`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });

  // Por ahora, logout es solo client-side
  return Promise.resolve();
};

export const authService = {
  login,
  register,
  me,
  updateProfile,
  logout
};
