import localFont from 'next/font/local';

// DIN Light - Weight 300 (default/light)
export const dinLight = localFont({
  src: [
    {
      path: '../public/font/DIN-Light.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-din-light',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});

// DIN Regular - Weight 400 (body/regular)
export const dinRegular = localFont({
  src: [
    {
      path: '../public/font/DIN-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-din-regular',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});

// DIN Medium - Weight 500 (emphasis/medium)
export const dinMedium = localFont({
  src: [
    {
      path: '../public/font/DIN-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-din-medium',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
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
  fallback: ['AvantGarde LT', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});
