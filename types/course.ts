import { LucideIcon } from 'lucide-react';

export interface CourseIncludeItem {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
}

export interface DownloadableFile {
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'zip';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  vimeoVideoId: string;
  duration?: string;
  order: number;
  isPublished?: boolean;
  isCompleted?: boolean;
  downloadableFiles?: DownloadableFile[];
}

export interface CourseProgress {
  courseId: string;
  lessonsCompleted: string[];
  totalLessons: number;
  progressPercentage: number;
  lastAccessed?: Date;
}

export interface CourseModalContent {
  videoId?: string;
  detailedDescription: string;
  includes: CourseIncludeItem[];
  targetAudience: string;
  specialNotes?: string;
  additionalInfo?: string;
  duration?: string;
  level?: string;
  requirements?: string[];
}

export interface Course {
  // Identificación
  id: string;
  slug: string;

  // Información básica (para cards en /formaciones)
  title: string;
  description: string;
  image: string;

  // Sistema bimonetario (ambos precios coexisten)
  priceARS: number; // Precio en Pesos Argentinos
  priceUSD: number; // Precio en Dólares
  isFree?: boolean; // Si el curso es gratuito

  // Backward compatibility
  price?: number;
  priceDisplay?: string;
  currency?: 'USD' | 'ARS';

  // Metadata de publicación (para admin)
  isPublished?: boolean; // false = borrador, true = público
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
  isActive?: boolean;

  // Acceso del usuario autenticado (desde backend)
  isPurchased?: boolean; // true si el usuario compró específicamente este curso

  // Campos adicionales de VideoCategory (priorizados sobre modalContent)
  long_description?: string; // Descripción detallada (prioridad sobre modalContent.detailedDescription)
  target?: string; // Público objetivo (prioridad sobre modalContent.targetAudience)

  // Contenido del modal (detalles completos)
  modalContent?: CourseModalContent;

  // Lecciones (para plataforma de aprendizaje)
  lessons?: Lesson[];
}

export interface UserCourse {
  courseId: string;
  course: Course;
  enrolledAt: Date;
  progress: CourseProgress;
  hasAccess: boolean;
}

// ============================================
// Types for Admin Panel
// ============================================

/**
 * Input para crear un curso nuevo (sin id, createdAt, updatedAt)
 */
export type CourseCreateInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Input para actualizar un curso existente
 */
export type CourseUpdateInput = Partial<Omit<Course, 'id'>>;

/**
 * Estado del formulario multi-step del admin
 */
export interface CourseFormState {
  step: number; // 1: Basic, 2: Modal, 3: Lessons, 4: Preview
  basicInfo: Partial<Course>;
  modalContent: Partial<CourseModalContent>;
  lessons: Lesson[];
  errors: Record<string, string>;
}

/**
 * Response esperada del backend cuando se crea/actualiza un curso
 */
export interface CourseBackendResponse extends Course {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
