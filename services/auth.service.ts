/**
 * Auth Service
 * Layer 2: Services (Pure HTTP calls)
 *
 * ARQUITECTURA: NUNCA state management, solo HTTP
 * Following API documentation from api.md
 */

import { LoginCredentials, LoginResponse, MeResponse, RegisterCredentials, RegisterResponse, UpdateProfileData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class AuthServiceError extends Error {
  constructor(public status: number, message: string, public errorType?: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

/**
 * Login - Authenticate user
 * POST /auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<{ user: any; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.message || errorData.error || 'Login failed',
      errorData.error
    );
  }

  const data: LoginResponse = await response.json();
  
  if (!data.success) {
    throw new AuthServiceError(400, 'Login failed');
  }

  // El backend devuelve el user dentro de data, pero con campos sueltos
  // Necesitamos construir el objeto User
  const userData = data.data as any;
  
  return {
    user: {
      id: userData.sub || userData.id || '',
      email: userData.email,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : userData.firstName || userData.email,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    token: userData.accessToken
  };
};

/**
 * Get current user from token
 * Verify session validity
 * GET /auth/me
 */
export const me = async (token?: string): Promise<{ user: any; token?: string | null }> => {
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AuthServiceError(
      response.status,
      errorData.message || 'Session invalid or expired'
    );
  }

  const data: MeResponse = await response.json();
  
  if (!data.success) {
    throw new AuthServiceError(401, 'Session invalid or expired');
  }

  // Some backends may return a refreshed token; include it if present
  return {
    user: data.data.user,
    token: (data.data as any).accessToken || null
  };
};

/**
 * Register - Create new user account
 * POST /auth/register
 */
export const register = async (credentials: RegisterCredentials): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.message || errorData.error || 'Registration failed'
    );
  }

  const data: RegisterResponse = await response.json();
  
  if (!data.success) {
    throw new AuthServiceError(400, data.message || 'Registration failed');
  }

  return {
    message: data.message
  };
};

/**
 * Update user profile
 * Requires authentication token
 * PATCH /auth/profile
 */
export const updateProfile = async (token: string, userId: string, data: UpdateProfileData): Promise<{ user: any }> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Update failed' }));
    throw new AuthServiceError(
      response.status,
      errorData.message || errorData.error || 'Profile update failed'
    );
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new AuthServiceError(400, result.message || 'Profile update failed');
  }

  return {
    user: result.data
  };
};

/**
 * Logout
 * Client-side only (clears cookies via auth store)
 */
export const logout = async (token: string): Promise<void> => {
  // Note: Backend doesn't have logout endpoint in current API
  // Just clear client-side cookies
  return Promise.resolve();
};

export const authService = {
  login,
  register,
  me,
  updateProfile,
  logout
};
