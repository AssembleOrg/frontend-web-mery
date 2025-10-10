/**
 * Admin Store
 * Following API documentation from api.md
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { apiClient } from '@/lib/api-client';
import Cookies from 'js-cookie';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  priceARS: number;
  priceUSD: number;
  isFree: boolean;
  order: number;
  isActive: boolean;
  videoCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  categoryId: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  categories: Category[];
  videos: Video[];
  isLoading: boolean;
  error: string | null;
}

interface AdminActions {
  // Category Operations
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<Category | null>;
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'videoCount'>) => Promise<Category | null>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Video Operations
  fetchVideos: (categoryId?: string) => Promise<void>;
  fetchVideoById: (id: string) => Promise<Video | null>;
  createVideo: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'thumbnail' | 'duration'>) => Promise<Video | null>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<Video | null>;
  deleteVideo: (id: string) => Promise<boolean>;
  getVideosByCategory: (categoryId: string) => Video[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearData: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Get auth token from cookies
 */
function getAuthToken(): string | undefined {
  return Cookies.get('auth_token');
}

/**
 * Get auth headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

/**
 * Admin store for managing categories and videos
 * Following API documentation from api.md
 */
export const useAdminStore = create<AdminState & AdminActions>()(
  immer((set, get) => ({
    // Initial State
    categories: [],
    videos: [],
    isLoading: false,
    error: null,

    // ============================================
    // CATEGORY OPERATIONS
    // ============================================

    /**
     * Fetch all categories
     * GET /categories
     */
    fetchCategories: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.getCategories();
        set((state) => {
          state.categories = response.data.data;
          state.isLoading = false;
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch categories'
        });
      }
    },

    /**
     * Fetch category by ID
     * GET /categories/:id
     */
    fetchCategoryById: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.getCategoryById(id);
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch category'
        });
        return null;
      }
    },

    /**
     * Create new category
     * POST /categories
     */
    createCategory: async (category) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(category)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create category');
        }

        const result = await response.json();
        const newCategory = result.data;

        set((state) => {
          state.categories.push(newCategory);
          state.isLoading = false;
        });

        return newCategory;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create category'
        });
        return null;
      }
    },

    /**
     * Update category
     * PATCH /categories/:id
     */
    updateCategory: async (id: string, updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update category');
        }

        const result = await response.json();
        const updatedCategory = result.data;

        set((state) => {
          const index = state.categories.findIndex(c => c.id === id);
          if (index !== -1) {
            state.categories[index] = updatedCategory;
          }
          state.isLoading = false;
        });

        return updatedCategory;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update category'
        });
        return null;
      }
    },

    /**
     * Delete category
     * DELETE /categories/:id
     */
    deleteCategory: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete category');
        }

        set((state) => {
          state.categories = state.categories.filter(c => c.id !== id);
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete category'
        });
        return false;
      }
    },

    // ============================================
    // VIDEO OPERATIONS
    // ============================================

    /**
     * Fetch videos
     * GET /videos
     * IMPORTANTE: Fusiona videos inteligentemente en lugar de reemplazarlos
     */
    fetchVideos: async (categoryId?: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.getVideos({ categoryId });
        console.log('[Admin Store] Videos response for category', categoryId, ':', response);

        const newVideos = response.data.data;
        console.log('[Admin Store] New videos count:', newVideos.length);

        set((state) => {
          if (categoryId) {
            // Fusionar inteligentemente: remover videos viejos de esta categoría, agregar nuevos
            console.log('[Admin Store] Before merge, total videos:', state.videos.length);

            // Filtrar videos de otras categorías (mantenerlos)
            const otherCategoryVideos = state.videos.filter(v => v.categoryId !== categoryId);
            console.log('[Admin Store] Videos from other categories:', otherCategoryVideos.length);

            // Combinar: videos de otras categorías + nuevos videos de esta categoría
            state.videos = [...otherCategoryVideos, ...newVideos];
            console.log('[Admin Store] After merge, total videos:', state.videos.length);
          } else {
            // Si no hay categoryId, reemplazar todo (carga global)
            state.videos = newVideos;
            console.log('[Admin Store] Global load, total videos:', state.videos.length);
          }
          state.isLoading = false;
        });
      } catch (error) {
        console.error('[Admin Store] Error fetching videos:', error);
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch videos'
        });
      }
    },

    /**
     * Fetch video by ID
     * GET /videos/:id
     */
    fetchVideoById: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.getVideoById(id);
        set({ isLoading: false });
        return response.data;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch video'
        });
        return null;
      }
    },

    /**
     * Create new video
     * POST /videos
     */
    createVideo: async (video) => {
      set({ isLoading: true, error: null });
      try {
        console.log('[Admin Store] Creating video:', video);

        const response = await fetch(`${API_BASE_URL}/videos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(video)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Admin Store] Create video failed:', response.status, errorData);

          // Manejar errores específicos
          if (response.status === 409) {
            const error = new Error(`Ya existe un video con el slug "${video.slug}". Por favor usa un slug diferente.`);
            set({
              isLoading: false,
              error: error.message
            });
            throw error;
          }

          const error = new Error(errorData.message || `Error ${response.status}: No se pudo crear el video`);
          set({
            isLoading: false,
            error: error.message
          });
          throw error;
        }

        const result = await response.json();
        const newVideo = result.data;
        console.log('[Admin Store] Video created successfully:', newVideo);

        set((state) => {
          state.videos.push(newVideo);
          console.log('[Admin Store] Video added to store. Total videos:', state.videos.length);
          state.isLoading = false;
        });

        return newVideo;
      } catch (error) {
        console.error('[Admin Store] Error creating video:', error);
        // El error ya fue seteado en el bloque if(!response.ok), solo propagar
        if (!(error instanceof Error && get().error)) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create video'
          });
        }
        throw error; // Propagar el error para que el componente lo capture
      }
    },

    /**
     * Update video
     * PATCH /videos/:id
     */
    updateVideo: async (id: string, updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update video');
        }

        const result = await response.json();
        const updatedVideo = result.data;

        set((state) => {
          const index = state.videos.findIndex(v => v.id === id);
          if (index !== -1) {
            state.videos[index] = updatedVideo;
          }
          state.isLoading = false;
        });

        return updatedVideo;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update video'
        });
        return null;
      }
    },

    /**
     * Delete video
     * DELETE /videos/:id
     */
    deleteVideo: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete video');
        }

        set((state) => {
          state.videos = state.videos.filter(v => v.id !== id);
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete video'
        });
        return false;
      }
    },

    /**
     * Get videos by category ID
     * Helper para obtener videos filtrados por categoría desde el store
     */
    getVideosByCategory: (categoryId: string) => {
      const videos = get().videos.filter(v => v.categoryId === categoryId);
      console.log('[Admin Store] getVideosByCategory:', categoryId, 'count:', videos.length);
      return videos;
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    clearData: () => {
      set({
        categories: [],
        videos: [],
        error: null,
      });
    },
  }))
);
