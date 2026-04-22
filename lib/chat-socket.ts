'use client';

import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
// URL directa al backend (sin pasar por los rewrites del front).
// Los WebSockets no pueden proxearse por Netlify/Vercel rewrites, necesitan
// conectarse al backend directamente.
const DIRECT_BACKEND_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  '';

/**
 * Host del backend para la conexión WebSocket.
 * Prioridad:
 *   1. NEXT_PUBLIC_SOCKET_URL / NEXT_PUBLIC_BASE_URL (backend real)
 *   2. Derivado de NEXT_PUBLIC_API_URL si es absoluta
 *   3. window.location.origin (solo sirve en dev con same-origin)
 */
function deriveSocketOrigin(): string {
  if (DIRECT_BACKEND_URL) {
    try {
      const u = new URL(DIRECT_BACKEND_URL);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fallthrough */
    }
  }
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    try {
      const u = new URL(API_BASE_URL);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fallthrough */
    }
  }
  return globalThis.location.origin;
}

let socket: Socket | null = null;

export function getChatSocket(): Socket {
  if (typeof globalThis.window === 'undefined') {
    throw new TypeError('Chat socket requires window');
  }
  if (socket?.connected) return socket;
  if (socket) return socket;

  const token = Cookies.get('auth_token');
  const origin = deriveSocketOrigin();
  socket = io(`${origin}/chat`, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
    withCredentials: true,
    autoConnect: true,
  });
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
