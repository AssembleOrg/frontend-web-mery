import localFont from 'next/font/local';

// DIN Light - Weight 300 (default/light)
// Order: WOFF2 (best compression) → WOFF (Safari fallback) → TTF (legacy)
export const dinLight = localFont({
  src: [
    {
      path: '../public/font/DIN-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Light.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-din-light',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: 'Arial',
});

// DIN Regular - Weight 400 (body/regular)
export const dinRegular = localFont({
  src: [
    {
      path: '../public/font/DIN-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-din-regular',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: 'Arial',
});

// DIN Medium - Weight 500 (emphasis/medium)
export const dinMedium = localFont({
  src: [
    {
      path: '../public/font/DIN-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/font/DIN-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-din-medium',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: 'Arial',
});

// ITC Avant Garde - for admin panel
export const avantGardeAdmin = localFont({
  src: [
    {
      path: '../public/font/ITCAvantGardeStd-Bk.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/ITCAvantGardeStd-Bk.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-avant-garde-admin',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  preload: true,
  adjustFontFallback: 'Arial',
});
