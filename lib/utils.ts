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
