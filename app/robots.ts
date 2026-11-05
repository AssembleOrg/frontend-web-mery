import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin',
  '/mi-cuenta',
  '/login',
  '/register',
  '/reset-password',
  '/verify-email',
  '/checkout',
  '/finalizar-compra',
  '/compra-de-cursos',
  '/mentorias',
  '/cursos',
  '/debug-auth',
  '/f/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        ...PRIVATE_PATHS,
        ...PRIVATE_PATHS.map((path) => `/en${path}`),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
