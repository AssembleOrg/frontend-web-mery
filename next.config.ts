import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-icons',
    ],
  },
  // www siempre al dominio principal
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.merygarcia.com.ar' }],
        destination: 'https://merygarcia.com.ar/:path*',
        permanent: true,
      },
      // Direcciones del sitio viejo (WordPress) que Google y links externos
      // todavía piden y daban 404 (Search Console, nov-2026).
      { source: '/producto/:slug*', destination: '/formaciones', permanent: true },
      { source: '/en/producto/:slug*', destination: '/en/formaciones', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/en/home', destination: '/en', permanent: true },
      { source: '/styling-de-cejas', destination: '/servicios/diseno-cejas', permanent: true },
      { source: '/en/styling-de-cejas', destination: '/en/services/eyebrow-design', permanent: true },
      {
        source: '/microblading-camuflaje-2',
        destination: '/servicios/microblading-camuflaje',
        permanent: true,
      },
      {
        source: '/en/microblading-camuflaje-2',
        destination: '/en/services/microblading-camouflage',
        permanent: true,
      },
    ];
  },
  // Proxy to backend API
  async rewrites() {
    // Development: proxy a localhost para evitar CORS
    // Production: proxy a Railway backend
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
