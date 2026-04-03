'use client';

import { useEffect } from 'react';
import { installFetchTracker } from '@/lib/request-tracker';

export default function RequestTrackerProvider() {
  useEffect(() => {
    installFetchTracker();
  }, []);

  return null;
}
