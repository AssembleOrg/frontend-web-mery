'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Check, Download, Loader2, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { usePwaStore } from '@/stores/pwa-store';
import { notificationsApi, type AppNotification } from '@/lib/notifications-api';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const isIOS = () =>
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Campana de notificaciones persistentes (admins y alumnas). Además ofrece
 * activar los avisos push en este dispositivo e instalar la app (PWA).
 */
export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useNotificationsStore((s) => s.items);
  const unread = useNotificationsStore((s) => s.unread);
  const loaded = useNotificationsStore((s) => s.loaded);
  const setAll = useNotificationsStore((s) => s.setAll);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const canInstall = usePwaStore((s) => s.canInstall);
  const isStandalone = usePwaStore((s) => s.isStandalone);
  const promptInstall = usePwaStore((s) => s.promptInstall);
  const swRegistration = usePwaStore((s) => s.swRegistration);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushOn, setPushOn] = useState<boolean | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Carga inicial (lista + no leídas).
  useEffect(() => {
    if (!isAuthenticated || loaded) return;
    notificationsApi
      .list()
      .then((r) => setAll(r.items, r.unread))
      .catch(() => {});
  }, [isAuthenticated, loaded, setAll]);

  // Click afuera cierra.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const getRegistration = async () => {
    if (swRegistration) return swRegistration;
    if (!('serviceWorker' in navigator)) return null;
    return navigator.serviceWorker.ready;
  };

  const refreshPushState = async () => {
    try {
      if (!('PushManager' in window) || !('Notification' in window)) {
        setPushOn(false);
        return;
      }
      const reg = await getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setPushOn(!!sub && Notification.permission === 'granted');
    } catch {
      setPushOn(false);
    }
  };

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const r = await notificationsApi.list();
      setAll(r.items, r.unread);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
    void refreshPushState();
  };

  const openItem = async (n: AppNotification) => {
    if (!n.readAt) {
      markRead(n.id);
      notificationsApi.markRead(n.id).catch(() => {});
    }
    setOpen(false);
    if (n.url) router.push(n.url);
  };

  const readAll = async () => {
    markAllRead();
    notificationsApi.markAllRead().catch(() => {});
  };

  const enablePush = async () => {
    setPushBusy(true);
    try {
      if (!('PushManager' in window) || !('Notification' in window)) {
        toast.error('Este navegador no soporta avisos push.');
        return;
      }
      if (isIOS() && !isStandalone) {
        toast('En iPhone: primero instalá la app (Compartir → Agregar a inicio) y activá los avisos desde ahí.', {
          icon: '📱',
          duration: 7000,
        });
        return;
      }
      const { enabled, publicKey } = await notificationsApi.pushPublicKey();
      if (!enabled || !publicKey) {
        toast.error('Los avisos push no están configurados todavía.');
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast.error('No diste permiso para avisos.');
        return;
      }
      const reg = await getRegistration();
      if (!reg) {
        toast.error('No se pudo registrar el service worker.');
        return;
      }
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      await notificationsApi.pushSubscribe(sub.toJSON());
      setPushOn(true);
      toast.success('Avisos activados en este dispositivo');
    } catch (e) {
      toast.error((e as Error).message || 'No se pudieron activar los avisos');
    } finally {
      setPushBusy(false);
    }
  };

  const disablePush = async () => {
    setPushBusy(true);
    try {
      const reg = await getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await notificationsApi.pushUnsubscribe(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
      setPushOn(false);
      toast.success('Avisos desactivados en este dispositivo');
    } finally {
      setPushBusy(false);
    }
  };

  const install = async () => {
    const r = await promptInstall();
    if (r === 'accepted') toast.success('¡App instalada!');
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={toggle}
        aria-label='Notificaciones'
        className='relative p-2 rounded-full hover:bg-muted transition-colors'
      >
        {unread > 0 ? (
          <BellRing className='w-5 h-5 text-foreground' />
        ) : (
          <Bell className='w-5 h-5 text-foreground' />
        )}
        {unread > 0 && (
          <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#8b1538] text-white text-[10px] font-bold flex items-center justify-center'>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-[min(92vw,360px)] rounded-2xl border border-border bg-white dark:bg-card shadow-2xl z-[60] overflow-hidden'>
          <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
            <p className='text-sm font-semibold'>Notificaciones</p>
            {unread > 0 && (
              <button
                type='button'
                onClick={readAll}
                className='text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
              >
                <Check className='w-3 h-3' /> Marcar todas leídas
              </button>
            )}
          </div>

          <div className='max-h-[55vh] overflow-y-auto'>
            {loading && items.length === 0 ? (
              <div className='py-8 flex justify-center'>
                <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
              </div>
            ) : items.length === 0 ? (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                Todavía no tenés notificaciones.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type='button'
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/50 transition-colors ${
                    n.readAt ? '' : 'bg-[#fbe8ea]/40'
                  }`}
                >
                  <div className='flex items-start gap-2'>
                    {!n.readAt && (
                      <span className='mt-1.5 w-2 h-2 rounded-full bg-[#8b1538] shrink-0' />
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className={`text-sm leading-snug ${n.readAt ? 'text-foreground/80' : 'font-semibold'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>{n.body}</p>
                      )}
                      <p className='text-[10px] text-muted-foreground mt-1'>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Push + instalar */}
          <div className='border-t border-border px-4 py-3 space-y-2 bg-muted/30'>
            {pushOn === null ? null : pushOn ? (
              <button
                type='button'
                onClick={disablePush}
                disabled={pushBusy}
                className='w-full text-left text-xs inline-flex items-center gap-2 text-muted-foreground hover:text-foreground'
              >
                <BellRing className='w-3.5 h-3.5 text-green-600' />
                Avisos activados en este dispositivo · <span className='underline'>desactivar</span>
              </button>
            ) : (
              <button
                type='button'
                onClick={enablePush}
                disabled={pushBusy}
                className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] disabled:opacity-50'
              >
                {pushBusy ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Smartphone className='w-3.5 h-3.5 text-[#EBA2A8]' />}
                Recibir avisos en este dispositivo
              </button>
            )}
            {canInstall && !isStandalone && (
              <button
                type='button'
                onClick={install}
                className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:border-[#EBA2A8]'
              >
                <Download className='w-3.5 h-3.5' /> Instalar la app
              </button>
            )}
            {!canInstall && !isStandalone && isIOS() && (
              <p className='text-[10px] text-muted-foreground'>
                iPhone: Compartir → “Agregar a inicio” para instalar la app.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
