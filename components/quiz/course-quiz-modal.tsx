'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, GraduationCap, Loader2 } from 'lucide-react';
import {
  getCourseQuiz,
  submitCourseQuiz,
  type QuizInfo,
  type QuizAttemptResult,
} from '@/lib/api-client';

interface Props {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  /** Se llama cuando el alumno aprueba el examen (para refrescar el estado del chat). */
  onPassed?: () => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CourseQuizModal({
  categoryId,
  categoryName,
  onClose,
  onPassed,
}: Readonly<Props>) {
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCourseQuiz(categoryId);
        if (!cancelled) setQuiz(res.data);
      } catch {
        if (!cancelled) setLoadError('No pudimos cargar el examen. Probá de nuevo más tarde.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const allAnswered = useMemo(
    () =>
      !!quiz &&
      quiz.questions.every((q) => typeof answers[q.id] === 'boolean'),
    [quiz, answers],
  );

  const wrongIds = useMemo(
    () => new Set(result?.wrongQuestionIds ?? []),
    [result],
  );

  const handleSubmit = useCallback(async () => {
    if (!quiz || !allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitCourseQuiz(categoryId, answers);
      setResult(res.data);
      if (res.data.passed) onPassed?.();
    } catch (err) {
      setLoadError(
        (err as Error).message || 'No pudimos enviar tus respuestas.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [quiz, allAnswered, submitting, categoryId, answers, onPassed]);

  // Cooldown activo sin intento nuevo posible
  const cooldownUntil =
    !result && quiz?.status && !quiz.status.passed && !quiz.status.canAttempt
      ? quiz.status.nextAttemptAt
      : null;

  const alreadyPassed = !result && quiz?.status.passed;

  return (
    <div className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4'>
      <div className='w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-[#f9bbc4]/20'>
          <div className='min-w-0 flex items-center gap-2'>
            <GraduationCap className='w-5 h-5 text-[#660e1b] dark:text-[#f9bbc4] flex-shrink-0' />
            <div className='min-w-0'>
              <div className='text-xs uppercase tracking-wider text-[#660e1b] dark:text-[#f9bbc4]'>
                Examen final · Verdadero o Falso
              </div>
              <div className='font-bold text-foreground truncate'>
                {categoryName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label='Cerrar'
            className='p-2 rounded-full hover:bg-white/60 dark:hover:bg-card transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6'>
          {loading && (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='w-8 h-8 text-[#f9bbc4] animate-spin' />
            </div>
          )}

          {!loading && loadError && (
            <div className='text-center py-12 text-sm text-red-600'>
              {loadError}
            </div>
          )}

          {!loading && !loadError && quiz && !quiz.required && (
            <div className='text-center py-12 text-sm text-muted-foreground'>
              Este curso no tiene examen final.
            </div>
          )}

          {!loading && !loadError && alreadyPassed && (
            <div className='text-center py-12'>
              <CheckCircle2 className='w-14 h-14 text-green-500 mx-auto mb-4' />
              <h3 className='text-lg font-bold text-foreground mb-1'>
                ¡Examen aprobado!
              </h3>
              <p className='text-sm text-muted-foreground'>
                Ya completaste el examen final de este curso.
              </p>
            </div>
          )}

          {!loading && !loadError && cooldownUntil && (
            <div className='text-center py-12 max-w-md mx-auto'>
              <Clock className='w-14 h-14 text-[#f9bbc4] mx-auto mb-4' />
              <h3 className='text-lg font-bold text-foreground mb-2'>
                Todavía no podés reintentar
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Podés volver a rendir el examen a partir del{' '}
                <span className='font-medium text-foreground'>
                  {formatDateTime(cooldownUntil)}
                </span>
                .
              </p>
              <p className='text-sm text-muted-foreground'>
                Mientras tanto, te recomendamos volver a ver el curso y prestar
                atención a los detalles.
              </p>
            </div>
          )}

          {/* Resultado del intento recién enviado */}
          {result && (
            <div
              className={`mb-6 p-4 rounded-xl border text-center ${
                result.passed
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
                  : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
              }`}
            >
              {result.passed ? (
                <>
                  <CheckCircle2 className='w-10 h-10 text-green-500 mx-auto mb-2' />
                  <h3 className='font-bold text-foreground'>
                    ¡Felicitaciones, aprobaste!
                  </h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {result.correctCount} de {result.totalQuestions} respuestas
                    correctas. Ya tenés el chat del curso desbloqueado.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className='w-10 h-10 text-red-500 mx-auto mb-2' />
                  <h3 className='font-bold text-foreground'>
                    No alcanzaste el puntaje necesario
                  </h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {result.correctCount} de {result.totalQuestions} respuestas
                    correctas. Las preguntas incorrectas están marcadas abajo.
                  </p>
                  <p className='text-sm text-muted-foreground mt-2'>
                    Podés reintentar en 24 horas
                    {result.nextAttemptAt
                      ? ` (a partir del ${formatDateTime(result.nextAttemptAt)})`
                      : ''}
                    . Te recomendamos volver a ver el curso y prestar atención a
                    los detalles.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Preguntas */}
          {!loading &&
            !loadError &&
            quiz?.required &&
            !alreadyPassed &&
            !cooldownUntil && (
              <div className='space-y-5'>
                {quiz.questions.map((q, idx) => {
                  const isWrong = !!result && wrongIds.has(q.id);
                  const answered = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        isWrong
                          ? 'border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900'
                          : 'border-border bg-white dark:bg-card'
                      }`}
                    >
                      <div className='flex items-start gap-2'>
                        <span className='flex-shrink-0 w-6 h-6 rounded-full bg-[#f9bbc4]/30 text-[#660e1b] dark:text-[#f9bbc4] text-xs font-bold flex items-center justify-center mt-0.5'>
                          {idx + 1}
                        </span>
                        <p className='text-sm text-foreground flex-1'>
                          {q.text}
                        </p>
                        {isWrong && (
                          <XCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                        )}
                      </div>
                      <div className='flex gap-2 mt-3 ml-8'>
                        {([true, false] as const).map((value) => (
                          <button
                            key={String(value)}
                            type='button'
                            disabled={!!result || submitting}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: value }))
                            }
                            className={`px-5 py-1.5 rounded-full border-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                              answered === value
                                ? 'border-[#f9bbc4] bg-[#f9bbc4] text-[#660e1b]'
                                : 'border-border text-muted-foreground hover:border-[#f9bbc4]'
                            }`}
                          >
                            {value ? 'Verdadero' : 'Falso'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Footer */}
        {!loading &&
          !loadError &&
          quiz?.required &&
          !alreadyPassed &&
          !cooldownUntil && (
            <div className='px-4 py-3 border-t border-border bg-white dark:bg-background'>
              {result ? (
                <button
                  onClick={onClose}
                  className='w-full py-2.5 rounded-lg border-2 border-[#f9bbc4] text-[#660e1b] dark:text-[#f9bbc4] hover:bg-[#f9bbc4] hover:text-white font-medium text-sm transition-colors'
                >
                  Cerrar
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className='w-full py-2.5 rounded-lg bg-[#f9bbc4] text-[#660e1b] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2'
                >
                  {submitting && <Loader2 className='w-4 h-4 animate-spin' />}
                  {allAnswered
                    ? 'Enviar respuestas'
                    : 'Respondé todas las preguntas'}
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
