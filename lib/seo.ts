import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export const SITE_URL = 'https://merygarcia.com.ar';

/** ID público de medición de Google Analytics 4. */
export const GA_MEASUREMENT_ID = 'G-KCT5VESP7Q';

export const BUSINESS = {
  name: 'Mery García',
  phone: '+5491161592591',
  streetAddress: 'Av. Melián 3646 PB 1',
  locality: 'Ciudad Autónoma de Buenos Aires',
  country: 'AR',
  instagram: 'https://instagram.com/merygarciaoficial',
} as const;

type Locale = 'es' | 'en';
type Localized = Record<Locale, string>;

export type SeoPageKey = keyof typeof SEO_PAGES;

/**
 * Páginas públicas que van al sitemap. `path` es la ruta interna de
 * i18n/routing.ts y `title`/`description` son lo que muestra Google.
 */
export const SEO_PAGES = {
  home: {
    path: '/',
    priority: 1,
    title: {
      es: 'Mery García | Nanoblading y tatuaje cosmético en Buenos Aires',
      en: 'Mery García | Nanoblading and cosmetic tattoo in Buenos Aires',
    },
    description: {
      es: 'Estudio de Mery García en Buenos Aires: más de 20 años en nanoblading, lip blush, cejas y pestañas. Reservá tu turno o conocé las formaciones online.',
      en: 'Mery García studio in Buenos Aires: over 20 years in nanoblading, lip blush, brows and lashes. Book an appointment or explore the online courses.',
    },
  },
  about: {
    path: '/about',
    priority: 0.6,
    title: { es: 'Sobre Mery García', en: 'About Mery García' },
    description: {
      es: 'La historia de Mery García, artista del tatuaje cosmético con más de 20 años de experiencia, especialista en cejas y técnicas hiperrealistas.',
      en: 'The story of Mery García, a cosmetic tattoo artist with over 20 years of experience, specialized in brows and hyper-realistic techniques.',
    },
  },
  contact: {
    path: '/contact',
    priority: 0.6,
    title: { es: 'Contacto y ubicación', en: 'Contact and location' },
    description: {
      es: 'Estudio en Av. Melián 3646, CABA. Martes a sábado de 10 a 18 hs. WhatsApp 11 6159-2591.',
      en: 'Studio at Av. Melián 3646, Buenos Aires. Tuesday to Saturday, 10 am to 6 pm. WhatsApp +54 11 6159-2591.',
    },
  },
  formaciones: {
    path: '/formaciones',
    priority: 0.9,
    title: {
      es: 'Formaciones online de cejas y tatuaje cosmético',
      en: 'Online brow and cosmetic tattoo courses',
    },
    description: {
      es: 'Formaciones online de Mery García: estilismo de cejas, microblading, nanoblading, lip blush y camuflaje, para aprender a tu ritmo.',
      en: 'Online courses by Mery García: brow styling, microblading, nanoblading, lip blush and camouflage, at your own pace.',
    },
  },
  nanoblading: {
    path: '/services/nanoblading',
    priority: 0.9,
    service: { es: 'Nanoblading', en: 'Nanoblading' },
    title: {
      es: 'Nanoblading y camuflaje de cejas en Buenos Aires',
      en: 'Nanoblading and brow camouflage in Buenos Aires',
    },
    description: {
      es: 'Nanoblading de cejas con acabado hiperrealista y camuflaje de trabajos anteriores, en el estudio de Mery García en Buenos Aires.',
      en: 'Hyper-realistic nanoblading brows and camouflage of previous work, at Mery García studio in Buenos Aires.',
    },
  },
  microblading: {
    path: '/services/microblading-camuflaje',
    priority: 0.8,
    service: { es: 'Microblading y camuflaje', en: 'Microblading and camouflage' },
    title: {
      es: 'Microblading y camuflaje de cejas en Buenos Aires',
      en: 'Microblading and brow camouflage in Buenos Aires',
    },
    description: {
      es: 'Microblading de cejas pelo a pelo y camuflaje de tatuajes anteriores, en el estudio de Mery García en Buenos Aires.',
      en: 'Hair-stroke microblading brows and camouflage of old tattoos, at Mery García studio in Buenos Aires.',
    },
  },
  lipBlush: {
    path: '/services/lip-blush',
    priority: 0.9,
    service: { es: 'Lip blush', en: 'Lip blush' },
    title: {
      es: 'Lip blush y camuflaje de labios en Buenos Aires',
      en: 'Lip blush and lip camouflage in Buenos Aires',
    },
    description: {
      es: 'Lip blush: labios definidos, con color natural y duradero. Tatuaje cosmético de labios en el estudio de Mery García en Buenos Aires.',
      en: 'Lip blush: defined lips with natural, long-lasting color. Cosmetic lip tattoo at Mery García studio in Buenos Aires.',
    },
  },
  eyebrowStyling: {
    path: '/services/diseno-cejas',
    priority: 0.8,
    service: { es: 'Diseño de cejas y pestañas', en: 'Brow and lash styling' },
    title: {
      es: 'Diseño y estilismo de cejas y pestañas en Buenos Aires',
      en: 'Brow and lash styling in Buenos Aires',
    },
    description: {
      es: 'Diseño de cejas, laminado y estilismo de pestañas con especialistas, en el estudio de Mery García en Buenos Aires.',
      en: 'Brow design, lamination and lash styling with specialists, at Mery García studio in Buenos Aires.',
    },
  },
  lashLine: {
    path: '/services/styling-pestanas',
    priority: 0.7,
    service: { es: 'Lash line', en: 'Lash line' },
    title: {
      es: 'Lash line: delineado de pestañas en Buenos Aires',
      en: 'Lash line tattoo in Buenos Aires',
    },
    description: {
      es: 'Lash line: tatuaje cosmético que da un efecto óptico de mayor volumen y densidad a la mirada, en el estudio de Mery García.',
      en: 'Lash line: cosmetic tattoo that gives your eyes an optical effect of more volume and density, at Mery García studio.',
    },
  },
  freckles: {
    path: '/services/pecas-lunares',
    priority: 0.7,
    service: { es: 'Pecas y lunares', en: 'Freckles and beauty marks' },
    title: {
      es: 'Tatuaje de pecas y lunares en Buenos Aires',
      en: 'Freckles and beauty mark tattoo in Buenos Aires',
    },
    description: {
      es: 'Pecas y lunares con técnica de tatuaje cosmético híper realista, en el estudio de Mery García en Buenos Aires.',
      en: 'Freckles and beauty marks with a hyper-realistic cosmetic tattoo technique, at Mery García studio in Buenos Aires.',
    },
  },
  scalp: {
    path: '/services/scalp',
    priority: 0.7,
    service: { es: 'Nano scalp', en: 'Nano scalp' },
    title: {
      es: 'Nano scalp: tatuaje capilar en Buenos Aires',
      en: 'Nano scalp: scalp tattoo in Buenos Aires',
    },
    description: {
      es: 'Nano scalp: una solución natural para alopecia y cicatrices, con mayor densidad capilar, en el estudio de Mery García.',
      en: 'Nano scalp: a natural solution for alopecia and scars, with greater hair density, at Mery García studio.',
    },
  },
  paramedical: {
    path: '/services/tatuaje-paramedico',
    priority: 0.7,
    service: { es: 'Tatuaje paramédico', en: 'Paramedical tattoo' },
    title: {
      es: 'Tatuaje paramédico en Buenos Aires',
      en: 'Paramedical tattoo in Buenos Aires',
    },
    description: {
      es: 'Tatuaje paramédico de areola y pezón: recuperá la confianza con arte, color y precisión, en el estudio de Mery García.',
      en: 'Paramedical areola and nipple tattoo: regain confidence through art, color and precision, at Mery García studio.',
    },
  },
  giftCard: {
    path: '/gift-card',
    priority: 0.5,
    title: { es: 'Gift card', en: 'Gift card' },
    description: {
      es: 'Regalá una experiencia en el estudio de Mery García con una gift card.',
      en: 'Give an experience at Mery García studio with a gift card.',
    },
  },
  express: {
    path: '/asesoramiento-express',
    priority: 0.5,
    title: { es: 'Asesoramiento express', en: 'Express consultation' },
    description: {
      es: 'Asesoramiento express con el equipo de Mery García para encontrar el servicio indicado para vos.',
      en: 'Express consultation with the Mery García team to find the right service for you.',
    },
  },
} satisfies Record<
  string,
  {
    path: string;
    priority: number;
    service?: Localized;
    title: Localized;
    description: Localized;
  }
>;

function toLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'es';
}

/** URL pública completa de una ruta interna en un idioma (sin barra final). */
export function localizedUrl(path: string, locale: Locale): string {
  const pathnames = routing.pathnames as Record<
    string,
    string | Record<Locale, string>
  >;
  const entry = pathnames[path] ?? path;
  const localized = typeof entry === 'string' ? entry : entry[locale];
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const suffix = localized === '/' ? '' : localized;
  return `${SITE_URL}${prefix}${suffix}`;
}

export function pageAlternates(path: string) {
  return {
    es: localizedUrl(path, 'es'),
    en: localizedUrl(path, 'en'),
    'x-default': localizedUrl(path, 'es'),
  };
}

/** Metadata de una página: título, descripción, canónica, hreflang y redes. */
export function seoMetadata(key: SeoPageKey, rawLocale: string): Metadata {
  const page = SEO_PAGES[key];
  const locale = toLocale(rawLocale);
  const url = localizedUrl(page.path, locale);
  const title = page.title[locale];
  const description = page.description[locale];
  return {
    title: key === 'home' ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: pageAlternates(page.path) },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS.name,
      type: 'website',
      locale: locale === 'es' ? 'es_AR' : 'en_US',
      images: [{ url: '/og-image.png', width: 500, height: 500, alt: BUSINESS.name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

/** Datos estructurados del negocio. */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${SITE_URL}/#negocio`,
    name: BUSINESS.name,
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    telephone: BUSINESS.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.locality,
      addressCountry: BUSINESS.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
    sameAs: [BUSINESS.instagram],
  };
}

/** Datos estructurados de una página de servicio. */
export function serviceJsonLd(key: SeoPageKey, rawLocale: string) {
  const page = SEO_PAGES[key];
  if (!('service' in page)) return null;
  const locale = toLocale(rawLocale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.service[locale],
    description: page.description[locale],
    url: localizedUrl(page.path, locale),
    areaServed: BUSINESS.locality,
    provider: { '@id': `${SITE_URL}/#negocio`, '@type': 'BeautySalon', name: BUSINESS.name },
  };
}
