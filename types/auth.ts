/**
 * Auth Types
 * Following API documentation from api.md
 */

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUBADMIN' | 'USER';
  firstName?: string;
  lastName?: string;
  name?: string; // Computed from firstName + lastName or standalone
  phone?: string;
  country?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
  timestamp: string;
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
  timestamp: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface UpdateProfileData {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  country?: string;
  city?: string;
  role?: 'ADMIN' | 'SUBADMIN' | 'USER';
  isActive?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
