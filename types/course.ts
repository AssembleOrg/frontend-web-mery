import { LucideIcon } from 'lucide-react';

export interface CourseIncludeItem {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
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
}