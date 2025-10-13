import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get course image path based on slug
 * Convention: /formacion/{slug}.webp
 * If image is provided from backend, use that instead
 *
 * @param slug - Course slug (e.g., "nanoblading-exclusive")
 * @param image - Optional image path from backend
 * @returns Image path
 */
export function getCourseImage(slug: string, image?: string | null): string {
  // If backend provides image, use it
  if (image && image.trim() !== '') {
    return image;
  }

  // Otherwise, build from slug
  return `/formacion/${slug}.webp`;
}

/**
 * Detects if a course is an Autostylism course (at-home learning)
 * based on slug or title containing variations of "autostylism"
 *
 * @param slug - Course slug
 * @param title - Course title (optional)
 * @returns true if course is Autostylism type
 */
export function isAutostylismCourse(slug: string, title?: string): boolean {
  const autostylismPattern = /auto[\s\-_]?styl(ing|ism)/i;

  if (autostylismPattern.test(slug)) {
    return true;
  }

  if (title && autostylismPattern.test(title)) {
    return true;
  }

  return false;
}
