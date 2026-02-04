'use client';

import { useIosKeyboardDismiss } from '@/lib/hooks/useIosKeyboardDismiss';

export default function IosEnhancements() {
  useIosKeyboardDismiss();
  return null;
}
