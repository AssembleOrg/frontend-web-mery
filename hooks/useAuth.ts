/**
 * useAuth Hook
 * Layer 4: Hooks (Business Logic)
 *
 * ARQUITECTURA:
 * - Auto-inicialización con useEffect(() => {}, [])
 * - Orchestrates API calls (services) + state updates (stores)
 * - Loading/error states AQUÍ (NO en store)
 * - NUNCA store methods en useCallback dependencies
 * - SINGLETON: Todos los componentes comparten el mismo estado de inicialización
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useCourseStore } from '@/stores/course-store';
import { useUserCoursesStore } from '@/stores/user-courses-store';
import {
  login as loginService,
  register as registerService,
  me as meService,
  updateProfile as updateProfileService,
  logout as logoutService,
  AuthServiceError,
} from '@/services/auth.service';
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
} from '@/types/auth';

// ============================================
// SINGLETON STATE - Compartido entre todas las instancias de useAuth
// ============================================
let sessionVerifyPromise: Promise<any> | null = null;
let sharedIsLoading = true;
let sharedError: string | null = null;
const stateListeners = new Set<() => void>();

// Función para notificar a todas las instancias de useAuth sobre cambios de estado
function notifyStateChange() {
  stateListeners.forEach(listener => listener());
}

function setSharedLoading(loading: boolean) {
  if (sharedIsLoading !== loading) {
    sharedIsLoading = loading;
    notifyStateChange();
  }
}

function setSharedError(error: string | null) {
  if (sharedError !== error) {
    sharedError = error;
    notifyStateChange();
  }
}

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, updateUser, clearAuth } =
    useAuthStore();

  // Estado local que se sincroniza con el estado compartido
  const [isLoading, setIsLoading] = useState(sharedIsLoading);
  const [error, setError] = useState<string | null>(sharedError);

  // Suscribirse a cambios en el estado compartido
  useEffect(() => {
    const syncState = () => {
      setIsLoading(sharedIsLoading);
      setError(sharedError);
    };

    stateListeners.add(syncState);
    return () => {
      stateListeners.delete(syncState);
    };
  }, []);

  // Auto-init: Initialize auth from cookies and verify session
  // SINGLETON: Solo se ejecuta una vez globalmente, no por cada instancia
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Si ya hay una verificación en curso, espera su resultado
      if (sessionVerifyPromise) {
        console.log('[useAuth] Verificación ya en curso, esperando resultado...');
        await sessionVerifyPromise;
        return;
      }

      let resolveVerify: () => void = () => {};
      sessionVerifyPromise = new Promise<void>((resolve) => {
        resolveVerify = resolve;
      });

      console.log('[useAuth] Iniciando verificación de sesión (singleton)');

      // Load auth from cookies PRIMERO (sincrónico)
      useAuthStore.getState().initializeAuth();
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;
      console.log('[useAuth] initializeAuth ->', {
        currentToken: !!currentToken,
        currentUser: !!currentUser,
      });

      // If there's no client-side token, attempt server-side verification
      // This covers httpOnly session cookies set by the backend
      if (!currentToken) {
        try {
          console.log(
            '[useAuth] No token en cookies, intentando verificación server-side...'
          );
          const response = await meService();
          console.log(
            '[useAuth] me() response (server-side):',
            response && { hasUser: !!response.user, token: !!response.token }
          );
          if (mounted && response && response.user) {
            console.log('[useAuth] Sesión server-side válida:', response.user);
            setAuth(response.user, response.token || null);
          }
        } catch (err) {
          console.error('[useAuth] Verificación server-side fallida:', err);
          // Only clear auth on auth-specific errors
          if (
            err instanceof AuthServiceError &&
            (err.status === 401 || err.status === 403)
          ) {
            if (mounted) clearAuth();
          } else {
            // network/server error: keep local cookies (if any)
          }
        } finally {
          if (mounted) setSharedLoading(false);
          resolveVerify();
          sessionVerifyPromise = null;
        }
        return;
      }

      // Si hay token Y user en cookies, asumir autenticado inmediatamente
      // Esto evita el redirect mientras verificamos con el backend
      if (currentToken && currentUser) {
        if (mounted) {
          setSharedLoading(false);
        }
        // Verificar con el backend en segundo plano (sin bloquear la UI)
        try {
          console.log('[useAuth] Verificando sesión con token...');
          const response = await meService(currentToken);
          console.log(
            '[useAuth] me() response (token):',
            response && { hasUser: !!response.user, token: !!response.token }
          );
          if (mounted && response && response.user) {
            console.log('[useAuth] Sesión válida:', response.user);
            setAuth(response.user, currentToken);
          }
        } catch (err) {
          console.error('[useAuth] Error verificando sesión:', err);
          if (
            err instanceof AuthServiceError &&
            (err.status === 401 || err.status === 403)
          ) {
            console.log('[useAuth] Token inválido, limpiando sesión');
            if (mounted) {
              clearAuth();
            }
          } else {
            console.log(
              '[useAuth] Error de red/servidor, manteniendo sesión de cookies'
            );
          }
        } finally {
          resolveVerify();
          sessionVerifyPromise = null;
        }
      } else {
        // Si no hay user en cookies pero sí token, esperar verificación
        try {
          const response = await meService(currentToken);
          if (mounted) {
            setAuth(response.user, currentToken);
          }
        } catch (err) {
          console.error('[useAuth] Error verificando sesión:', err);
          if (
            err instanceof AuthServiceError &&
            (err.status === 401 || err.status === 403)
          ) {
            if (mounted) {
              clearAuth();
            }
          } else {
            if (mounted) {
              clearAuth();
            }
          }
        } finally {
          if (mounted) {
            setSharedLoading(false);
          }
          resolveVerify();
          sessionVerifyPromise = null;
        }
      }
    };

    initAuth();

    // Cleanup para evitar actualizaciones de estado en componente desmontado
    return () => {
      mounted = false;
    };
  }, []); // CRITICAL: Empty array - runs on mount (including after F5)

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await loginService(credentials);
      setAuth(response.user, response.token);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setSharedError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSharedLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [setAuth]

  // Register
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const response = await registerService(credentials);

      // Registration successful, but API sends verification email
      // User needs to verify email before logging in
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrarse';
      setSharedError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSharedLoading(false);
    }
  }, []); // CRITICAL: Empty array, NOT [setAuth]

  // Update Profile
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setSharedLoading(true);
      setSharedError(null);

      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;

      if (!currentToken || !currentUser) {
        throw new Error('No hay sesión activa');
      }

      const response = await updateProfileService(
        currentToken,
        currentUser.id,
        data
      );
      updateUser(response.user);

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar perfil';
      setSharedError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSharedLoading(false);
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
