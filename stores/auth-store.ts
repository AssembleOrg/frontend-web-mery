/**
 * Auth Store
 * Layer 3: Stores (State only)
 *
 * ARQUITECTURA: SOLO state synchronous, NUNCA async
 * NO API calls aquí - usar hooks/useAuth.ts para lógica
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  // Synchronous setters only
  setAuth: (user: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
}

/**
 * Auth store for user session management
 *
 * ARQUITECTURA:
 * - SOLO setters sincronos
 * - NUNCA async functions
 * - NUNCA API calls (usar hooks/useAuth.ts)
 * - Persist user session en localStorage
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,

      // Set authentication (after successful login)
      setAuth: (user: User, token: string) => {
        set((state) => {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
        });
      },

      // Update user data (after profile edit)
      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...userData };
          }
        });
      },

      // Clear authentication (logout)
      clearAuth: () => {
        set((state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        });
      },
    })),
    {
      name: 'auth-storage', // localStorage key
      // Only persist auth data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
