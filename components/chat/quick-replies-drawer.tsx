'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Send,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi, type QuickReply } from '@/lib/chat-api';
import { ConfirmDialog } from '@/components/mentorship/confirm-dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Inserta el cuerpo de la respuesta en el input del chat (editable). */
  onPick: (body: string) => void;
}

type Draft = { id: string | null; title: string; body: string };

const EMPTY_DRAFT: Draft = { id: null, title: '', body: '' };

export function QuickRepliesDrawer({ open, onClose, onPick }: Readonly<Props>) {
  const [items, setItems] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(null);
    setSearch('');
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function load() {
    setLoading(true);
    try {
      setItems(await chatApi.quickReplies.list());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.title.toLowerCase().includes(q));
  }, [items, search]);

  async function save() {
    if (!draft) return;
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) {
      toast.error('Completá título y mensaje');
      return;
    }
    setSaving(true);
    try {
      if (draft.id) {
        const updated = await chatApi.quickReplies.update(draft.id, {
          title,
          body,
        });
        setItems((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
      } else {
        const created = await chatApi.quickReplies.create({ title, body });
        setItems((prev) => [created, ...prev]);
      }
      setDraft(null);
      toast.success('Respuesta guardada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await chatApi.quickReplies.remove(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      toast.success('Respuesta eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[60] flex flex-col justify-end'>
      <style jsx>{`
        @keyframes qrSheetUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .qr-sheet {
          animation: qrSheetUp 0.2s ease-out;
        }
      `}</style>
      {/* Backdrop */}
      <button
        type='button'
        aria-label='Cerrar'
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
      />

      {/* Sheet */}
      <div className='qr-sheet relative w-full bg-white dark:bg-card rounded-t-2xl shadow-2xl flex flex-col max-h-[88dvh] md:max-h-[85dvh] md:mx-auto md:max-w-lg md:mb-4 md:rounded-2xl'>
        {/* Handle + header */}
        <div className='shrink-0 px-4 pt-3 pb-2 border-b border-border'>
          <div className='mx-auto mb-2 h-1.5 w-10 rounded-full bg-muted md:hidden' />
          <div className='flex items-center justify-between gap-2'>
            <h3 className='text-base font-bold text-foreground'>
              Respuestas rápidas
            </h3>
            <button
              type='button'
              onClick={onClose}
              className='p-1.5 rounded-full hover:bg-muted text-muted-foreground'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Editor inline */}
        {draft ? (
          <div className='shrink-0 p-4 space-y-3 border-b border-border bg-muted/20'>
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder='Título (para buscarla)'
              maxLength={120}
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
            />
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder='Mensaje…'
              rows={4}
              maxLength={4000}
              className='w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
            />
            <div className='flex items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => setDraft(null)}
                className='px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={() => void save()}
                disabled={saving}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#f9bbc4] text-white hover:bg-[#eba2a8] disabled:opacity-50'
              >
                {saving ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Check className='w-4 h-4' />
                )}
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className='shrink-0 px-4 py-3 flex items-center gap-2 border-b border-border'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar por título…'
                className='w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
              />
            </div>
            <button
              type='button'
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              title='Nueva respuesta'
              className='inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg bg-[#f9bbc4] text-white hover:bg-[#eba2a8] shrink-0'
            >
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>Nueva</span>
            </button>
          </div>
        )}

        {/* Lista */}
        <div className='flex-1 overflow-y-auto min-h-0 p-3 space-y-2'>
          {loading ? (
            <div className='flex items-center justify-center py-10 text-muted-foreground'>
              <Loader2 className='w-5 h-5 animate-spin' />
            </div>
          ) : filtered.length === 0 ? (
            <p className='text-center text-sm text-muted-foreground py-10'>
              {search
                ? 'Sin resultados para tu búsqueda.'
                : 'Todavía no hay respuestas rápidas. Creá la primera.'}
            </p>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className='group rounded-xl border border-border bg-background hover:border-[#f9bbc4] transition-colors'
              >
                <button
                  type='button'
                  onClick={() => {
                    onPick(r.body);
                    onClose();
                  }}
                  className='w-full text-left px-3 py-2.5'
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-sm text-foreground truncate flex-1'>
                      {r.title}
                    </span>
                    <Send className='w-3.5 h-3.5 text-[#eba2a8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>
                    {r.body}
                  </p>
                </button>
                <div className='flex items-center gap-1 px-2 pb-2'>
                  <button
                    type='button'
                    onClick={() =>
                      setDraft({ id: r.id, title: r.title, body: r.body })
                    }
                    className='inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:bg-muted'
                  >
                    <Pencil className='w-3 h-3' /> Editar
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeleteId(r.id)}
                    className='inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                  >
                    <Trash2 className='w-3 h-3' /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteId && (
        <ConfirmDialog
          title='¿Eliminar esta respuesta rápida?'
          description='Dejará de estar disponible para insertar en los chats.'
          confirmLabel='Sí, eliminar'
          cancelLabel='No, volver'
          destructive
          onConfirm={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
