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
} from '@/services/auth.service';
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
} from '@/types/auth';

// SINGLETON STATE
let sessionVerifyPromise: Promise<any> | null = null;
let sharedIsLoading = true;
let sharedError: string | null = null;
const stateListeners = new Set<() => void>();

function notifyStateChange() {
  stateListeners.forEach((listener) => listener());
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

  const [isLoading, setIsLoading] = useState(sharedIsLoading);
  const [error, setError] = useState<string | null>(sharedError);

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

  useEffect(() => {
    const initAuth = async () => {
      if (sessionVerifyPromise) {
        await sessionVerifyPromise;
        return;
      }

      let resolveVerify: () => void = () => {};
      sessionVerifyPromise = new Promise<void>((resolve) => {
        resolveVerify = resolve;
      });

      console.log(
        '[useAuth] Iniciando verificación de sesión (única fuente de verdad: servidor)'
      );

      try {
        const response = await meService();
        if (response && response.user) {
          console.log(
            '[useAuth] Sesión verificada exitosamente en servidor:',
            response.user
          );
          setAuth(response.user, response.token || null);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error(
          '[useAuth] Verificación de sesión fallida. El usuario no está logueado.',
          err
        );
        clearAuth();
      } finally {
        setSharedLoading(false);
        resolveVerify();
        sessionVerifyPromise = null;
      }
    };

    initAuth();
  }, [setAuth, clearAuth]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setSharedLoading(true);
      setSharedError(null);
      try {
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
    },
    [setAuth]
  );

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setSharedLoading(true);
    setSharedError(null);
    try {
      const response = await registerService(credentials);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrarse';
      setSharedError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSharedLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      setSharedLoading(true);
      setSharedError(null);
      const currentToken = useAuthStore.getState().token;
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentToken) {
        const errorMsg = 'No hay sesión activa para actualizar el perfil.';
        setSharedError(errorMsg);
        throw new Error(errorMsg);
      }

      try {
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
    },
    [updateUser]
  );

  const logout = useCallback(async () => {
    console.log('[useAuth] 🔴 Función logout llamada');
    try {
      const currentToken = useAuthStore.getState().token;
      console.log('[useAuth] 🔑 Token actual:', currentToken ? 'Existe' : 'No existe');
      console.log('[useAuth] 📡 Llamando al backend /auth/logout (intento) ...');
      // Llamar al backend para borrar cookies httpOnly (backend debe limpiar cookie aunque no le pasemos token)
      await logoutService(currentToken || undefined);
      console.log('[useAuth] ✅ Backend logout (intento) completado');
    } catch (err) {
      console.error(
        '[useAuth] ❌ Fallo en el logout del servidor, se procederá a limpiar localmente.',
        err
      );
    } finally {
      console.log('[useAuth] 🧹 Iniciando limpieza local...');
      
      // Limpiar estado de la aplicación
      console.log('[useAuth] 🗑️ Limpiando stores...');
      clearAuth();
      useCartStore.getState().clearCart();
      useCourseStore.getState().clearCourseData();
      useUserCoursesStore.getState().clearCourses();
      console.log('[useAuth] ✅ Stores limpiados');
      
      // Limpiar todas las cookies posibles (incluyendo variantes)
      console.log('[useAuth] 🍪 Limpiando cookies...');
      const cookiesToDelete = ['auth_token', 'access_token', 'token', 'jwt', 'session'];
      const domain = window.location.hostname;
      const domains = [domain, `.${domain}`, ''];
      
      let cookiesDeleted = 0;
      cookiesToDelete.forEach(cookieName => {
        domains.forEach(d => {
          // Con dominio
          document.cookie = `${cookieName}=; path=/; domain=${d}; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
          document.cookie = `${cookieName}=; path=/; domain=${d}; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
          // Sin dominio
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          cookiesDeleted += 3;
        });
      });
      console.log(`[useAuth] ✅ ${cookiesDeleted} intentos de borrado de cookies completados`);
      
      // Limpiar localStorage
      console.log('[useAuth] 📦 Limpiando localStorage...');
      const localStorageKeys = Object.keys(localStorage);
      console.log(`[useAuth] 📊 localStorage tiene ${localStorageKeys.length} items antes de limpiar`);
      localStorage.clear();
      console.log('[useAuth] ✅ localStorage limpiado');
      
      // Limpiar sessionStorage
      console.log('[useAuth] 📦 Limpiando sessionStorage...');
      sessionStorage.clear();
      console.log('[useAuth] ✅ sessionStorage limpiado');
      
      console.log('[useAuth] ✅ ✅ ✅ Limpieza completa de cookies y storage TERMINADA');
    }
  }, [clearAuth]);

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
