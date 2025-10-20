'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function SimpleLogo() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder with same aspect ratio to prevent layout shift
  if (!mounted) {
    return (
      <div 
        className="h-7 md:h-9 lg:h-10 w-auto min-w-28 md:min-w-32"
        aria-hidden="true"
      />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  return (
    <Image
      src={
        isDark
          ? '/Img-home/mery-blanco-logo.png'
          : '/Img-home/Mery-logo-comestic-tattoo.png'
      }
      alt='Mery García Cosmetic Tattoo'
      width={120}
      height={36}
      className='h-7 md:h-9 lg:h-10 w-auto'
      priority
      style={{
        objectFit: 'contain',
      }}
      quality={95}
    />
  );
}
