import type { MetadataRoute } from 'next';
import { AFTERCARE_PAGES, SEO_PAGES, SITE_URL, localizedUrl, pageAlternates } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(SEO_PAGES).flatMap((page) =>
    (['es', 'en'] as const).map((locale) => ({
      url: localizedUrl(page.path, locale),
      changeFrequency: 'monthly' as const,
      priority: page.priority,
      alternates: { languages: pageAlternates(page.path) },
    })),
  );
  // Cuidados posteriores: solo en castellano.
  const aftercare = Object.keys(AFTERCARE_PAGES).map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }));
  return [...pages, ...aftercare];
}
