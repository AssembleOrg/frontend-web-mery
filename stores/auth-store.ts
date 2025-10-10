/**
 * Auth Store
 * Layer 3: Stores (State only)
 *
 * ARQUITECTURA: SOLO state synchronous, NUNCA async
 * NO API calls aquí - usar hooks/useAuth.ts para lógica
 * 
 * SECURITY:
 * - Solo usamos auth_token (JWT HttpOnly cookie del backend)
 * - NO guardamos auth_user en cookies (era inseguro)
 * - Decodificamos JWT en cliente solo para mostrar UI
 * - Backend siempre valida el JWT en cada request
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Cookies from 'js-cookie';
import { User } from '@/types/auth';
import { getUserFromJWT } from '@/lib/jwt-utils';
import { cleanupLegacyCookies } from '@/lib/auth-migration';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  // Synchronous setters only
  setAuth: (user: User, token?: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Auth store for user session management
 *
 * ARQUITECTURA:
 * - SOLO setters sincronos
 * - NUNCA async functions
 * - NUNCA API calls (usar hooks/useAuth.ts)
 * - Persist user session en cookies (NOT localStorage)
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set) => ({
    // Initial State
    user: null,
    token: null,
    isAuthenticated: false,

    // Initialize auth from cookies (call on app mount)
    initializeAuth: () => {
      // SECURITY: Remove legacy insecure cookies
      cleanupLegacyCookies();
      
      const token = Cookies.get(AUTH_COOKIE_NAME);

      if (token) {
        // Decode JWT to get user info (safe - only for UI display)
        const userData = getUserFromJWT(token);
        
        if (userData) {
          set((state) => {
            state.user = userData as User;
            state.token = token;
            state.isAuthenticated = true;
          });
        } else {
          // Invalid token format, clear it
          Cookies.remove(AUTH_COOKIE_NAME);
        }
      }
    },

    // Set authentication (after successful login)
    // Note: Backend sets auth_token as HttpOnly cookie
    // We only store user data in state (decoded from JWT)
    setAuth: (user: User, token?: string | null) => {
      // Update state only - no cookies needed
      // Backend already set auth_token as HttpOnly cookie
      set((state) => {
        state.user = user;
        state.token = token || state.token;
        state.isAuthenticated = true;
      });
    },

    // Update user data (after profile edit)
    updateUser: (userData: Partial<User>) => {
      set((state) => {
        if (state.user) {
          state.user = { ...state.user, ...userData };
          // No need to update cookies - JWT remains the same
          // Only backend can change user role/email
        }
      });
    },

    // Clear authentication (logout)
    clearAuth: () => {
      // Clear state only
      // Backend clears auth_token cookie via /auth/logout endpoint
      set((state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
    },
  }))
);
