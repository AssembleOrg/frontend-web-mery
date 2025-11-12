'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ScrollIndicatorProps {
  targetId?: string;
}

export function ScrollIndicator({ targetId = 'content' }: ScrollIndicatorProps) {
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (arrowRef.current) {
        arrowRef.current.style.opacity = Math.max(0, 1 - window.scrollY / 100).toString();
        arrowRef.current.style.pointerEvents = window.scrollY > 100 ? 'none' : 'auto';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={arrowRef}
      onClick={handleClick}
      className="flex justify-center items-center cursor-pointer transition-opacity duration-300"
    >
      <ChevronDown className="w-8 h-8 text-gray-600 animate-bounce" />
    </div>
  );
}
