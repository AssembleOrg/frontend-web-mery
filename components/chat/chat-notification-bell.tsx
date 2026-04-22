'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { useChatConnection } from '@/hooks/useChat';
import { chatApi, type ChatRoom } from '@/lib/chat-api';

export function ChatNotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useChatConnection();

  const unread = useChatStore((s) => s.unreadTotal);
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUBADMIN';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await chatApi.adminRooms() : await chatApi.myRooms();
      setRooms(
        data
          .filter((r) => (r.unread ?? 0) > 0)
          .slice(0, 5),
      );
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void loadRooms();
  };

  if (!isAuthenticated) return null;

  return (
    <div
      ref={ref}
      className='relative'
    >
      <button
        onClick={toggle}
        aria-label='Notificaciones'
        className='relative p-2 rounded-full hover:bg-muted transition-colors'
      >
        <Bell className='w-5 h-5 text-foreground' />
        {unread > 0 && (
          <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f9bbc4] text-white text-[10px] font-semibold flex items-center justify-center'>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden'>
          <div className='px-4 py-3 border-b border-border flex items-center justify-between'>
            <div className='text-sm font-semibold'>Notificaciones de chat</div>
            <Link
              href={isAdmin ? `/${locale}/admin/chats` : `/${locale}/mi-cuenta`}
              onClick={() => setOpen(false)}
              className='text-xs text-[#eba2a8] hover:underline'
            >
              Ver todo
            </Link>
          </div>
          {loading ? (
            <div className='p-6 text-sm text-muted-foreground text-center'>
              Cargando…
            </div>
          ) : rooms.length === 0 ? (
            <div className='p-6 text-sm text-muted-foreground text-center'>
              <MessageCircle className='w-8 h-8 mx-auto mb-2 opacity-40' />
              No tenés mensajes sin leer.
            </div>
          ) : (
            <ul className='max-h-[60vh] overflow-y-auto'>
              {rooms.map((r) => {
                const name =
                  [r.user.firstName, r.user.lastName]
                    .filter(Boolean)
                    .join(' ') || r.user.email;
                const target = isAdmin
                  ? `/${locale}/admin/chats?roomId=${r.id}`
                  : `/${locale}/mi-cuenta`;
                return (
                  <li
                    key={r.id}
                    className='border-b border-border/60 last:border-b-0'
                  >
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push(target);
                      }}
                      className='w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 text-left'
                    >
                      <div className='w-9 h-9 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-xs font-bold flex-shrink-0'>
                        {name
                          .split(' ')
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || '?'}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <span className='text-sm font-medium truncate'>
                            {isAdmin ? name : 'Mery García'}
                          </span>
                          <span className='text-[10px] bg-[#f9bbc4] text-white rounded-full px-1.5 py-0.5 flex-shrink-0'>
                            {r.unread}
                          </span>
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {r.category.name}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
