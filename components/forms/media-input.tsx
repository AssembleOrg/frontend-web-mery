'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { FormsApiError, uploadFormImage, type MediaAnswer } from '@/lib/forms-api';

const MAX_IMAGES = 6;
const MAX_LINKS = 3;
const MAX_SIDE = 2000;

export const isValidLink = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol) && value.includes('.');
  } catch {
    return false;
  }
};

/** Quien pega "instagram.com/x" no tiene por qué escribir https://. */
const parseLinks = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((l) => (/^[a-z][a-z0-9+.-]*:/i.test(l) ? l : `https://${l}`));

/**
 * Achica la foto en el navegador: las de celular pesan varios MB y tardan en
 * subir con datos móviles. Si no se puede leer, sube el original y decide el servidor.
 */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    // JPG no tiene transparencia: sin esto, un PNG transparente queda con fondo negro.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function MediaInput({
  fieldId,
  slug,
  value,
  onChange,
  onUploadChange,
}: Readonly<{
  fieldId: string;
  /** Sin slug (vista previa del admin) no se sube nada. */
  slug?: string;
  value?: MediaAnswer;
  onChange: (value: MediaAnswer) => void;
  onUploadChange: (delta: number) => void;
}>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<string[]>(value?.images ?? []);
  const linksRef = useRef<string[]>(value?.links ?? []);
  const [images, setImages] = useState<string[]>(imagesRef.current);
  const [pending, setPending] = useState(0);
  const [linksText, setLinksText] = useState('');
  const [error, setError] = useState('');

  const emit = () => onChange({ images: imagesRef.current, links: linksRef.current });

  const setImageList = (next: string[]) => {
    imagesRef.current = next;
    setImages(next);
    emit();
  };

  const uploadOne = async (file: File) => {
    onUploadChange(1);
    setPending((n) => n + 1);
    try {
      const url = await uploadFormImage(slug as string, fieldId, await shrinkImage(file));
      setImageList([...imagesRef.current, url]);
    } catch (e) {
      setError(e instanceof FormsApiError ? e.message : 'No pudimos subir una imagen. Probá de nuevo.');
    } finally {
      onUploadChange(-1);
      setPending((n) => n - 1);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !slug) return;
    setError('');
    const room = MAX_IMAGES - images.length - pending;
    const list = Array.from(files);
    if (list.length > room) setError(`Podés subir hasta ${MAX_IMAGES} imágenes.`);
    list.slice(0, Math.max(room, 0)).forEach((file) => void uploadOne(file));
    if (inputRef.current) inputRef.current.value = '';
  };

  const full = images.length + pending >= MAX_IMAGES;

  return (
    <div className='space-y-3'>
      <input
        ref={inputRef}
        type='file'
        // Sin HEIC a propósito: así el iPhone convierte la foto a JPG al elegirla.
        accept='image/jpeg,image/png,image/webp'
        multiple
        className='hidden'
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type='button'
        disabled={!slug || full}
        onClick={() => inputRef.current?.click()}
        className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#eba2a8] bg-[#fbe8ea]/40 text-sm font-medium text-[#2b2b2b] hover:bg-[#fbe8ea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <ImagePlus className='w-4 h-4' />
        Subir imágenes
      </button>

      {(images.length > 0 || pending > 0) && (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
          {images.map((url) => (
            <div key={url} className='relative aspect-square'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt='Imagen subida' className='h-full w-full rounded-xl object-cover border border-[#f7cbcb]/70' />
              <button
                type='button'
                aria-label='Quitar imagen'
                onClick={() => setImageList(imagesRef.current.filter((u) => u !== url))}
                className='absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2b2b2b]/80 text-white'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
          {Array.from({ length: pending }, (_, i) => (
            <div key={i} className='flex aspect-square items-center justify-center rounded-xl bg-[#fbe8ea]/60'>
              <Loader2 className='w-5 h-5 animate-spin text-[#eba2a8]' />
            </div>
          ))}
        </div>
      )}

      <div>
        <label htmlFor={`${fieldId}-links`} className='block text-[13px] text-[#3a3a3a] mb-1.5'>
          O pegá un link (Instagram, Drive…)
        </label>
        <textarea
          id={`${fieldId}-links`}
          value={linksText}
          rows={2}
          placeholder={'https://instagram.com/p/…'}
          onChange={(e) => {
            setLinksText(e.target.value);
            const links = parseLinks(e.target.value);
            setError(links.length > MAX_LINKS ? `Podés pegar hasta ${MAX_LINKS} links.` : '');
            linksRef.current = links.slice(0, MAX_LINKS);
            emit();
          }}
          className='w-full px-4 py-3 rounded-xl border border-[#f7cbcb]/70 bg-white text-base sm:text-sm text-[#2b2b2b] placeholder:text-[#545454]/50 focus:outline-none focus:ring-2 focus:ring-[#eba2a8] focus:border-transparent transition-shadow resize-y'
        />
      </div>

      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  );
}
