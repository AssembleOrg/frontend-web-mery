'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeAwareLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ThemeAwareLogo({
  width = 200,
  height = 60,
  className = '',
  priority = false,
}: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return light logo as default during hydration
    return (
      <Image
        src='/Img-home/Mery-logo-comestic-tattoo.png'
        alt='Mery García Cosmetic Tattoo'
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // Use resolvedTheme to handle 'system' theme setting
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
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
