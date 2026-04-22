'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MessageCircle } from 'lucide-react';
import { chatApi, type ChatRoom, type ChatRoomStatus } from '@/lib/chat-api';
import { ChatRoomPanel } from '@/components/chat/chat-room-panel';
import { useChatConnection } from '@/hooks/useChat';
import { useChatStore } from '@/stores/chat-store';

export default function AdminChatsPage() {
  useChatConnection();
  const params = useSearchParams();
  const preselectedRoomId = params.get('roomId');

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ChatRoomStatus | ''>('');
  const [activeId, setActiveId] = useState<string | null>(preselectedRoomId);

  const upsertRoom = useChatStore((s) => s.upsertRoom);
  const setMobileFullScreen = useChatStore((s) => s.setMobileFullScreen);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    setMobileFullScreen(isMobile && activeId !== null);
    return () => setMobileFullScreen(false);
  }, [activeId, setMobileFullScreen]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((r) => map.set(r.category.id, r.category.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [rooms]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatApi.adminRooms({
        categoryId: categoryFilter || undefined,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setRooms(data);
      data.forEach((r) => upsertRoom(r));
      
      if (!activeId && data.length > 0) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (!isMobile) setActiveId(data[0].id);
      } else if (activeId && !data.some((r) => r.id === activeId)) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (!isMobile) setActiveId(data[0]?.id ?? null);
        else setActiveId(null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, statusFilter, upsertRoom, activeId]);

  useEffect(() => {
    void load();
  }, [load]);

  useChatStore.getState(); 
  const unread = useChatStore((s) => s.unreadTotal);
  useEffect(() => {
    const unsub = useChatStore.subscribe((state, prev) => {
      if (state.unreadTotal !== prev.unreadTotal) void load();
    });
    return () => unsub();
  }, [load]);

  const activeRoom = rooms.find((r) => r.id === activeId) ?? null;

  return ( 
    <div className='-mx-4 sm:-mx-6 lg:-mx-8 sm:-my-8 h-full'>
      <div className='h-[calc(100dvh-85px)] md:h-[calc(100vh-10rem)] grid grid-cols-12 overflow-hidden bg-white dark:bg-background border-y sm:border sm:border-border rounded-none sm:rounded-xl'>
        
        {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-border bg-white dark:bg-card ${activeRoom ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
          <div className='p-4 border-b border-border shrink-0'>
            <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
              <MessageCircle className='w-5 h-5 text-[#eba2a8]' />
              Chats de alumnos
              {unread > 0 && (
                <span className='ml-auto text-xs bg-[#f9bbc4] text-white rounded-full px-2 py-0.5'>
                  {unread}
                </span>
              )}
            </h2>
          </div>
          
          <div className='px-4 py-3 space-y-3 border-b border-border shrink-0'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar alumno…'
                className='w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
              />
            </div>
            
            <div className='flex flex-col gap-2'>
              <div className='relative'>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className='w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-muted/20 appearance-none text-foreground truncate'
                >
                  <option value=''>Todos los cursos</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className='relative'>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ChatRoomStatus | '')}
                  className='w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-muted/20 appearance-none text-foreground truncate'
                >
                  <option value=''>Todos los estados</option>
                  <option value='ACTIVE'>Activos</option>
                  <option value='GRACE'>En gracia</option>
                  <option value='CLOSED'>Cerrados</option>
                </select>
                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto min-h-0'>
            {loading ? (
              <div className='p-4 text-sm text-muted-foreground'>Cargando…</div>
            ) : error ? (
              <div className='p-4 text-sm text-red-500'>{error}</div>
            ) : (
              rooms.map((r) => (
                <RoomListItem key={r.id} room={r} active={r.id === activeId} onClick={() => setActiveId(r.id)} />
              ))
            )}
          </div>
        </aside>

        {/* Panel de Chat */}
        {/* FIX 3: h-full y flex-col aseguran que el contenido llene el espacio calculado */}
        <section className={`col-span-12 md:col-span-8 lg:col-span-9 bg-[#fafafa] dark:bg-background overflow-hidden relative h-full ${!activeRoom ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
          {activeRoom ? (
            <ChatRoomPanel
              key={activeRoom.id}
              room={activeRoom}
              showCounterpart
              onMobileBack={() => setActiveId(null)}
            />
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center text-center px-8 text-muted-foreground h-full'>
              <MessageCircle className='w-16 h-16 mb-4 opacity-40' />
              <p className='text-sm max-w-sm'>Seleccioná una conversación.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RoomListItem({ room, active, onClick }: { room: ChatRoom; active: boolean; onClick: () => void; }) {
  const name = [room.user.firstName, room.user.lastName].filter(Boolean).join(' ') || room.user.email;
  const initials = name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const last = room.lastMessage;
  const lastPreview = last ? last.type === 'IMAGE' ? '📷 Imagen' : last.content ?? '' : 'Sin mensajes';
  const time = room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : '';

  return (
    <button onClick={onClick} className={`w-full text-left flex gap-3 px-4 py-3 border-b border-border/60 transition-colors ${active ? 'bg-[#f9bbc4]/20' : 'hover:bg-muted/40'}`}>
      <div className='w-10 h-10 rounded-full bg-[#f9bbc4] text-white flex items-center justify-center text-sm font-semibold shrink-0'>{initials || '?'}</div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between gap-2'>
          <span className='font-medium text-sm text-foreground truncate'>{name}</span>
          <span className='text-[10px] text-muted-foreground shrink-0'>{time}</span>
        </div>
        <div className='text-xs text-muted-foreground truncate'>{room.category.name}</div>
        <div className='flex items-center justify-between gap-2 mt-0.5'>
          <span className='text-xs text-muted-foreground truncate'>{lastPreview}</span>
          {(room.unread ?? 0) > 0 && (
            <span className='text-[10px] bg-[#f9bbc4] text-white rounded-full px-2 py-0.5 shrink-0'>{room.unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}