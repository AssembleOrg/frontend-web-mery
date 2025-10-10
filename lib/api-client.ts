/**
 * API Client
 * Following API documentation from api.md
 */

import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorType?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: PaginationMeta;
  message?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Category {
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
  hasAccess?: boolean;
  isPurchased?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  vimeoId?: string;
  thumbnail?: string;
  duration?: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  order?: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoProgress {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  progress: number;
  completed: boolean;
  lastWatchedAt: string;
}

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
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Make API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message ||
        errorData.error ||
        `Error ${response.status}: ${response.statusText}`,
      errorData.error
    );
  }

  return response.json();
}

// ============================================
// CATEGORIES (Courses) API
// ============================================

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'order' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all categories/courses
 * GET /categories
 */
export const getCategories = async (
  params?: GetCategoriesParams
): Promise<
  ApiResponse<{
    data: Category[];
    meta: PaginationMeta;
  }>
> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.isActive !== undefined)
    queryParams.append('isActive', params.isActive.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  return apiRequest<{
    data: Category[];
    meta: PaginationMeta;
  }>(`/categories${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get category by ID or slug
 * GET /categories/:id
 */
export const getCategoryById = async (
  id: string
): Promise<ApiResponse<Category>> => {
  return apiRequest<Category>(`/categories/${id}`);
};

// ============================================
// VIDEOS API
// ============================================

export interface GetVideosParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isPublished?: boolean;
  sortBy?: 'order' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all videos
 * GET /videos
 */
export const getVideos = async (
  params?: GetVideosParams
): Promise<
  ApiResponse<{
    data: Video[];
    meta: PaginationMeta;
  }>
> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.isPublished !== undefined)
    queryParams.append('isPublished', params.isPublished.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  return apiRequest<{
    data: Video[];
    meta: PaginationMeta;
  }>(`/videos${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get video by ID or slug
 * GET /videos/:id
 */
export const getVideoById = async (id: string): Promise<ApiResponse<Video>> => {
  return apiRequest<Video>(`/videos/${id}`);
};

/**
 * Get video stream URL
 * GET /videos/:id/stream
 * Requires authentication
 */
export const getVideoStreamUrl = async (
  id: string
): Promise<ApiResponse<{ streamUrl: string; expiresAt: string }>> => {
  return apiRequest<{ streamUrl: string; expiresAt: string }>(
    `/videos/${id}/stream`
  );
};

/**
 * Update video progress
 * POST /videos/:id/progress
 * Requires authentication
 */
export const updateVideoProgress = async (
  id: string,
  watchedSeconds: number,
  completed?: boolean
): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>(`/videos/${id}/progress`, {
    method: 'POST',
    body: JSON.stringify({ watchedSeconds, completed }),
  });
};

/**
 * Get video progress
 * GET /videos/:id/progress
 * Requires authentication
 */
export const getVideoProgress = async (
  id: string
): Promise<ApiResponse<VideoProgress>> => {
  return apiRequest<VideoProgress>(`/videos/${id}/progress`);
};

// ============================================
// ADMIN VIDEO MANAGEMENT
// ============================================

export interface CreateVideoInput {
  title: string;
  slug: string;
  description?: string;
  vimeoId: string;
  categoryId: string;
  order?: number;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateVideoInput {
  title?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  order?: number;
  isPublished?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Create a new video
 * POST /videos
 * Requires ADMIN or SUBADMIN authentication
 */
export const createVideo = async (
  videoData: CreateVideoInput
): Promise<ApiResponse<Video>> => {
  return apiRequest<Video>('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  });
};

/**
 * Update a video
 * PATCH /videos/:id
 * Requires ADMIN or SUBADMIN authentication
 */
export const updateVideo = async (
  id: string,
  updates: UpdateVideoInput
): Promise<ApiResponse<Video>> => {
  return apiRequest<Video>(`/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete a video (soft delete)
 * DELETE /videos/:id
 * Requires ADMIN or SUBADMIN authentication
 */
export const deleteVideo = async (id: string): Promise<void> => {
  await apiRequest<void>(`/videos/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// ADMIN CATEGORY MANAGEMENT
// ============================================

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  priceARS: number;
  priceUSD: number;
  isFree?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  priceARS?: number;
  priceUSD?: number;
  isFree?: boolean;
  order?: number;
  isActive?: boolean;
}

/**
 * Create a new category
 * POST /categories
 * Requires ADMIN or SUBADMIN authentication
 */
export const createCategory = async (
  categoryData: CreateCategoryInput
): Promise<ApiResponse<Category>> => {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Update a category
 * PATCH /categories/:id
 * Requires ADMIN or SUBADMIN authentication
 */
export const updateCategory = async (
  id: string,
  updates: UpdateCategoryInput
): Promise<ApiResponse<Category>> => {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete a category
 * DELETE /categories/:id
 * Requires ADMIN authentication
 */
export const deleteCategory = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// CART (Shopping Cart) API
// ============================================

export interface CartItem {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
  };
  priceARS: number;
  priceUSD: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalARS: number;
  totalUSD: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  totalARS: number;
  totalUSD: number;
  items: Array<{
    categoryId: string;
    categoryName: string;
    priceARS: number;
    priceUSD: number;
  }>;
}

/**
 * Get user's cart
 * Creates cart automatically if doesn't exist
 * GET /cart
 * Requires authentication
 */
export const getCart = async (): Promise<Cart> => {
  const response = await apiRequest<Cart>('/cart');
  return response.data;
};

/**
 * Add course/category to cart
 * POST /cart/add
 * Requires authentication
 */
export const addToCart = async (categoryId: string): Promise<Cart> => {
  const response = await apiRequest<Cart>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ categoryId }),
  });
  return response.data;
};

/**
 * Remove item from cart
 * DELETE /cart/items/:itemId
 * Requires authentication
 */
export const removeFromCart = async (itemId: string): Promise<Cart> => {
  const response = await apiRequest<Cart>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
  return response.data;
};

/**
 * Clear entire cart
 * DELETE /cart
 * Requires authentication
 */
export const clearCart = async (): Promise<void> => {
  await apiRequest<{ message: string }>('/cart', {
    method: 'DELETE',
  });
};

/**
 * Get cart summary for checkout
 * GET /cart/summary
 * Requires authentication
 */
export const getCartSummary = async (): Promise<CartSummary> => {
  const response = await apiRequest<CartSummary>('/cart/summary');
  return response.data;
};

// ============================================
// USER COURSES API
// ============================================

/**
 * Get user's purchased courses
 * This is derived from categories where hasAccess or isPurchased is true
 */
export const getUserCourses = async (): Promise<Category[]> => {
  const response = await getCategories({ isActive: true });
  // Filter only courses the user has access to
  return response.data.data.filter(
    (category: Category) => category.hasAccess || category.isPurchased
  );
};

/**
 * Get course videos (videos in a category)
 */
export const getCourseVideos = async (categoryId: string): Promise<Video[]> => {
  const response = await getVideos({ categoryId, isPublished: true });
  return response.data.data; // Backend returns { data: { data: [], meta: {} } }
};

/**
 * Get presentation video (order 0) for a course - PUBLIC ACCESS
 * This endpoint doesn't require authentication as it's for previewing courses
 */
export const getPresentationVideo = async (
  categoryId: string
): Promise<{ video: Video; streamUrl?: string } | null> => {
  try {
    const queryParams = new URLSearchParams({
      categoryId,
      isPublished: 'true',
      sortBy: 'order',
      sortOrder: 'asc',
      limit: '1',
    });

    console.log(
      '[API] Fetching presentation video:',
      `${API_BASE_URL}/videos?${queryParams}`
    );

    const response = await fetch(`${API_BASE_URL}/videos?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      console.error(
        '[API] Response not OK:',
        response.status,
        response.statusText
      );
      return null;
    }

    const data: ApiResponse<{ data: Video[]; meta: PaginationMeta }> =
      await response.json();
    console.log('[API] Full response data:', data);

    const videos = data.data.data;
    console.log('[API] Videos array:', videos);
    console.log('[API] Videos length:', videos?.length);

    if (videos && videos.length > 0) {
      const video = videos[0];
      console.log('[API] First video:', video);
      console.log('[API] First video order:', video.order);

      // For videos with order = 0 (presentation videos), try to get stream URL
      // This requires backend to allow public access to /stream for order = 0 videos
      if (
        video.order === 0 ||
        video.order === undefined ||
        video.order === null
      ) {
        console.log(
          '[API] Found presentation video, attempting to get stream URL...'
        );

        try {
          // Try to get stream URL (may fail if backend requires auth for all videos)
          const streamResponse = await fetch(
            `${API_BASE_URL}/videos/${video.id}/stream`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );

          if (streamResponse.ok) {
            const streamData = await streamResponse.json();
            const streamUrl = streamData.data?.streamUrl;
            console.log('[API] Stream URL obtained:', streamUrl);

            // Si la URL no incluye parámetros de Vimeo necesarios, construir una URL más permisiva
            let finalStreamUrl = streamUrl;

            if (streamUrl && streamUrl.includes('player.vimeo.com')) {
              // Agregar parámetros para evitar restricciones de dominio
              const url = new URL(streamUrl);

              // Estos parámetros ayudan a que Vimeo sea más permisivo
              if (!url.searchParams.has('dnt')) {
                url.searchParams.set('dnt', '1'); // Do Not Track
              }
              if (!url.searchParams.has('app_id')) {
                url.searchParams.set('app_id', '122963'); // Vimeo default app ID
              }

              finalStreamUrl = url.toString();
              console.log('[API] Enhanced Vimeo URL:', finalStreamUrl);
            }

            return {
              video,
              streamUrl: finalStreamUrl,
            };
          } else {
            console.warn(
              '[API] Could not get stream URL (backend may require auth):',
              streamResponse.status
            );
            // Return video without stream URL
            return { video };
          }
        } catch (streamError) {
          console.warn('[API] Error getting stream URL:', streamError);
          // Return video without stream URL
          return { video };
        }
      }
    }

    console.log('[API] No presentation video found (order 0)');
    return null;
  } catch (error) {
    console.error('[API] Error fetching presentation video:', error);
    return null;
  }
};

/**
 * Get course details (backward compatibility)
 * This is an alias for getCategoryById
 */
export const getCourseDetails = async (courseId: string): Promise<Category> => {
  const response = await getCategoryById(courseId);
  return response.data;
};

export const apiClient = {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  // Videos
  getVideos,
  getVideoById,
  getVideoStreamUrl,
  updateVideoProgress,
  getVideoProgress,
  createVideo,
  updateVideo,
  deleteVideo,
  getPresentationVideo,

  // Cart
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getCartSummary,

  // User Courses
  getUserCourses,
  getCourseVideos,
  getCourseDetails,
};
