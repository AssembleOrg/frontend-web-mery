'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Bot de ayuda (formaciones) servido por el motor rag-webchat. Público en todo
// el sitio; si hay usuario logueado se pasa userIdentifier => la conversación
// queda atada a la cuenta y el rate limit es por cuenta (modo privado).
const APP_TOKEN =
  process.env.NEXT_PUBLIC_RAG_WIDGET_TOKEN || 'mgf_4437a8d47a4047ff88675788f194ba11';
const BASE_URL =
  process.env.NEXT_PUBLIC_RAG_WIDGET_URL || 'https://rag-webchat-production.up.railway.app';

export default function ChatWidget() {
  const { user, isLoading } = useAuth();
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    // Esperar a que resuelva la sesión para saber si va userIdentifier o no.
    if (isLoading) return;
    injected.current = true;

    const identifier = user?.id || user?.email || undefined;
    // NO seteamos title/accentColor: el diseño (nombre, color, logo, posición,
    // CSS) lo maneja la consola de chatbots y el widget lo aplica solo.
    (window as unknown as { __RAG_WIDGET_CONFIG?: Record<string, unknown> }).__RAG_WIDGET_CONFIG = {
      appToken: APP_TOKEN,
      baseUrl: BASE_URL,
      ...(identifier ? { userIdentifier: identifier } : {}),
    };

    const s = document.createElement('script');
    s.src = `${BASE_URL}/widget.js`;
    s.async = true;
    document.body.appendChild(s);
  }, [isLoading, user]);

  return null;
}
