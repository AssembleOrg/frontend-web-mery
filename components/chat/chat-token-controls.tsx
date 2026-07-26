'use client';

import { useCallback, useEffect, useState } from 'react';
import { Ban, Coins, History, Loader2, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  chatApi,
  type ChatRoom,
  type ChatTokenEvent,
} from '@/lib/chat-api';
import { useChatStore } from '@/stores/chat-store';

interface Props {
  room: ChatRoom;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Puntitos que representan los tokens usados / disponibles. */
export function TokenDots({
  tokens,
  limit,
}: Readonly<{ tokens: number; limit: number }>) {
  return (
    <span className='flex items-center gap-1'>
      {Array.from({ length: Math.max(limit, tokens) }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full border ${
            i < tokens
              ? 'bg-[#c62828] border-[#c62828]'
              : 'bg-transparent border-[#c9c9c9]'
          }`}
        />
      ))}
    </span>
  );
}

/**
 * Controles de tokens para el admin: sumar de a uno, marcar el límite completo
 * de una sola vez, restar o resetear. Al alcanzar el límite el alumno pierde
 * la posibilidad de escribir en esta conversación.
 */
export function ChatTokenControls({ room }: Readonly<Props>) {
  const setRoomTokens = useChatStore((s) => s.setRoomTokens);
  const upsertRoom = useChatStore((s) => s.upsertRoom);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ChatTokenEvent[] | null>(null);

  const { tokens, tokenLimit, tokensBlocked } = room;
  const remaining = Math.max(0, tokenLimit - tokens);

  const apply = useCallback(
    async (action: 'add' | 'reset', amount = 1) => {
      if (pending) return;
      setPending(true);
      setError(null);
      try {
        const result =
          action === 'reset'
            ? await chatApi.resetTokens(room.id, reason || undefined)
            : await chatApi.addTokens(room.id, amount, reason || undefined);
        upsertRoom(result.room);
        setRoomTokens(result.room.id, {
          tokens: result.room.tokens,
          tokenLimit: result.room.tokenLimit,
          tokensBlocked: result.room.tokensBlocked,
        });
        setReason('');
        if (historyOpen) setHistory(await chatApi.tokenHistory(room.id));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setPending(false);
      }
    },
    [pending, room.id, reason, upsertRoom, setRoomTokens, historyOpen],
  );

  useEffect(() => {
    if (!historyOpen || history) return;
    let cancelled = false;
    chatApi
      .tokenHistory(room.id)
      .then((h) => {
        if (!cancelled) setHistory(h);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [historyOpen, history, room.id]);

  return (
    <div className='border-b border-border bg-white dark:bg-card px-3 py-2 text-xs'>
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='flex items-center gap-1.5 font-medium text-foreground'>
          <Coins className='w-4 h-4 text-[#eba2a8]' />
          Tokens
        </span>
        <TokenDots tokens={tokens} limit={tokenLimit} />
        <span className='text-muted-foreground'>
          {tokens}/{tokenLimit}
          {tokensBlocked
            ? ' · alumno bloqueado'
            : ` · le quedan ${remaining}`}
        </span>

        <div className='ml-auto flex items-center gap-1'>
          <button
            type='button'
            disabled={pending || tokens >= tokenLimit}
            onClick={() => void apply('add', 1)}
            title='Sumar 1 token'
            className='px-2 py-1 rounded-md border border-border hover:border-[#f9bbc4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1'
          >
            <Plus className='w-3.5 h-3.5' /> 1
          </button>
          <button
            type='button'
            disabled={pending || tokens === 0}
            onClick={() => void apply('add', -1)}
            title='Restar 1 token'
            className='px-2 py-1 rounded-md border border-border hover:border-[#f9bbc4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1'
          >
            <Minus className='w-3.5 h-3.5' /> 1
          </button>
          <button
            type='button'
            disabled={pending || tokensBlocked}
            onClick={() => void apply('add', remaining)}
            title={`Marcar los ${tokenLimit} tokens de una y bloquear el chat`}
            className='px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1'
          >
            <Ban className='w-3.5 h-3.5' /> Bloquear
          </button>
          <button
            type='button'
            disabled={pending || tokens === 0}
            onClick={() => void apply('reset')}
            title='Volver el contador a 0 y desbloquear'
            className='px-2 py-1 rounded-md border border-border hover:border-[#f9bbc4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1'
          >
            <RotateCcw className='w-3.5 h-3.5' /> Reset
          </button>
          <button
            type='button'
            onClick={() => setHistoryOpen((v) => !v)}
            title='Ver historial de tokens'
            className='px-2 py-1 rounded-md border border-border hover:border-[#f9bbc4] flex items-center gap-1'
          >
            <History className='w-3.5 h-3.5' />
          </button>
          {pending && <Loader2 className='w-3.5 h-3.5 animate-spin text-muted-foreground' />}
        </div>
      </div>

      <input
        type='text'
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder='Motivo (opcional, solo lo ves vos)'
        className='mt-2 w-full px-2 py-1 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-[#f9bbc4]'
      />

      {error && <p className='mt-1 text-[11px] text-red-600'>{error}</p>}

      {historyOpen && (
        <div className='mt-2 max-h-40 overflow-y-auto border-t border-border/60 pt-2 space-y-1'>
          {history === null ? (
            <p className='text-[11px] text-muted-foreground'>Cargando historial…</p>
          ) : history.length === 0 ? (
            <p className='text-[11px] text-muted-foreground'>Sin movimientos.</p>
          ) : (
            history.map((e) => (
              <div
                key={e.id}
                className='flex items-center gap-2 text-[11px] text-muted-foreground'
              >
                <span
                  className={`font-medium ${
                    e.amount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {e.amount > 0 ? `+${e.amount}` : e.amount}
                </span>
                <span>→ {e.balanceAfter}</span>
                <span className='truncate'>{e.reason ?? ''}</span>
                <span className='ml-auto shrink-0'>
                  {formatDateTime(e.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
