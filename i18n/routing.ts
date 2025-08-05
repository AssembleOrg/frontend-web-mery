import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['es', 'en'],

  // Used when no locale matches
  defaultLocale: 'es',

  // The `pathnames` object holds pairs of internal and external paths.
  // Based on the locale, the external paths are rewritten to the shared,
  // internal ones.
  pathnames: {
    // If all locales use the same pathname, a single string can be used.
    '/': '/',
    '/about': {
      es: '/sobre-mi',
      en: '/about',
    },
    '/services': {
      es: '/servicios',
      en: '/services',
    },
    '/services/[service]': {
      es: '/servicios/[service]',
      en: '/services/[service]',
    },
    '/services/diseno-cejas': {
      es: '/servicios/diseno-cejas',
      en: '/services/eyebrow-design',
    },
    '/services/nanoblading': {
      es: '/servicios/nanoblading',
      en: '/services/nanoblading',
    },
    '/services/microblading-camuflaje': {
      es: '/servicios/microblading-camuflaje',
      en: '/services/microblading-camouflage',
    },
    '/services/scalp': {
      es: '/servicios/scalp',
      en: '/services/scalp',
    },
    '/services/pecas-lunares': {
      es: '/servicios/pecas-lunares',
      en: '/services/freckles-moles',
    },
    '/services/nano-scalp': {
      es: '/servicios/nano-scalp',
      en: '/services/nano-scalp',
    },
    '/services/styling-pestanas': {
      es: '/servicios/styling-pestanas',
      en: '/services/eyelash-styling',
    },
    '/services/tatuaje-paramedico': {
      es: '/servicios/tatuaje-paramedico',
      en: '/services/paramedical-tattoo',
    },
    '/trainings': {
      es: '/formaciones',
      en: '/trainings',
    },
    '/trainings/[course]': {
      es: '/formaciones/[course]',
      en: '/trainings/[course]',
    },
    '/gift-card': {
      es: '/gift-card',
      en: '/gift-card',
    },
    '/press': {
      es: '/prensa',
      en: '/press',
    },
    '/contact': {
      es: '/contacto',
      en: '/contact',
    },
    '/client-portal': {
      es: '/portal-cliente',
      en: '/client-portal',
    },
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
