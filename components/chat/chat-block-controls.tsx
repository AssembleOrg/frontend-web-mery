'use client';

import { useCallback, useState } from 'react';
import { Ban, CalendarClock, Loader2, Lock, Unlock } from 'lucide-react';
import { chatApi, type ChatRoom } from '@/lib/chat-api';
import { useChatStore } from '@/stores/chat-store';

interface Props {
  room: ChatRoom;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Controles del admin sobre una conversación: bloquear/desbloquear (el alumno
 * deja de poder escribir) y extender/reabrir la vida del chat.
 */
export function ChatBlockControls({ room }: Readonly<Props>) {
  const upsertRoom = useChatStore((s) => s.upsertRoom);
  const setRoomState = useChatStore((s) => s.setRoomState);

  const [pending, setPending] = useState<null | 'block' | 'extend'>(null);
  const [error, setError] = useState<string | null>(null);

  const { blocked, expiresAt, status } = room;
  const left = daysLeft(expiresAt);
  const closed = status === 'CLOSED';

  const run = useCallback(
    async (kind: 'block' | 'extend') => {
      if (pending) return;
      setPending(kind);
      setError(null);
      try {
        const result =
          kind === 'extend'
            ? await chatApi.extendRoom(room.id)
            : blocked
              ? await chatApi.unblockRoom(room.id)
              : await chatApi.blockRoom(room.id);
        upsertRoom(result.room);
        setRoomState(result.room.id, {
          status: result.room.status,
          blocked: result.room.blocked,
          blockedAt: result.room.blockedAt,
          expiresAt: result.room.expiresAt,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setPending(null);
      }
    },
    [pending, room.id, blocked, upsertRoom, setRoomState],
  );

  return (
    <div className='border-b border-border bg-white dark:bg-card px-3 py-2 text-xs'>
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='flex items-center gap-1.5 text-muted-foreground'>
          <CalendarClock className='w-4 h-4 text-[#eba2a8]' />
          {closed ? (
            <span className='text-red-600 font-medium'>Chat cerrado</span>
          ) : left !== null ? (
            <span>
              Vence {formatDate(expiresAt)}
              {left >= 0 ? ` · ${left} día${left === 1 ? '' : 's'}` : ''}
            </span>
          ) : (
            <span>Sin abrir</span>
          )}
        </span>

        {blocked && (
          <span className='inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 font-medium'>
            <Ban className='w-3 h-3' /> Bloqueado
          </span>
        )}

        <div className='ml-auto flex items-center gap-1'>
          <button
            type='button'
            disabled={pending !== null}
            onClick={() => void run('block')}
            title={blocked ? 'Desbloquear el chat' : 'Bloquear: el alumno no podrá escribir'}
            className={`px-2 py-1 rounded-md border flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
              blocked
                ? 'border-green-200 text-green-700 hover:bg-green-50'
                : 'border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            {pending === 'block' ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : blocked ? (
              <Unlock className='w-3.5 h-3.5' />
            ) : (
              <Lock className='w-3.5 h-3.5' />
            )}
            {blocked ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button
            type='button'
            disabled={pending !== null}
            onClick={() => void run('extend')}
            title={closed ? 'Reabrir el chat' : 'Extender la vida del chat'}
            className='px-2 py-1 rounded-md border border-border hover:border-[#f9bbc4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1'
          >
            {pending === 'extend' ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <CalendarClock className='w-3.5 h-3.5' />
            )}
            {closed ? 'Reabrir' : 'Extender'}
          </button>
        </div>
      </div>

      {error && <p className='mt-1 text-[11px] text-red-600'>{error}</p>}
    </div>
  );
}
