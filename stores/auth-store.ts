/**
 * Auth Store
 * Layer 3: Stores (State only)
 *
 * ARQUITECTURA: SOLO state synchronous, NUNCA async
 * NO API calls aquí - usar hooks/useAuth.ts para lógica
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Cookies from 'js-cookie';
import { User } from '@/types/auth';

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
const USER_COOKIE_NAME = 'auth_user';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

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
      const token = Cookies.get(AUTH_COOKIE_NAME);
      const userJson = Cookies.get(USER_COOKIE_NAME);

      if (token && userJson) {
        try {
          const user = JSON.parse(userJson) as User;
          set((state) => {
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
          });
        } catch (error) {
          // Invalid cookie data, clear everything
          Cookies.remove(AUTH_COOKIE_NAME);
          Cookies.remove(USER_COOKIE_NAME);
        }
      } else if (userJson) {
        // If only user cookie exists (rare), attempt to load user
        try {
          const user = JSON.parse(userJson) as User;
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        } catch (error) {
          Cookies.remove(USER_COOKIE_NAME);
        }
      }
    },

    // Set authentication (after successful login)
    setAuth: (user: User, token?: string | null) => {
      // Save user cookie
      Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
      // Save token cookie only if provided (for client-side tokens)
      if (token) {
        Cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
      }

      // Update state
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
          const updatedUser = { ...state.user, ...userData };
          state.user = updatedUser;

          // Update cookie
          Cookies.set(USER_COOKIE_NAME, JSON.stringify(updatedUser), COOKIE_OPTIONS);
        }
      });
    },

    // Clear authentication (logout)
    clearAuth: () => {
      // Remove cookies
      Cookies.remove(AUTH_COOKIE_NAME);
      Cookies.remove(USER_COOKIE_NAME);

      // Clear state
      set((state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
    },
  }))
);
