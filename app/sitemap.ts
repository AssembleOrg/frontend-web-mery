import type { MetadataRoute } from 'next';
import { SEO_PAGES, localizedUrl, pageAlternates } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(SEO_PAGES).flatMap((page) =>
    (['es', 'en'] as const).map((locale) => ({
      url: localizedUrl(page.path, locale),
      changeFrequency: 'monthly' as const,
      priority: page.priority,
      alternates: { languages: pageAlternates(page.path) },
    })),
  );
}
