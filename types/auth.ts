/**
 * Auth Types
 * Layer 1: Types/Contracts
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  country?: string;
  city?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string; // Opcional para MVP - solo email
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface RegisterCredentials {
  name: string; // Nombre completo (nombre + apellido)
  email: string;
  password?: string; // Opcional para MVP
  phone?: string;
  country?: string;
  city?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  country?: string;
  city?: string;
}
