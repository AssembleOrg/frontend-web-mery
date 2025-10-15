/**
 * Auth Store
 * Layer 3: Stores (State only)
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: User, token?: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      // Solo actualizamos el token si se nos proporciona uno nuevo.
      setAuth: (user: User, token?: string | null) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          if (typeof token === 'string' && token.length > 0) {
            state.token = token;
          }
        });
      },
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
      // persist
      name: 'auth-token-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    }
  )
);
