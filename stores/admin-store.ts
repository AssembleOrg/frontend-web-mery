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
     */
    fetchVideos: async (categoryId?: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.getVideos({ categoryId });
        console.log('[Admin Store] Videos response:', response);
        set((state) => {
          // Backend returns { data: { data: [], meta: {} } }
          state.videos = response.data.data;
          state.isLoading = false;
        });
      } catch (error) {
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
        const response = await fetch(`${API_BASE_URL}/videos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(video)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create video');
        }

        const result = await response.json();
        const newVideo = result.data;

        set((state) => {
          state.videos.push(newVideo);
          state.isLoading = false;
        });

        return newVideo;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create video'
        });
        return null;
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
