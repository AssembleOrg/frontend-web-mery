'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, CheckCircle2, RotateCcw, Clock, GraduationCap, Loader2 } from 'lucide-react';
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
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const total = quiz?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => (quiz ? quiz.questions.filter((q) => typeof answers[q.id] === 'boolean').length : 0),
    [quiz, answers],
  );
  const remaining = total - answeredCount;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hide-rag-widget');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('hide-rag-widget');
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

  const handleRetry = useCallback(() => {
    // Reintento libre: limpiamos respuestas y resultado, sin cerrar la modal.
    setResult(null);
    setAnswers({});
    setLoadError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitCourseQuiz(categoryId, answers);
      setResult(res.data);
      // El banner de resultado aparece arriba: aseguramos que se vea.
      bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className='w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[85dvh] bg-white dark:bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between gap-3 px-5 py-4 bg-[#2B2B2B] text-white'>
          <div className='min-w-0 flex items-center gap-3'>
            <span className='flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center'>
              <GraduationCap className='w-[18px] h-[18px] text-[#EBA2A8]' />
            </span>
            <div className='min-w-0'>
              <div className='text-[10px] uppercase tracking-[0.18em] text-[#EBA2A8] font-medium'>
                Examen final · Verdadero o Falso
              </div>
              <div className='font-semibold truncate leading-tight'>
                {categoryName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label='Cerrar'
            className='p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-6'>
          {loading && (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='w-8 h-8 text-[#EBA2A8] animate-spin' />
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
              <Clock className='w-14 h-14 text-[#EBA2A8] mx-auto mb-4' />
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
            <div className='mb-6 rounded-2xl bg-[#1c1c1e] text-white p-6 text-center'>
              {result.passed ? (
                <>
                  <span className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/15 ring-1 ring-green-500/30 mb-3'>
                    <CheckCircle2 className='w-7 h-7 text-green-400' />
                  </span>
                  <h3 className='text-lg font-bold'>¡Felicitaciones, aprobaste!</h3>
                  <p className='text-sm text-white/60 mt-1.5'>
                    <span className='font-semibold text-white'>
                      {result.correctCount}/{result.totalQuestions}
                    </span>{' '}
                    respuestas correctas. Ya tenés el chat del curso desbloqueado.
                  </p>
                </>
              ) : (
                <>
                  <span className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EBA2A8]/15 ring-1 ring-[#EBA2A8]/30 mb-3'>
                    <RotateCcw className='w-7 h-7 text-[#EBA2A8]' />
                  </span>
                  <h3 className='text-lg font-bold'>Casi. Volvé a intentarlo</h3>
                  <p className='text-sm text-white/60 mt-1.5'>
                    Para aprobar podías errar hasta{' '}
                    <span className='font-semibold text-white'>{result.maxWrong}</span>, y esta
                    vez tuviste más.
                  </p>
                  <p className='text-xs text-white/40 mt-3 max-w-xs mx-auto leading-relaxed'>
                    Repasá el curso con calma y prestá atención a los detalles. Podés rendir el
                    examen las veces que necesites.
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
                {!result && (
                  <div className='rounded-xl border border-border bg-muted/40 px-4 py-3'>
                    <div className='flex items-center justify-between gap-3 text-xs'>
                      <span className='text-muted-foreground'>
                        Podés errar hasta{' '}
                        <strong className='text-foreground'>{quiz.maxWrong}</strong> de{' '}
                        <strong className='text-foreground'>{total}</strong>
                        {quiz.status.attempts > 0 && (
                          <span className='text-muted-foreground'>
                            {' '}· Intento {quiz.status.attempts + 1}
                          </span>
                        )}
                      </span>
                      <span className='font-semibold text-foreground shrink-0'>
                        {answeredCount}/{total}
                      </span>
                    </div>
                    <div className='mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-[#EBA2A8] transition-all duration-300'
                        style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
                {quiz.questions.map((q, idx) => {
                  const answered = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className='p-4 rounded-xl border border-border bg-white dark:bg-card transition-colors'
                    >
                      <div className='flex items-start gap-2'>
                        <span className='flex-shrink-0 w-6 h-6 rounded-full bg-[#2B2B2B] text-white text-xs font-semibold flex items-center justify-center mt-0.5'>
                          {idx + 1}
                        </span>
                        <p className='text-sm text-foreground flex-1'>
                          {q.text}
                        </p>
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
                            className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                              answered === value
                                ? 'border-[#EBA2A8] bg-[#EBA2A8]/15 text-[#2B2B2B] dark:text-[#EBA2A8]'
                                : 'border-border text-muted-foreground hover:border-[#EBA2A8]'
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
            <div className='px-4 py-3 border-t border-border bg-white dark:bg-background pb-[calc(0.75rem+env(safe-area-inset-bottom))]'>
              {result ? (
                <div className='flex flex-col sm:flex-row gap-2'>
                  {!result.passed && result.canRetry && (
                    <button
                      onClick={handleRetry}
                      className='flex-1 py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] font-semibold text-sm transition-colors'
                    >
                      Volver a rendir
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className='flex-1 py-2.5 rounded-lg border border-border text-foreground hover:border-[#EBA2A8] font-medium text-sm transition-colors'
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className='w-full py-2.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors flex items-center justify-center gap-2'
                >
                  {submitting && <Loader2 className='w-4 h-4 animate-spin' />}
                  {allAnswered
                    ? 'Enviar respuestas'
                    : `Te falta${remaining === 1 ? '' : 'n'} ${remaining} pregunta${remaining === 1 ? '' : 's'}`}
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
