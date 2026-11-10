import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// /login, /register, /reset-password y /verify-email NO van acá: si están
// bloqueadas Google no lee su noindex y las muestra igual (pasaba con /login).
const PRIVATE_PATHS = [
  '/admin',
  '/mi-cuenta',
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
