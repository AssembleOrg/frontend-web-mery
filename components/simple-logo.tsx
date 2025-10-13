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

  // Don't render until client-side mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div 
        className="h-10 w-32"
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
      width={140}
      height={42}
      className='h-10 w-auto'
      priority
      style={{
        objectFit: 'contain',
      }}
      quality={95}
    />
  );
}
