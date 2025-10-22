import { LucideIcon } from 'lucide-react';

export interface CourseIncludeItem {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
  texto?: string; // Alias para compatibilidad con JSONB del backend
  url_icon?: string; // URL del icono desde el backend
}

export interface DownloadableFile {
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'zip';
}

// Nuevo: Item de descarga para videos (JSONB)
export interface VideoDownloadItem {
  texto?: string; // Texto descriptivo del archivo (ej: "Manual de técnicas avanzadas")
  text?: string; // Alias para compatibilidad
  url_icon?: string; // URL del icono (ej: /icons/pdf.svg)
  url_file?: string; // URL del archivo descargable
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
  downloadableFiles?: DownloadableFile[]; // Legacy - mantener para compatibilidad
  
  // Nuevos campos para contenidos y descargas
  contenidos?: string; // Contenido de texto de la lección (puede usar markdown **bold**)
  downloads?: VideoDownloadItem[]; // Array JSONB de archivos descargables
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
  long_description?: string; // Descripción detallada ES (prioridad sobre modalContent.detailedDescription)
  long_description_en?: string; // Descripción detallada EN
  target?: string; // Público objetivo ES (prioridad sobre modalContent.targetAudience)
  target_en?: string; // Público objetivo EN
  
  // Modalidad del curso
  modalidad?: string; // Modalidad ES (ej: "Online", "Presencial", "Híbrido")
  modalidad_en?: string; // Modalidad EN
  
  // Lo que aprenderás
  learn?: string; // Qué aprenderás ES
  learn_en?: string; // Qué aprenderás EN
  
  // Lo que incluye el curso (formato estructurado JSONB)
  includes_category?: CourseIncludeItem[]; // Incluye ES (array de {texto, url_icon})
  includes_category_en?: CourseIncludeItem[]; // Incluye EN (array de {texto, url_icon})

  // Contenido del modal (detalles completos - legado)
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
