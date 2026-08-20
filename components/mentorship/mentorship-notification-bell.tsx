'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarClock } from 'lucide-react';
import { useMentorshipNotifStore } from '@/stores/mentorship-notif-store';

function label(type: 'booked' | 'rescheduled' | 'cancelled'): string {
  return type === 'booked'
    ? 'reservó'
    : type === 'rescheduled'
      ? 'reprogramó'
      : 'canceló';
}

/** Campana de notificaciones in-app de mentorías (para admins). */
export function MentorshipNotificationBell() {
  const items = useMentorshipNotifStore((s) => s.items);
  const unread = useMentorshipNotifStore((s) => s.unread);
  const markAllRead = useMentorshipNotifStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const locale = (params?.locale as string) || 'es';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={toggle}
        title='Notificaciones de mentorías'
        className='relative p-2 rounded-full hover:bg-muted text-muted-foreground'
      >
        <CalendarClock className='w-5 h-5' />
        {unread > 0 && (
          <span className='absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#f9bbc4] text-white text-[10px] font-bold flex items-center justify-center'>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden'>
          <div className='px-3 py-2 border-b border-border flex items-center justify-between'>
            <span className='text-sm font-semibold text-foreground'>Mentorías</span>
            <Link
              href={`/${locale}/admin/mentorias`}
              onClick={() => setOpen(false)}
              className='text-xs text-[#eba2a8] hover:underline'
            >
              Ver todas
            </Link>
          </div>
          <div className='max-h-80 overflow-y-auto'>
            {items.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-6'>
                Sin novedades.
              </p>
            ) : (
              items.map((n) => {
                const when = new Date(n.start).toLocaleString('es-AR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Argentina/Buenos_Aires',
                });
                return (
                  <Link
                    key={n.id}
                    href={`/${locale}/admin/mentorias`}
                    onClick={() => setOpen(false)}
                    className='block px-3 py-2 border-b border-border/50 last:border-0 hover:bg-muted/40'
                  >
                    <p className='text-sm text-foreground'>
                      <strong>{n.studentName}</strong> {label(n.type)} su mentoría
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {n.courseName} · {when} hs
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
