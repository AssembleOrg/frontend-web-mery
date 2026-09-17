'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Clock3,
  Loader2,
  NotebookPen,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';
import { videoNotesApi, formatSeconds, type VideoNote } from '@/lib/video-notes-api';

interface Props {
  courseId: string;
  /** Video que se está viendo ahora. */
  videoId: string;
  videoTitle: string;
  /** Segundo actual del reproductor. */
  getCurrentTime: () => number;
  /** Saltar a un segundo del video actual. */
  onSeek: (seconds: number) => void;
  /** Abrir otro video de la formación en un segundo puntual. */
  onOpenVideo: (videoId: string, seconds: number) => void;
}

type Scope = 'video' | 'course';

/**
 * Diario de apuntes de la alumna: cada nota queda atada al segundo del video
 * en que la escribió, así después puede volver a ese momento para consultar.
 */
export function VideoNotesPanel({
  courseId,
  videoId,
  videoTitle,
  getCurrentTime,
  onSeek,
  onOpenVideo,
}: Readonly<Props>) {
  const [scope, setScope] = useState<Scope>('video');
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer
  const [draft, setDraft] = useState('');
  const [draftTime, setDraftTime] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const [toDelete, setToDelete] = useState<VideoNote | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        scope === 'video'
          ? await videoNotesApi.byVideo(videoId)
          : await videoNotesApi.byCategory(courseId);
      setNotes(data);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [scope, videoId, courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Al cambiar de video, el borrador y la edición vuelven a cero.
  useEffect(() => {
    setDraft('');
    setDraftTime(null);
    setEditingId(null);
  }, [videoId]);

  const captureTime = () => {
    const t = Math.floor(getCurrentTime());
    setDraftTime(t);
    if (draftTime !== null) toast.success(`Momento actualizado: ${formatSeconds(t)}`);
    textareaRef.current?.focus();
  };

  const clearTime = () => {
    setDraftTime(null);
    textareaRef.current?.focus();
  };

  const save = async () => {
    const content = draft.trim();
    if (!content) return;
    const timeSeconds = draftTime ?? Math.floor(getCurrentTime());
    setSaving(true);
    try {
      const created = await videoNotesApi.create({ videoId, timeSeconds, content });
      setNotes((prev) =>
        [...prev, created].sort(
          (a, b) =>
            (a.video.order - b.video.order) || (a.timeSeconds - b.timeSeconds),
        ),
      );
      setDraft('');
      setDraftTime(null);
      toast.success(`Apunte guardado en ${formatSeconds(timeSeconds)}`);
    } catch (e) {
      toast.error((e as Error).message || 'No se pudo guardar el apunte');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (n: VideoNote) => {
    setEditingId(n.id);
    setEditText(n.content);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const content = editText.trim();
    if (!content) return;
    setEditBusy(true);
    try {
      const updated = await videoNotesApi.update(editingId, { content });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setEditingId(null);
    } catch (e) {
      toast.error((e as Error).message || 'No se pudo editar el apunte');
    } finally {
      setEditBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    try {
      await videoNotesApi.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast.error((e as Error).message || 'No se pudo borrar el apunte');
    }
  };

  const jump = (n: VideoNote) => {
    if (n.videoId === videoId) onSeek(n.timeSeconds);
    else onOpenVideo(n.videoId, n.timeSeconds);
  };

  // En "toda la formación" agrupamos por video, en orden de la formación.
  const groups = useMemo(() => {
    if (scope === 'video') return [{ video: null, notes }];
    const map = new Map<string, { video: VideoNote['video']; notes: VideoNote[] }>();
    for (const n of notes) {
      const g = map.get(n.videoId) ?? { video: n.video, notes: [] };
      g.notes.push(n);
      map.set(n.videoId, g);
    }
    return [...map.values()].sort((a, b) => a.video.order - b.video.order);
  }, [scope, notes]);

  const timeLabel = formatSeconds(draftTime ?? 0);

  return (
    <section className='bg-[#2d2d2d] rounded-lg shadow-xl border border-gray-700'>
      {/* Header */}
      <div className='p-4 border-b border-gray-600 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <NotebookPen className='w-4 h-4 text-[#f9bbc4] shrink-0' />
          <h3 className='text-sm font-medium text-white truncate'>Mis apuntes</h3>
        </div>
        <div className='flex rounded-md bg-[#1a1a1a] p-0.5 shrink-0 ml-auto'>
          {(
            [
              ['video', 'Este video'],
              ['course', 'Toda la formación'],
            ] as [Scope, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type='button'
              onClick={() => setScope(key)}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                scope === key
                  ? 'bg-[#f9bbc4] text-[#660e1b] font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className='p-4 border-b border-gray-700 space-y-2.5'>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-xs text-gray-400 truncate'>
            Anotá algo de <span className='text-gray-200'>{videoTitle}</span>
          </p>
          {draftTime === null ? (
            <button
              type='button'
              onClick={captureTime}
              title='Marcar el segundo actual del video'
              className='inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-[#1a1a1a] text-[#f9bbc4] border border-[#f9bbc4]/40 hover:bg-[#f9bbc4]/10 transition-colors'
            >
              <Clock3 className='w-3.5 h-3.5' />
              Marcar momento
            </button>
          ) : (
            <div className='inline-flex items-stretch rounded-md border border-[#f9bbc4]/60 bg-[#f9bbc4]/20 text-[#f9bbc4] text-xs font-medium overflow-hidden'>
              <button
                type='button'
                onClick={captureTime}
                title='Volver a marcar con el momento actual del video'
                className='inline-flex items-center gap-1.5 px-2 py-1 tabular-nums hover:bg-[#f9bbc4]/20 transition-colors'
              >
                <Clock3 className='w-3.5 h-3.5' />
                {timeLabel}
                <RotateCcw className='w-3 h-3 opacity-70' />
              </button>
              <button
                type='button'
                onClick={clearTime}
                aria-label='Quitar la marca de tiempo'
                title='Quitar la marca (se vuelve a tomar al guardar)'
                className='inline-flex items-center px-1.5 border-l border-[#f9bbc4]/40 hover:bg-[#f9bbc4]/20 transition-colors'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            // Marca automática solo al empezar a escribir; si la usuaria quitó
            // la marca a propósito (ya hay texto), se toma recién al guardar.
            if (draftTime === null && !draft.trim()) setDraftTime(Math.floor(getCurrentTime()));
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void save();
          }}
          rows={2}
          maxLength={2000}
          placeholder='Escribí tu duda o apunte… se guarda con el minuto del video.'
          className='w-full resize-y rounded-lg bg-[#1a1a1a] border border-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]/60 focus:border-transparent'
        />
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[11px] text-gray-500'>
            {draftTime === null
              ? draft.trim()
                ? 'Sin marca: se toma el momento actual al guardar.'
                : 'Al escribir se marca el momento actual.'
              : 'Tocá la hora para actualizarla · Ctrl + Enter guarda.'}
          </span>
          <button
            type='button'
            onClick={save}
            disabled={saving || !draft.trim()}
            className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#f9bbc4] hover:bg-[#eba2a8] disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-1.5 text-xs font-medium text-white transition-colors'
          >
            {saving ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Check className='w-3.5 h-3.5' />}
            Guardar apunte
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className='max-h-[26rem] overflow-y-auto'>
        {loading ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='w-5 h-5 text-[#f9bbc4] animate-spin' />
          </div>
        ) : notes.length === 0 ? (
          <p className='px-4 py-8 text-center text-xs text-gray-500'>
            {scope === 'video'
              ? 'Todavía no anotaste nada en este video.'
              : 'Todavía no tenés apuntes en esta formación.'}
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.video?.id ?? 'current'}>
              {g.video && (
                <p className='px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-gray-500'>
                  {g.video.title}
                </p>
              )}
              {g.notes.map((n) => (
                <div
                  key={n.id}
                  className='group px-4 py-3 border-b border-gray-700/70 last:border-0 hover:bg-gray-600/20 transition-colors'
                >
                  <div className='flex items-start gap-3'>
                    <button
                      type='button'
                      onClick={() => jump(n)}
                      title='Ir a este momento del video'
                      className='shrink-0 mt-0.5 inline-flex items-center gap-1 rounded bg-[#f9bbc4]/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[#f9bbc4] hover:bg-[#f9bbc4]/30 transition-colors'
                    >
                      <Clock3 className='w-3 h-3' />
                      {formatSeconds(n.timeSeconds)}
                    </button>

                    <div className='min-w-0 flex-1'>
                      {editingId === n.id ? (
                        <div className='space-y-1.5'>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            maxLength={2000}
                            autoFocus
                            className='w-full resize-y rounded-md bg-[#1a1a1a] border border-gray-700 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]/60'
                          />
                          <div className='flex justify-end gap-1.5'>
                            <button
                              type='button'
                              onClick={() => setEditingId(null)}
                              className='px-2 py-1 text-[11px] text-gray-400 hover:text-white'
                            >
                              Cancelar
                            </button>
                            <button
                              type='button'
                              onClick={commitEdit}
                              disabled={editBusy || !editText.trim()}
                              className='px-2.5 py-1 text-[11px] rounded bg-[#f9bbc4] text-white hover:bg-[#eba2a8] disabled:opacity-40'
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm text-gray-200 whitespace-pre-wrap break-words'>
                          {n.content}
                        </p>
                      )}
                    </div>

                    {editingId !== n.id && (
                      <div className='shrink-0 flex items-center gap-0.5 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          type='button'
                          onClick={() => startEdit(n)}
                          aria-label='Editar apunte'
                          className='p-1 rounded text-gray-400 hover:text-white hover:bg-gray-600/40'
                        >
                          <Pencil className='w-3.5 h-3.5' />
                        </button>
                        <button
                          type='button'
                          onClick={() => setToDelete(n)}
                          aria-label='Borrar apunte'
                          className='p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-600/40'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title='Borrar apunte'
          description={`¿Borrar el apunte de ${formatSeconds(toDelete.timeSeconds)}? No se puede deshacer.`}
          confirmLabel='Borrar'
          destructive
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </section>
  );
}
