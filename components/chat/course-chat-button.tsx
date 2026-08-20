'use client';

import { MessageCircle, Lock, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi, type ChatRoom, type EligibilityInfo } from '@/lib/chat-api';
import { CourseChatModal } from './course-chat-modal';
import { CourseQuizModal } from '@/components/quiz/course-quiz-modal';
import { MentorshipGate } from '@/components/mentorship/mentorship-gate';
import { useAuthStore } from '@/stores/auth-store';

interface Props {
  categoryId: string;
  categoryName: string;
}

export function CourseChatButton({ categoryId, categoryName }: Readonly<Props>) {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [info, setInfo] = useState<EligibilityInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const cancelledRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  const fetchEligibility = useCallback(
    async (withSpinner: boolean) => {
      if (withSpinner) setLoading(true);
      try {
        const { room: nextRoom, computed } = await chatApi.myRoomForCategory(
          categoryId,
        );
        if (cancelledRef.current) return;
        // Solo updatear si algo cambió realmente — evita re-renders innecesarios
        // que podrían cascadear a la modal.
        setRoom((prev) => {
          if (
            prev &&
            prev.id === nextRoom.id &&
            prev.status === nextRoom.status &&
            prev.unlockedAt === nextRoom.unlockedAt &&
            prev.expiresAt === nextRoom.expiresAt &&
            prev.blocked === nextRoom.blocked
          ) {
            return prev;
          }
          return nextRoom;
        });
        setInfo((prev) => {
          if (
            prev &&
            prev.status === computed.status &&
            prev.videosCompleted === computed.videosCompleted &&
            prev.videosTotal === computed.videosTotal &&
            prev.progressPercent === computed.progressPercent &&
            prev.quizPassed === computed.quizPassed &&
            prev.quizRequired === computed.quizRequired &&
            prev.mentorshipCompleted === computed.mentorshipCompleted &&
            prev.mentorshipRequired === computed.mentorshipRequired
          ) {
            return prev;
          }
          return computed;
        });
        setError(null);
      } catch (err) {
        if (!cancelledRef.current) setError((err as Error).message);
      } finally {
        if (!cancelledRef.current && withSpinner) setLoading(false);
      }
    },
    [categoryId],
  );

  useEffect(() => {
    cancelledRef.current = false;
    void fetchEligibility(true);

    // No refetch mientras la modal está abierta: el usuario ya está chateando,
    // no tiene sentido volver a chequear elegibilidad y dispara re-renders
    // de la modal que pueden cascadear.
    const onFocus = () => {
      if (!openRef.current) void fetchEligibility(false);
    };
    const onVisibility = () => {
      if (!openRef.current && document.visibilityState === 'visible') {
        void fetchEligibility(false);
      }
    };
    globalThis.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelledRef.current = true;
      globalThis.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchEligibility]);

  const handleClose = useCallback(() => setOpen(false), []);

  if (loading) {
    return (
      <button
        disabled
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm opacity-60'
      >
        <MessageCircle className='w-4 h-4' />
        Cargando chat…
      </button>
    );
  }

  if (error || !room || !info) {
    return null;
  }

  const locked = room.status === 'LOCKED';
  const closed = room.status === 'CLOSED';

  if (closed) {
    return (
      <div className='mt-3 text-xs text-muted-foreground text-center'>
        Chat cerrado (período de 90 días post-expiración finalizado).
      </div>
    );
  }

  if (locked) {
    const remaining = Math.max(
      0,
      info.videosTotal - info.videosCompleted,
    );
    const videosDone = info.videosTotal > 0 && remaining === 0;
    const quizPending = info.quizRequired && !info.quizPassed;

    // Videos completos pero examen final pendiente → CTA para rendirlo
    if (videosDone && quizPending) {
      return (
        <>
          <button
            onClick={() => setQuizOpen(true)}
            className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] text-sm font-primary font-medium transition-colors'
          >
            <GraduationCap className='w-4 h-4 text-[#EBA2A8]' />
            Realizar examen final
          </button>
          {quizOpen && (
            <CourseQuizModal
              categoryId={categoryId}
              categoryName={categoryName}
              onClose={() => {
                setQuizOpen(false);
                void fetchEligibility(false);
              }}
              onPassed={() => void fetchEligibility(false)}
            />
          )}
        </>
      );
    }

    // Videos + examen listos, falta la mentoría → gate de reserva de mentoría.
    if (
      videosDone &&
      !quizPending &&
      info.mentorshipRequired &&
      !info.mentorshipCompleted
    ) {
      return (
        <MentorshipGate
          categoryId={categoryId}
          categoryName={categoryName}
          defaultEmail={user?.email ?? ''}
          onChanged={() => void fetchEligibility(false)}
        />
      );
    }

    return (
      <button
        disabled
        title={`Completá todos los videos del curso (95% o más)${quizPending ? ' y aprobá el examen final' : ''} para desbloquear el chat`}
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm cursor-not-allowed'
      >
        <Lock className='w-4 h-4' />
        <span>
          Chat bloqueado · faltan {remaining} video
          {remaining === 1 ? '' : 's'}
          {quizPending ? ' + examen final' : ''}
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] text-sm font-primary font-medium transition-colors'
      >
        <MessageCircle className='w-4 h-4 text-[#EBA2A8]' />
        {room.blocked || room.status === 'CLOSED' ? 'Ver conversación' : 'Entrar al chat'}
      </button>
      {room.blocked && (
        <p className='mt-2 text-[11px] text-center text-muted-foreground'>
          Este chat fue bloqueado: queda solo lectura.
        </p>
      )}
      {!room.blocked && room.status === 'CLOSED' && (
        <p className='mt-2 text-[11px] text-center text-muted-foreground'>
          Esta conversación se cerró: queda solo lectura.
        </p>
      )}
      {open && (
        <CourseChatModal
          room={room}
          title={categoryName}
          onClose={handleClose}
        />
      )}
    </>
  );
}
