import { LucideIcon } from 'lucide-react';

export interface CourseIncludeItem {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  vimeoVideoId: string;
  duration?: string;
  order: number;
  isCompleted?: boolean;
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
  id: string;
  title: string;
  price: number;
  priceDisplay: string;
  image: string;
  slug: string;
  description?: string;
  currency: 'USD' | 'ARS';
  modalContent?: CourseModalContent;
  lessons?: Lesson[];
}

export interface UserCourse {
  courseId: string;
  course: Course;
  enrolledAt: Date;
  progress: CourseProgress;
  hasAccess: boolean;
}