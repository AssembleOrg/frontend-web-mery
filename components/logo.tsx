'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

const sizeVariants = {
  sm: {
    width: 120,
    height: 36,
    className: 'h-8 w-auto',
  },
  md: {
    width: 160,
    height: 48,
    className: 'h-10 w-auto',
  },
  lg: {
    width: 200,
    height: 60,
    className: 'h-12 w-auto',
  },
  xl: {
    width: 240,
    height: 72,
    className: 'h-16 w-auto',
  },
  custom: {
    width: 200,
    height: 60,
    className: 'w-auto',
  },
};

export function Logo({
  size = 'lg',
  className,
  priority = false,
  width,
  height,
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get size configuration
  const sizeConfig = sizeVariants[size];
  const finalWidth = width || sizeConfig.width;
  const finalHeight = height || sizeConfig.height;
  const finalClassName = className || sizeConfig.className;

  if (!mounted) {
    // Return light logo as default during hydration
    return (
      <Image
        src='/Img-home/Mery-logo-comestic-tattoo.png'
        alt='Mery García Cosmetic Tattoo'
        width={finalWidth}
        height={finalHeight}
        className={finalClassName}
        priority={priority}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
        quality={95}
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
      width={finalWidth}
      height={finalHeight}
      className={finalClassName}
      priority={priority}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      quality={95}
    />
  );
}