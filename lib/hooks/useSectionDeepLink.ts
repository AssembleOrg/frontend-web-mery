import { useEffect } from 'react';

const extractTarget = () => {
  const params = new URLSearchParams(window.location.search);
  const fromSection = params.get('section');
  const fromUrl = params.get('url');

  if (fromSection) return fromSection;

  if (fromUrl) {
    try {
      const parsed = new URL(fromUrl, window.location.origin);
      if (parsed.hash) return parsed.hash.slice(1);
      const nested = parsed.searchParams.get('section');
      if (nested) return nested;
    } catch {
      const idx = fromUrl.indexOf('#');
      if (idx >= 0) return fromUrl.slice(idx + 1);
    }
  }

  const hash = window.location.hash;
  if (hash && hash.length > 1) return hash.slice(1);

  return null;
};

export const useSectionDeepLink = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let target = extractTarget();
    if (!target) return;

    target = decodeURIComponent(target).trim();
    if (!target) return;

    if (target.startsWith('#')) target = target.slice(1);
    if (!target) return;

    const scrollToTarget = () => {
      const el = document.getElementById(target);
      if (!el) return;
      el.scrollIntoView({ block: 'start' });
    };

    const hasQuery =
      window.location.search.includes('section=') ||
      window.location.search.includes('url=');

    if (hasQuery) {
      const next = new URL(window.location.href);
      next.hash = `#${target}`;
      next.searchParams.delete('section');
      next.searchParams.delete('url');
      window.history.replaceState(window.history.state, '', next.toString());
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTarget();
      });
    });
  }, []);
};

