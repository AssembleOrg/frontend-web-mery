'use client';

import { useEffect, useState } from 'react';
import { Check, Download, ImagePlus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  MATERIAL_SECTIONS,
  MATERIAL_TOTAL,
  materialProgress,
  mentorshipApi,
  type MaterialGroup,
  type Mentorship,
  type MentorshipMaterial,
} from '@/lib/mentorship-api';

const PRACTICE_PDF = '/downloable/formaciones/Practicas-para-imprimir.pdf';
const DIN = { fontFamily: 'var(--font-din-condensed)' } as const;
const EMPTY: MentorshipMaterial = { box: [], sheet: [], dislike: [], like: [], notStaff: false };
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Aviso destacado del paso pendiente (material sin completar) en el banner de
 * "Mentoría agendada": es lo primero que tiene que hacer la alumna después de
 * reservar. En la tarjeta del curso va solo un botón, para no ocupar espacio.
 */
export function MaterialPendingCta({
  mentorship,
  onOpen,
}: Readonly<{ mentorship: Mentorship; onOpen: () => void }>) {
  const progress = materialProgress(mentorship.material);
  return (
    <div className='mt-3 bg-[#F9BBC4] px-4 py-3.5 text-black'>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2.5'>
        <div className='min-w-0 flex-1'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60' style={DIN}>
            Paso pendiente · {pad(progress)} / {pad(MATERIAL_TOTAL)}
          </p>
          <p
            className='text-[17px] font-semibold uppercase leading-tight'
            style={DIN}
          >
            Cargá tu material para Mery
          </p>
          <p className='mt-0.5 text-[11px] leading-snug text-black/70'>
            Prácticas de cajas, hoja de prácticas y referencias. Mery lo revisa antes del encuentro.
          </p>
        </div>
        <button
          type='button'
          onClick={onOpen}
          className='inline-flex shrink-0 items-center gap-2 bg-black px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#2b2b2b]'
          style={DIN}
        >
          <ImagePlus className='h-3.5 w-3.5 text-[#F9BBC4]' />
          {progress ? 'Continuar' : 'Cargar material'}
        </button>
      </div>
      <div className='mt-2.5 h-[2px] bg-black/10'>
        <div className='h-[2px] bg-black' style={{ width: `${(progress / MATERIAL_TOTAL) * 100}%` }} />
      </div>
    </div>
  );
}

/**
 * Material previo a la mentoría (Estilismo): prácticas y referencias que Mery
 * revisa antes del encuentro. Cada cambio se guarda al toque (subir, quitar,
 * confirmar). Editable hasta que empieza la mentoría.
 * Mismo lenguaje visual que el flyer y el popup "Prepárate para tu mentoría".
 */
export function MentorshipMaterialModal({
  mentorship,
  onClose,
}: Readonly<{ mentorship: Mentorship; onClose: () => void }>) {
  const [material, setMaterial] = useState<MentorshipMaterial>(mentorship.material ?? EMPTY);
  const [busy, setBusy] = useState<MaterialGroup | 'save' | null>(null);
  const editable =
    mentorship.status === 'SCHEDULED' && new Date(mentorship.scheduledStart) > new Date();

  // Bloquear scroll de fondo, esconder el bot externo y cerrar con Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('hide-rag-widget');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Un guardado a la vez: dos PUT con estado viejo podrían re-agregar una
  // imagen que el anterior ya borró del bucket.
  async function save(next: MentorshipMaterial) {
    const prev = material;
    setMaterial(next);
    setBusy((b) => b ?? 'save');
    try {
      await mentorshipApi.saveMaterial(mentorship.id, next);
      window.dispatchEvent(new CustomEvent('mentorship:changed'));
    } catch (e) {
      setMaterial(prev);
      toast.error((e as Error).message);
    } finally {
      setBusy((b) => (b === 'save' ? null : b));
    }
  }

  async function upload(group: MaterialGroup, max: number, files: FileList | null) {
    if (!files?.length) return;
    const room = max - material[group].length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) toast(`Solo se suben ${room} más en esta sección`);
    setBusy(group);
    try {
      const uploaded = await Promise.all(
        picked.map((f) => mentorshipApi.uploadMaterialImage(mentorship.id, f)),
      );
      await save({ ...material, [group]: [...material[group], ...uploaded] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const hasReferences = material.dislike.length + material.like.length > 0;
  const progress = materialProgress(material);
  const complete = progress >= MATERIAL_TOTAL && material.notStaff;

  // Si cierra con material pendiente, le recordamos dónde retomarlo.
  const close = () => {
    if (editable && !complete) {
      toast('Tu material quedó pendiente: lo retomás desde “Mentoría agendada” en Mi Cuenta.', {
        icon: '📌',
        duration: 6000,
      });
    }
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in-0 duration-300'
      role='dialog'
      aria-modal='true'
      aria-labelledby='mentorship-material-title'
    >
      <style>{`
        @keyframes material-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .material-rise { opacity: 0; animation: material-rise 0.6s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .material-rise { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={close} aria-hidden='true' />

      <div className='relative z-[70] w-full max-w-[760px] animate-in zoom-in-95 duration-300'>
        <button
          type='button'
          onClick={close}
          aria-label='Cerrar'
          className='absolute -top-3 -right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-[#FBE8EA] focus:outline-none focus:ring-2 focus:ring-white/60'
        >
          <X className='h-5 w-5' />
        </button>

        <div className='relative overflow-hidden rounded-[20px] bg-black text-white shadow-2xl'>
          {/* Marco fino blanco, fijo mientras el contenido scrollea */}
          <div
            aria-hidden
            className='material-rise pointer-events-none absolute inset-2.5 z-30 border border-white/45 sm:inset-4'
            style={{ animationDelay: '0.3s' }}
          />

          {/* Flag rosa: sale del borde derecho, como el flyer */}
          <span
            className='material-rise absolute right-0 top-6 z-40 whitespace-nowrap bg-[#F9BBC4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black sm:top-9 sm:px-4 sm:py-1.5 sm:text-[12px]'
            style={{ ...DIN, animationDelay: '0.2s' }}
          >
            {complete ? 'Material completo' : 'Antes de tu mentoría'}
          </span>

          <div className='relative z-20 max-h-[88dvh] overflow-y-auto px-6 pb-8 pt-14 sm:px-12 sm:pb-12 sm:pt-20'>
            <h2
              id='mentorship-material-title'
              className='material-rise text-[28px] font-semibold uppercase leading-[0.9] sm:text-[42px]'
              style={{ ...DIN, animationDelay: '0.1s' }}
            >
              Tu material
              <br />
              para Mery
            </h2>
            <span
              aria-hidden
              className='material-rise mt-4 block h-px w-12 bg-[#F9BBC4] sm:mt-5'
              style={{ animationDelay: '0.22s' }}
            />
            <p
              className='material-rise mt-4 max-w-[46ch] text-[13px] leading-snug text-[#F7CBCB] sm:text-[14px]'
              style={{ animationDelay: '0.3s' }}
            >
              Mery revisa tus prácticas antes del encuentro para llegar con tu devolución preparada.{' '}
              {editable
                ? 'Podés modificarlas hasta que empiece la mentoría.'
                : 'La mentoría ya empezó: el material queda solo lectura.'}
            </p>

            {/* Progreso */}
            <div className='material-rise mt-6 flex items-end gap-4' style={{ animationDelay: '0.38s' }}>
              <span className='text-[34px] font-semibold leading-none sm:text-[44px]' style={DIN}>
                {pad(progress)}
                <span className='text-[#F7CBCB]'> / {pad(MATERIAL_TOTAL)}</span>
              </span>
              <div className='mb-2 h-px flex-1 bg-white/15'>
                <div
                  className='h-px bg-[#F9BBC4] transition-all duration-500'
                  style={{ width: `${(progress / MATERIAL_TOTAL) * 100}%` }}
                />
              </div>
            </div>

            <div className='mt-8 space-y-9 sm:mt-10'>
              {MATERIAL_SECTIONS.map((s, idx) => {
                const items = material[s.group];
                const isReference = s.group === 'dislike' || s.group === 'like';
                const canAdd = editable && items.length < s.max && (!isReference || material.notStaff);
                const done = items.length >= s.min;
                return (
                  <section
                    key={s.group}
                    className='material-rise'
                    style={{ animationDelay: `${0.46 + idx * 0.08}s` }}
                  >
                    {s.group === 'dislike' && (
                      <label className='mb-8 flex cursor-pointer items-start gap-2.5 bg-[#F9BBC4] px-4 py-3.5 text-[12px] leading-snug text-black sm:text-[13px]'>
                        <input
                          type='checkbox'
                          className='mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-black'
                          checked={material.notStaff}
                          // Con referencias cargadas no se puede desmarcar (el backend lo exige).
                          disabled={!editable || (material.notStaff && hasReferences) || busy !== null}
                          onChange={(e) => void save({ ...material, notStaff: e.target.checked })}
                        />
                        <span>
                          Confirmo que las fotos de referencia{' '}
                          <strong className='font-semibold'>
                            no son trabajos del staff de Mery García
                          </strong>
                          , como indica el flyer de la academia ✨
                        </span>
                      </label>
                    )}

                    <div className='flex items-baseline gap-3'>
                      <span className='w-4 text-[13px] font-semibold text-[#F9BBC4] sm:text-[14px]' style={DIN}>
                        {pad(idx + 1)}
                      </span>
                      <h3
                        className='flex-1 text-[16px] font-semibold uppercase tracking-[0.08em] sm:text-[19px]'
                        style={DIN}
                      >
                        {s.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[12px] font-semibold tracking-[0.12em] ${done ? 'text-[#F9BBC4]' : 'text-[#F7CBCB]'}`}
                        style={DIN}
                      >
                        {done && <Check className='h-3.5 w-3.5' />}
                        {items.length}/{s.min === s.max ? s.max : `${s.min}+`}
                      </span>
                    </div>
                    <p className='mt-1 pl-7 text-[12px] leading-snug text-[#F7CBCB] sm:text-[13px]'>{s.hint}</p>

                    {s.group === 'sheet' && (
                      <a
                        href={PRACTICE_PDF}
                        download
                        className='ml-7 mt-3 inline-flex items-center gap-2 bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#F9BBC4] sm:text-[13px]'
                        style={DIN}
                      >
                        <Download className='h-3.5 w-3.5' /> Descargar hoja de prácticas
                      </a>
                    )}

                    <div className='mt-3 grid grid-cols-3 gap-2 pl-7 sm:grid-cols-4 sm:gap-2.5'>
                      {items.map((img) => (
                        <div
                          key={img.key}
                          className='group relative aspect-square overflow-hidden bg-white/5 ring-1 ring-white/15'
                        >
                          <a href={img.url} target='_blank' rel='noopener noreferrer'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt=''
                              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                            />
                          </a>
                          {editable && (
                            <button
                              type='button'
                              aria-label='Quitar imagen'
                              disabled={busy !== null}
                              onClick={() =>
                                void save({ ...material, [s.group]: items.filter((i) => i.key !== img.key) })
                              }
                              className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-[#F9BBC4] hover:text-black'
                            >
                              <X className='h-3.5 w-3.5' />
                            </button>
                          )}
                        </div>
                      ))}
                      {canAdd && (
                        <label className='flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-[#F7CBCB]/60 text-[#F7CBCB] transition-colors hover:border-[#F9BBC4] hover:text-[#F9BBC4]'>
                          {busy === s.group ? (
                            <Loader2 className='h-5 w-5 animate-spin' />
                          ) : (
                            <>
                              <ImagePlus className='h-5 w-5' />
                              <span className='text-[11px] font-semibold uppercase tracking-[0.16em]' style={DIN}>
                                Subir
                              </span>
                            </>
                          )}
                          <input
                            type='file'
                            accept='image/png,image/jpeg,image/webp'
                            multiple
                            className='sr-only'
                            disabled={busy !== null}
                            onChange={(e) => {
                              void upload(s.group, s.max, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {isReference && editable && !material.notStaff && (
                      <p className='ml-7 mt-2 inline-block bg-[#F9BBC4] px-2.5 py-1 text-[11px] font-medium text-black'>
                        ↑ Marcá la confirmación de arriba para subir.
                      </p>
                    )}
                  </section>
                );
              })}
            </div>

            <button
              type='button'
              onClick={close}
              className='mt-10 bg-white px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#F9BBC4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BBC4] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-[14px]'
              style={DIN}
            >
              {complete ? 'Listo' : 'Guardar y seguir después'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
