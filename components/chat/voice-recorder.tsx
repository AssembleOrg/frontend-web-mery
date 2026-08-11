'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '@/lib/chat-api';

interface Props {
  disabled?: boolean;
  /** Recibe el texto transcripto para insertarlo (editable) en el input. */
  onTranscription: (text: string) => void;
  /** Avisa cuando el grabador deja de estar en reposo (para ocultar el resto del input). */
  onActiveChange?: (active: boolean) => void;
}

type RecState = 'idle' | 'recording' | 'review' | 'transcribing';

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
];

function pickSupportedMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({
  disabled,
  onTranscription,
  onActiveChange,
}: Readonly<Props>) {
  const [state, setState] = useState<RecState>('idle');

  useEffect(() => {
    onActiveChange?.(state !== 'idle');
  }, [state, onActiveChange]);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;
    if (streamRef.current)
      for (const t of streamRef.current.getTracks()) t.stop();
    streamRef.current = null;
  }

  async function start() {
    if (disabled) return;
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      toast.error('Tu navegador no soporta grabación');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const mime = pickSupportedMime();
      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (e) =>
        e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const baseMime = (mime || recorder.mimeType || 'audio/webm').split(
          ';',
        )[0];
        const finalBlob = new Blob(chunksRef.current, { type: baseMime });
        if (finalBlob.size === 0) {
          toast.error('La grabación quedó vacía. Volvé a intentar.');
          cleanup();
          setState('idle');
          return;
        }
        setBlob(finalBlob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(finalBlob));
        setState('review');
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setDuration(0);
      tickerRef.current = setInterval(
        () => setDuration(Date.now() - startedAtRef.current),
        200,
      );
      setState('recording');
    } catch (e) {
      console.error(e);
      toast.error('No pudimos acceder al micrófono');
      cleanup();
      setState('idle');
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive')
      recorderRef.current.stop();
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = null;
    if (streamRef.current)
      for (const t of streamRef.current.getTracks()) t.stop();
    streamRef.current = null;
  }

  function discard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBlob(null);
    setDuration(0);
    setState('idle');
  }

  async function transcribe() {
    if (!blob) return;
    setState('transcribing');
    try {
      const text = await chatApi.transcribe(blob);
      if (text.trim()) {
        onTranscription(text.trim());
        toast.success('Audio transcripto');
        discard();
      } else {
        toast.error('No se detectó texto en el audio');
        setState('review');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al transcribir');
      setState('review');
    }
  }

  if (state === 'idle') {
    return (
      <button
        type='button'
        onClick={start}
        disabled={disabled}
        title='Grabar nota de voz'
        className='p-2 rounded-full hover:bg-muted disabled:opacity-50 shrink-0 transition-colors mb-0.5'
      >
        <Mic className='w-5 h-5 text-[#eba2a8]' />
      </button>
    );
  }

  if (state === 'recording') {
    return (
      <button
        type='button'
        onClick={stop}
        className='inline-flex h-9 items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3 text-xs font-semibold text-red-600 shrink-0 mb-0.5'
      >
        <span className='relative flex h-2 w-2'>
          <span className='absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-red-500' />
        </span>
        <Square className='w-3.5 h-3.5' />
        <span className='font-mono tabular-nums'>
          {formatDuration(duration)}
        </span>
      </button>
    );
  }

  if (state === 'transcribing') {
    return (
      <span className='inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground shrink-0 mb-0.5'>
        <Loader2 className='w-3.5 h-3.5 animate-spin' />
        Transcribiendo…
      </span>
    );
  }

  // review
  return (
    <div className='flex flex-1 items-center gap-2 min-w-0'>
      {previewUrl && (
        <audio
          src={previewUrl}
          controls
          className='h-9 flex-1 min-w-0 max-w-[200px]'
        />
      )}
      <button
        type='button'
        onClick={transcribe}
        title='Transcribir a texto'
        className='inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f9bbc4] px-3 text-xs font-bold text-white hover:bg-[#eba2a8] transition-colors shrink-0'
      >
        <FileText className='w-3.5 h-3.5' />
        Transcribir
      </button>
      <button
        type='button'
        onClick={discard}
        title='Descartar'
        className='flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors shrink-0'
      >
        <Trash2 className='w-4 h-4' />
      </button>
    </div>
  );
}
