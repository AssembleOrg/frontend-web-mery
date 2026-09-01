'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail, Send, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { emailApi, CampaignResult } from '@/lib/email-api';

export default function AdminEmailsPage() {
  const [limit, setLimit] = useState(150);
  const [preview, setPreview] = useState<CampaignResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      const response = await emailApi.formacionesCampaign(limit, false);
      setPreview(response.data);
      setConfirmed(false);
      toast.success(`Se encontraron ${response.data.total} clientes elegibles`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar la vista previa');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCampaign = async () => {
    if (!confirmed) {
      toast.error('Confirmá que querés enviar la campaña');
      return;
    }

    try {
      setIsLoading(true);
      const response = await emailApi.formacionesCampaign(limit, true);
      setPreview(response.data);
      setConfirmed(false);
      toast.success(`Campaña enviada a ${response.data.sent} clientes`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar la campaña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-[#EBA2A8]'>Comunicaciones</p>
        <h1 className='mt-1 text-2xl sm:text-3xl font-bold text-gray-900'>Enviar promoción</h1>
        <p className='mt-1 text-sm text-gray-500'>Campaña de Formaciones · 40% OFF</p>
      </div>

      <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
        <div className='flex gap-3'>
          <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0' />
          <p>Se enviará únicamente a clientes activos con email verificado. Revisá la vista previa antes de confirmar.</p>
        </div>
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B2B2B]'>
            <Mail className='h-5 w-5 text-[#EBA2A8]' />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900'>Campaña #FormacionesMG</h2>
            <p className='text-sm text-gray-500'>Envío personalizado con el nombre de cada cliente</p>
          </div>
        </div>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-end'>
          <label className='block max-w-xs flex-1'>
            <span className='mb-1.5 block text-sm font-medium text-gray-700'>Cantidad máxima</span>
            <input
              type='number'
              min={1}
              max={150}
              value={limit}
              onChange={(event) => setLimit(Math.max(1, Math.min(150, Number(event.target.value) || 1)))}
              className='w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#EBA2A8] focus:ring-2 focus:ring-[#EBA2A8]/20'
            />
          </label>
          <button
            type='button'
            onClick={loadPreview}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-[#2B2B2B] px-4 py-2.5 text-sm font-semibold text-[#2B2B2B] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Users className='h-4 w-4' />
            {isLoading ? 'Consultando…' : 'Ver destinatarios'}
          </button>
        </div>
      </section>

      {preview && (
        <section className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='font-semibold text-gray-900'>{preview.dryRun ? 'Vista previa' : 'Resultado del envío'}</h2>
              <p className='mt-1 text-sm text-gray-500'>
                {preview.dryRun ? `${preview.total} destinatarios elegibles` : `${preview.sent} enviados · ${preview.failed.length} fallidos`}
              </p>
            </div>
            {!preview.dryRun && <CheckCircle2 className='h-6 w-6 text-green-600' />}
          </div>

          <div className='mt-4 max-h-64 overflow-y-auto rounded-xl bg-gray-50 p-3 text-sm'>
            {preview.recipients.map((recipient) => (
              <div key={recipient.id} className='flex justify-between gap-3 border-b border-gray-100 py-2 last:border-0'>
                <span className='font-medium text-gray-700'>{recipient.name}</span>
                <span className='truncate text-gray-500'>{recipient.email}</span>
              </div>
            ))}
          </div>

          {preview.dryRun && preview.total > 0 && (
            <div className='mt-5'>
              <label className='flex cursor-pointer items-start gap-3 text-sm text-gray-700'>
                <input
                  type='checkbox'
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className='mt-0.5 h-4 w-4 accent-[#5f0001]'
                />
                <span>Revisé los destinatarios y confirmo el envío de esta promoción.</span>
              </label>
              <button
                type='button'
                onClick={sendCampaign}
                disabled={isLoading || !confirmed}
                className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f0001] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#470001] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
              >
                <Send className='h-4 w-4' />
                {isLoading ? 'Enviando…' : `Enviar a ${preview.total} clientes`}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
