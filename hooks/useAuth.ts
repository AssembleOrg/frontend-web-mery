/**
 * useAuth Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [])
 * - Orchestrates API calls (services) + state updates (stores)
 * - Loading/error states AQUÍ (NO en store)
 * - NUNCA store methods en useCallback dependencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useCourseStore } from '@/stores/course-store';
import { useUserCoursesStore } from '@/stores/user-courses-store';
import { login as loginService, register as registerService, me as meService, updateProfile as updateProfileService, logout as logoutService } from '@/services/auth.service';
import { LoginCredentials, RegisterCredentials, UpdateProfileData } from '@/types/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, updateUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-init: Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      const currentToken = useAuthStore.getState().token;

      if (!currentToken) return;

      try {
        setIsLoading(true);
        const response = await meService(currentToken);
        // Token is still valid, update user info
        setAuth(response.user, currentToken);
      } catch (err) {
        // Session invalid/expired - clear auth
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []); // CRITICAL: Empty array - gets current token from store

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await loginService(credentials);
      setAuth(response.user, response.token);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [setAuth]

  // Register
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await registerService(credentials);
      setAuth(response.user, response.token);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [setAuth]

  // Update Profile
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        throw new Error('No hay sesión activa');
      }

      const response = await updateProfileService(currentToken, data);
      updateUser(response.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [updateUser]

  // Logout
  const logout = useCallback(async () => {
    try {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        await logoutService(currentToken);
      }

      // Clear ALL user-specific data from stores
      clearAuth(); // Clear auth data (user, token)
      useCartStore.getState().clearCart(); // Clear shopping cart
      useCourseStore.getState().clearCourseData(); // Clear course progress
      useUserCoursesStore.getState().clearCourses(); // Clear enrolled courses
    } catch (err) {
      // Even if logout fails, clear local session
      clearAuth();
      useCartStore.getState().clearCart();
      useCourseStore.getState().clearCourseData();
      useUserCoursesStore.getState().clearCourses();
    }
  }, []); // CRITICAL: Empty array, NOT [clearAuth]

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    updateProfile,
    logout,
  };
}
