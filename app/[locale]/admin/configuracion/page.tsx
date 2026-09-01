'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getAdminSettings,
  updateAdminSetting,
  type AppSetting,
} from '@/lib/api-client';

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSettings();
      setSettings(res.data);
      setDrafts(
        Object.fromEntries(res.data.map((s) => [s.key, s.rawValue])),
      );
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (setting: AppSetting) => {
    const value = drafts[setting.key] ?? setting.rawValue;
    if (value === setting.rawValue) return;
    setSavingKey(setting.key);
    try {
      const res = await updateAdminSetting(setting.key, value);
      setSettings((prev) =>
        prev.map((s) =>
          s.key === setting.key
            ? { ...s, value: res.data.value, rawValue: res.data.rawValue, updatedAt: res.data.updatedAt }
            : s,
        ),
      );
      toast.success('Configuración guardada');
    } catch (err) {
      toast.error((err as Error).message || 'No se pudo guardar');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Settings className='w-6 h-6 text-[#eba2a8]' />
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Configuración</h1>
          <p className='text-sm text-gray-500'>
            Ajustes generales del portal. Los cambios se aplican al instante.
          </p>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Loader2 className='w-4 h-4 animate-spin' /> Cargando…
        </div>
      ) : error ? (
        <p className='text-sm text-red-600'>{error}</p>
      ) : (
        <div className='space-y-4'>
          {settings.map((s) => {
            const draft = drafts[s.key] ?? s.rawValue;
            const dirty = draft !== s.rawValue;
            return (
              <div
                key={s.key}
                className='bg-white border border-gray-100 rounded-xl p-4 shadow-sm'
              >
                <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                  <div className='flex-1 min-w-0'>
                    <h2 className='font-semibold text-gray-900'>{s.label}</h2>
                    <p className='text-sm text-gray-500 mt-0.5'>{s.description}</p>
                    {s.updatedAt && (
                      <p className='text-[11px] text-gray-400 mt-1'>
                        Última modificación:{' '}
                        {new Date(s.updatedAt).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    {s.type === 'boolean' ? (
                      <select
                        value={draft}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [s.key]: e.target.value }))
                        }
                        className='px-3 py-2 rounded-lg border border-gray-200 text-sm'
                      >
                        <option value='true'>Activado</option>
                        <option value='false'>Desactivado</option>
                      </select>
                    ) : (
                      <input
                        type={s.type === 'int' ? 'number' : 'text'}
                        value={draft}
                        min={s.min ?? undefined}
                        max={s.max ?? undefined}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [s.key]: e.target.value }))
                        }
                        className='w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm'
                      />
                    )}
                    <button
                      onClick={() => void save(s)}
                      disabled={!dirty || savingKey === s.key}
                      className='px-4 py-2 rounded-lg bg-[#f9bbc4] text-[#660e1b] font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                      {savingKey === s.key ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Save className='w-4 h-4' />
                      )}
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
