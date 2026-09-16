'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, Loader2, NotebookPen } from 'lucide-react';
import {
  videoNotesApi,
  formatSeconds,
  type VideoNoteAdmin,
} from '@/lib/video-notes-api';

interface Props {
  userId: string;
}

/**
 * Apuntes de una alumna vistos desde el admin (solo lectura): agrupados por
 * formación y video, con el minuto al que refiere cada uno.
 */
export function AdminUserNotes({ userId }: Readonly<Props>) {
  const [notes, setNotes] = useState<VideoNoteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCategoryFilter('');
    videoNotesApi
      .adminByUser(userId)
      .then((r) => {
        if (!cancelled) setNotes(r.notes);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notes) map.set(n.category.id, n.category.name);
    return [...map.entries()];
  }, [notes]);

  // formación → video → notas (ya vienen ordenadas del backend)
  const grouped = useMemo(() => {
    const rows = categoryFilter ? notes.filter((n) => n.categoryId === categoryFilter) : notes;
    const byCat = new Map<
      string,
      { name: string; videos: Map<string, { title: string; notes: VideoNoteAdmin[] }> }
    >();
    for (const n of rows) {
      const cat = byCat.get(n.categoryId) ?? { name: n.category.name, videos: new Map() };
      const vid = cat.videos.get(n.videoId) ?? { title: n.video.title, notes: [] };
      vid.notes.push(n);
      cat.videos.set(n.videoId, vid);
      byCat.set(n.categoryId, cat);
    }
    return [...byCat.entries()];
  }, [notes, categoryFilter]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
      <div className='flex items-center justify-between gap-3 mb-3'>
        <h3 className='font-semibold text-gray-900 inline-flex items-center gap-2'>
          <NotebookPen className='w-4 h-4 text-[var(--mg-pink)]' />
          Apuntes de la alumna
          {!loading && (
            <span className='text-xs font-normal text-gray-500'>({notes.length})</span>
          )}
        </h3>
        {categories.length > 1 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[var(--mg-pink)] focus:border-transparent'
          >
            <option value=''>Todas las formaciones</option>
            {categories.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className='text-xs text-gray-500 mb-3'>
        Lo que fue anotando mientras veía los videos, con el minuto de cada apunte.
        Útil para responder dudas en el chat o la mentoría.
      </p>

      {loading ? (
        <div className='py-6 flex justify-center'>
          <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
        </div>
      ) : grouped.length === 0 ? (
        <p className='py-4 text-center text-sm text-gray-400'>Todavía no dejó apuntes.</p>
      ) : (
        <div className='space-y-4 max-h-[28rem] overflow-y-auto pr-1'>
          {grouped.map(([catId, cat]) => (
            <div key={catId}>
              <p className='text-xs font-semibold uppercase tracking-wider text-[var(--mg-burgundy)] mb-2'>
                {cat.name}
              </p>
              <div className='space-y-3'>
                {[...cat.videos.entries()].map(([vidId, vid]) => (
                  <div key={vidId} className='rounded-lg bg-white border border-gray-200'>
                    <p className='px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100'>
                      {vid.title}
                    </p>
                    <ul className='divide-y divide-gray-100'>
                      {vid.notes.map((n) => (
                        <li key={n.id} className='px-3 py-2 flex items-start gap-2.5'>
                          <span className='shrink-0 mt-0.5 inline-flex items-center gap-1 rounded bg-[var(--mg-pink-light)] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[var(--mg-burgundy)]'>
                            <Clock3 className='w-3 h-3' />
                            {formatSeconds(n.timeSeconds)}
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block text-sm text-gray-800 whitespace-pre-wrap break-words'>
                              {n.content}
                            </span>
                            <span className='block text-[11px] text-gray-400 mt-0.5'>
                              {fmtDate(n.createdAt)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
