'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserCourses } from '@/hooks/useUserCourses';
import {
  allowedDay,
  allowedTime,
  generateTimeSlots,
  loadEligibility,
  loadPolls,
  loadVotes,
  saveVotes,
  PresencialPoll,
  PresencialVote,
} from '@/lib/presenciales';
import { DateTime } from 'luxon';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function PresencialesPage() {
  const { user } = useAuth();
  const { courses } = useUserCourses();
  const [polls, setPolls] = useState<PresencialPoll[]>([]);
  const [votes, setVotes] = useState<PresencialVote[]>([]);

  useEffect(() => {
    setPolls(loadPolls());
    setVotes(loadVotes());
    const interval = setInterval(() => {
      setPolls(loadPolls());
      setVotes(loadVotes());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const eligibility = useMemo(() => loadEligibility(), []);

  const hasCourseAccess = useMemo(() => {
    if (!courses || !eligibility) return false;
    const ownedIds = new Set(courses.map((c) => c.courseId));
    return eligibility.courseIds.some((id) => ownedIds.has(id));
  }, [courses, eligibility]);

  const isUserOverrideAllowed = useMemo(() => {
    if (!user) return false;
    return (
      eligibility.userOverrides.find(
        (o) =>
          (o.userId && o.userId === user.id) ||
          (o.email && o.email.toLowerCase() === user.email?.toLowerCase())
      )?.allowed === true
    );
  }, [user, eligibility]);

  const allowed = hasCourseAccess || isUserOverrideAllowed;

  const myVotes = useMemo(() => {
    if (!user) return [];
    return votes.filter((v) => v.user_id === user.id);
  }, [votes, user]);

  const handleVote = (pollId: string, optionId: string) => {
    if (!user) return;
    const existing = loadVotes();
    const now = new Date().toISOString();
    const idx = existing.findIndex(
      (v) => v.poll_id === pollId && v.user_id === user.id
    );
    if (idx >= 0) {
      existing[idx] = {
        ...existing[idx],
        option_id: optionId,
        voted_at: now,
      };
    } else {
      existing.push({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
        user_name: user.name,
        voted_at: now,
      });
    }
    saveVotes(existing);
    setVotes(existing);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <main className='container mx-auto px-4 py-10 max-w-7xl'>
        <h1 className='text-2xl font-primary font-semibold mb-4'>Presenciales</h1>
        {!allowed ? (
          <p className='text-muted-foreground'>
            No tienes acceso a las clases presenciales en este momento.
          </p>
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
                  .map((poll) => (
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

                      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {poll.options.map((opt) => {
                          const dateLabel = DateTime.fromISO(opt.date)
                            .setZone('America/Buenos_Aires')
                            .toLocaleString(DateTime.DATE_MED);
                          const valid =
                            allowedDay(opt.date, 'America/Buenos_Aires') &&
                            allowedTime(opt.start_time);
                          const isMine =
                            myVotes.find(
                              (v) =>
                                v.poll_id === poll.id && v.option_id === opt.id
                            ) !== undefined;
                          return (
                            <button
                              key={opt.id}
                              disabled={!valid}
                              onClick={() => handleVote(poll.id, opt.id)}
                              className={`text-left border rounded-md p-3 transition-colors ${
                                isMine
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted'
                              } ${!valid ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  ))}
                {polls.filter((p) => p.status === 'open').length === 0 && (
                  <div className='text-sm text-muted-foreground'>
                    No hay encuestas abiertas por el momento.
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div className='border rounded-lg p-4 bg-card'>
                  <h3 className='text-md font-medium'>Mis votos</h3>
                  {myVotes.length === 0 ? (
                    <p className='text-sm text-muted-foreground mt-2'>
                      Aún no has votado.
                    </p>
                  ) : (
                    <ul className='mt-2 space-y-2 text-sm'>
                      {myVotes.map((v) => {
                        const poll = polls.find((p) => p.id === v.poll_id);
                        const opt = poll?.options.find((o) => o.id === v.option_id);
                        const label =
                          opt &&
                          `${DateTime.fromISO(opt.date)
                            .setZone('America/Buenos_Aires')
                            .toLocaleString(DateTime.DATE_MED)} • ${opt.start_time}h`;
                        return (
                          <li
                            key={`${v.poll_id}_${v.option_id}`}
                            className='flex items-center justify-between'
                          >
                            <span>{poll?.title || v.poll_id}</span>
                            <span className='text-muted-foreground'>{label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
