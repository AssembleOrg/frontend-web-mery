'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserCourses } from '@/hooks/useUserCourses';
import {
  getPresencialPolls,
  votePresencialPoll,
} from '@/lib/api-client';
import {
  allowedDay,
  allowedTime,
  generateTimeSlots,
  PresencialPoll,
  PresencialVote,
} from '@/lib/presenciales';
import { DateTime } from 'luxon';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function PresencialesPage() {
  const { user, isAuthenticated } = useAuth();
  const { courses } = useUserCourses();
  const [polls, setPolls] = useState<PresencialPoll[]>([]);
  const [myVotes, setMyVotes] = useState<PresencialVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const loadPollsData = async () => {
    try {
      const response = await getPresencialPolls();
      setPolls(response.data);
    } catch (error: any) {
      console.error('Error loading polls:', error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPollsData();
      const interval = setInterval(loadPollsData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Verificar si el usuario puede votar en una encuesta específica
  const canVoteInPoll = useMemo(() => {
    return (poll: PresencialPoll): boolean => {
      if (!user || !courses) return false;

      // La elegibilidad siempre debe existir
      if (!poll.eligibility) return false;

      // Verificar acceso por cursos (suscripción activa, no vencida)
      const ownedIds = new Set(courses.map((c) => c.courseId));
      const hasCourseAccess = poll.eligibility.courseIds.some((id) => ownedIds.has(id));

      // Verificar acceso por usuario individual
      const isUserOverrideAllowed = poll.eligibility.userOverrides.some(
        (o) =>
          o.allowed === true &&
          ((o.userId && o.userId === user.id) ||
            (o.email && o.email.toLowerCase() === user.email?.toLowerCase()))
      );

      return hasCourseAccess || isUserOverrideAllowed;
    };
  }, [user, courses]);

  // Verificar acceso general (si hay al menos una encuesta donde pueda votar)
  const allowed = useMemo(() => {
    if (!isAuthenticated || !user || !courses) return false;
    return polls.some((poll) => poll.status === 'open' && canVoteInPoll(poll));
  }, [isAuthenticated, user, courses, polls, canVoteInPoll]);

  // Cargar mis votos desde las encuestas
  useEffect(() => {
    if (!user || !polls.length) {
      setMyVotes([]);
      return;
    }

    const userVotes: PresencialVote[] = [];
    polls.forEach((poll) => {
      // Los votos se obtendrán del backend cuando se vote
      // Por ahora, solo actualizamos cuando votamos
    });
    setMyVotes(userVotes);
  }, [user, polls]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || voting === pollId) return;

    try {
      setVoting(pollId);
      await votePresencialPoll(pollId, optionId);
      // Recargar encuestas para obtener los votos actualizados
      await loadPollsData();
    } catch (error: any) {
      console.error('Error voting:', error);
      alert(error.message || 'Error al votar. Verifica que tengas permiso para votar en esta encuesta.');
    } finally {
      setVoting(null);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <main className='container mx-auto px-4 py-10 max-w-7xl'>
        <h1 className='text-2xl font-primary font-semibold mb-4'>Presenciales</h1>
        {!isAuthenticated ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground mb-4'>
              Debes iniciar sesión para acceder a las clases presenciales.
            </p>
          </div>
        ) : loading ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>Cargando encuestas...</p>
          </div>
        ) : !allowed ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground mb-4'>
              No tienes acceso a las clases presenciales en este momento.
            </p>
            <p className='text-sm text-muted-foreground'>
              Necesitas tener una suscripción activa en alguno de los cursos habilitados o ser agregado manualmente por un administrador.
            </p>
          </div>
        ) : (
          <>
            <p className='text-sm text-muted-foreground mb-6'>
              Selecciona un horario disponible. Los días permitidos son de martes a
              sábado y los horarios entre 10:00 y 17:00.
            </p>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-6'>
                {polls
                  .filter((p) => p.status === 'open')
                  .map((poll) => {
                    const canVote = canVoteInPoll(poll);
                    return (
                      <div
                        key={poll.id}
                        className='border rounded-lg p-4 bg-card'
                      >
                        <h2 className='text-lg font-medium'>{poll.title}</h2>
                        {poll.description && (
                          <p className='text-sm text-muted-foreground mt-1'>
                            {poll.description}
                          </p>
                        )}
                        {poll.deadline_at && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            Cierra:{' '}
                            {DateTime.fromISO(poll.deadline_at)
                              .setZone('America/Buenos_Aires')
                              .toLocaleString(DateTime.DATETIME_SHORT)}
                          </p>
                        )}
                        {!canVote && (
                          <p className='text-xs text-red-600 mt-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded'>
                            No tienes permiso para votar en esta encuesta.
                          </p>
                        )}

                        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
                          {poll.options.map((opt) => {
                            const dateLabel = DateTime.fromISO(opt.date)
                              .setZone('America/Buenos_Aires')
                              .toLocaleString(DateTime.DATE_MED);
                            const valid =
                              allowedDay(opt.date, 'America/Buenos_Aires') &&
                              allowedTime(opt.start_time);
                            const canVoteThis = canVote && valid;
                            const isVoting = voting === poll.id;
                            return (
                              <button
                                key={opt.id}
                                disabled={!canVoteThis || isVoting}
                                onClick={() => handleVote(poll.id, opt.id)}
                                className={`text-left border rounded-md p-3 transition-colors ${
                                  'hover:bg-muted'
                                } ${!canVoteThis || isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className='font-medium'>
                                  {dateLabel} • {opt.start_time}h
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  Duración: {opt.duration_minutes} min
                                </div>
                                {!valid && (
                                  <div className='text-xs text-red-600 mt-1'>
                                    Opción fuera de reglas (día u horario)
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                {polls.filter((p) => p.status === 'open').length === 0 && (
                  <div className='text-sm text-muted-foreground'>
                    No hay encuestas abiertas por el momento.
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div className='border rounded-lg p-4 bg-card'>
                  <h3 className='text-md font-medium'>Información</h3>
                  <p className='text-sm text-muted-foreground mt-2'>
                    Selecciona un horario disponible para votar. Puedes cambiar tu voto en cualquier momento antes de que cierre la encuesta.
                  </p>
                </div>

                <div className='border rounded-lg p-4 bg-card'>
                  <h3 className='text-md font-medium'>Explorar horarios</h3>
                  <p className='text-xs text-muted-foreground'>
                    Selector de hora permitido (10:00–17:00, 24h).
                  </p>
                  <div className='mt-3 grid grid-cols-4 gap-2'>
                    {timeSlots.map((t) => (
                      <div
                        key={t}
                        className='text-xs border rounded px-2 py-1 text-center'
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
