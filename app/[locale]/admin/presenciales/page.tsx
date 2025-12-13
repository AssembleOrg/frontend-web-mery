'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCategories } from '@/lib/api-client';
import {
  allowedDay,
  allowedTime,
  loadEligibility,
  saveEligibility,
  loadPolls,
  savePolls,
  loadVotes,
  PresencialPoll,
  PresencialPollOption,
  PresencialVote,
  uid,
} from '@/lib/presenciales';
import { DateTime } from 'luxon';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';

export default function AdminPresencialesPage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, router, locale]);

  const [elig, setElig] = useState(loadEligibility());
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [polls, setPolls] = useState<PresencialPoll[]>([]);
  const [votes, setVotes] = useState<PresencialVote[]>([]);

  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollCourseId, setNewPollCourseId] = useState<string>('');
  const [newPollDeadline, setNewPollDeadline] = useState<string>(''); // YYYY-MM-DD (zona GMT-3)
  const [optDate, setOptDate] = useState<string>('');
  const [optTime, setOptTime] = useState<string>('10:00');
  const [optDuration, setOptDuration] = useState<number>(120);
  const [newOptions, setNewOptions] = useState<PresencialPollOption[]>([]);

  useEffect(() => {
    setLoadingCourses(true);
    getCategories({ isActive: true })
      .then((resp) => setCourses(resp.data.data))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    setPolls(loadPolls());
    setVotes(loadVotes());
    const interval = setInterval(() => {
      setPolls(loadPolls());
      setVotes(loadVotes());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleCourseEligibility = (courseId: string) => {
    const next = { ...elig };
    const exists = next.courseIds.includes(courseId);
    next.courseIds = exists
      ? next.courseIds.filter((id) => id !== courseId)
      : [...next.courseIds, courseId];
    setElig(next);
    saveEligibility(next);
  };

  const addUserOverride = (emailOrId: string, allowed: boolean) => {
    const next = { ...elig };
    const isEmail = emailOrId.includes('@');
    const existingIdx = next.userOverrides.findIndex((u) =>
      isEmail
        ? u.email?.toLowerCase() === emailOrId.toLowerCase()
        : u.userId === emailOrId
    );
    const override = isEmail
      ? { email: emailOrId, allowed }
      : { userId: emailOrId, allowed };
    if (existingIdx >= 0) {
      next.userOverrides[existingIdx] = override as any;
    } else {
      next.userOverrides.push(override as any);
    }
    setElig(next);
    saveEligibility(next);
  };

  const removeUserOverride = (emailOrId: string) => {
    const next = { ...elig };
    const isEmail = emailOrId.includes('@');
    next.userOverrides = next.userOverrides.filter((u) =>
      isEmail
        ? u.email?.toLowerCase() !== emailOrId.toLowerCase()
        : u.userId !== emailOrId
    );
    setElig(next);
    saveEligibility(next);
  };

  const addOption = (date: string, time: string, duration: number) => {
    const valid = allowedDay(date) && allowedTime(time);
    const opt: PresencialPollOption = {
      id: uid('opt'),
      date,
      start_time: time,
      duration_minutes: duration,
    };
    setNewOptions((prev) =>
      valid ? [...prev, opt] : [...prev, { ...opt, id: uid('opt_invalid') }]
    );
  };

  const removeOption = (id: string) => {
    setNewOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const createPoll = () => {
    if (!newPollCourseId || !newPollTitle) return;
    const sanitizedOptions = newOptions.filter(
      (o) => allowedDay(o.date) && allowedTime(o.start_time)
    );
    let deadlineISO: string | undefined = undefined;
    if (newPollDeadline) {
      const dt = DateTime.fromISO(newPollDeadline, {
        zone: 'America/Buenos_Aires',
      }).set({ hour: 23, minute: 59, second: 0, millisecond: 0 });
      deadlineISO = dt.toISO(); // incluye -03:00
    }
    const poll: PresencialPoll = {
      id: uid('poll'),
      course_id: newPollCourseId,
      title: newPollTitle,
      description: newPollDesc || undefined,
      status: 'open',
      deadline_at: deadlineISO || undefined,
      options: sanitizedOptions,
      created_at: new Date().toISOString(),
    };
    const next = [poll, ...loadPolls()];
    savePolls(next);
    setPolls(next);
    setNewPollTitle('');
    setNewPollDesc('');
    setNewPollCourseId('');
    setNewPollDeadline('');
    setOptDate('');
    setOptTime('10:00');
    setOptDuration(120);
    setNewOptions([]);
  };

  const closePoll = (id: string) => {
    const updated = loadPolls().map((p) =>
      p.id === id ? { ...p, status: 'closed' } : p
    );
    savePolls(updated);
    setPolls(updated);
  };

  const totalsForPoll = (pollId: string) => {
    const vs = votes.filter((v) => v.poll_id === pollId);
    const byOpt = new Map<string, number>();
    vs.forEach((v) => {
      byOpt.set(v.option_id, (byOpt.get(v.option_id) || 0) + 1);
    });
    return byOpt;
  };

  const [overrideInput, setOverrideInput] = useState('');
  const [overrideAllowed, setOverrideAllowed] = useState(true);

  if (!user || !isAuthenticated) {
    return null;
  }

  return (
    <div className='space-y-8 font-admin'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Presenciales</h1>
        <p className='mt-2 text-gray-600'>
          Configura elegibilidad y encuestas de horarios con las reglas de día y hora.
        </p>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        <section className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Elegibilidad</h2>
          <p className='text-sm text-gray-600'>
            Selecciona cursos habilitados y usuarios individuales.
          </p>

          <div className='mt-4'>
            <h3 className='text-md font-medium mb-3'>Cursos habilitados</h3>
            {loadingCourses ? (
              <p className='text-sm text-gray-600'>Cargando cursos…</p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {courses.map((c) => {
                  const checked = elig.courseIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCourseEligibility(c.id)}
                      className={`text-left rounded-lg px-4 py-2 border transition-colors ${
                        checked
                          ? 'border-[#f9bbc4] bg-[#FBE8EA] text-[#660e1b]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className='text-sm'>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className='mt-6'>
            <h3 className='text-md font-medium mb-3'>Usuarios individuales</h3>
            <div className='flex gap-2'>
              <input
                value={overrideInput}
                onChange={(e) => setOverrideInput(e.target.value)}
                placeholder='email@dominio.com o userId'
                className='border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
              />
              <select
                value={overrideAllowed ? 'true' : 'false'}
                onChange={(e) => setOverrideAllowed(e.target.value === 'true')}
                className='border rounded-lg px-3 py-2 text-sm focus:outline-none'
              >
                <option value='true'>permitir</option>
                <option value='false'>bloquear</option>
              </select>
              <button
                onClick={() => {
                  if (overrideInput.trim()) {
                    addUserOverride(overrideInput.trim(), overrideAllowed);
                    setOverrideInput('');
                  }
                }}
                className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg text-sm transition-colors'
              >
                Agregar
              </button>
            </div>
            <ul className='mt-3 space-y-2'>
              {elig.userOverrides.map((o, idx) => (
                <li
                  key={idx}
                  className='flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white'
                >
                  <span>
                    {o.email || o.userId}{' '}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        o.allowed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {o.allowed ? 'permitido' : 'bloqueado'}
                    </span>
                  </span>
                  <button
                    onClick={() => removeUserOverride(o.email || o.userId || '')}
                    className='text-xs text-red-600 hover:underline'
                  >
                    quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Encuestas de horarios</h2>
          <p className='text-sm text-gray-600'>
            Crea opciones válidas solo martes–sábado, entre 10:00–17:00 (GMT-3).
          </p>

          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <label className='text-sm font-medium'>Curso</label>
              <select
                value={newPollCourseId}
                onChange={(e) => setNewPollCourseId(e.target.value)}
                className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
              >
                <option value=''>Selecciona curso…</option>
                {courses.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <label className='text-sm font-medium'>Título</label>
              <input
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
                className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
              />
              <label className='text-sm font-medium'>Descripción</label>
              <textarea
                value={newPollDesc}
                onChange={(e) => setNewPollDesc(e.target.value)}
                className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
              />
              <label className='text-sm font-medium'>Fecha límite (día)</label>
              <input
                type='date'
                value={newPollDeadline}
                onChange={(e) => setNewPollDeadline(e.target.value)}
                className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
              />
            </div>

            <div className='space-y-3'>
              <label className='text-sm font-medium'>Agregar opción</label>
              <div className='grid grid-cols-3 gap-2'>
                <input
                  type='date'
                  value={optDate}
                  onChange={(e) => setOptDate(e.target.value)}
                  className='border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                />
                <input
                  type='time'
                  step={1800}
                  min='10:00'
                  max='17:00'
                  value={optTime}
                  onChange={(e) => setOptTime(e.target.value)}
                  className='border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                />
                <input
                  type='number'
                  min={30}
                  max={240}
                  step={30}
                  placeholder='min'
                  value={optDuration}
                  onChange={(e) => setOptDuration(Number(e.target.value))}
                  className='border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9bbc4]'
                />
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => {
                    if (optDate && optTime && optDuration) {
                      addOption(optDate, optTime, optDuration);
                      setOptDate('');
                      setOptTime('10:00');
                      setOptDuration(120);
                    }
                  }}
                  className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg text-sm transition-colors'
                >
                  Agregar opción
                </button>
                <span className='text-xs text-gray-600'>
                  Solo se guardan opciones válidas al crear la encuesta.
                </span>
              </div>
              <ul className='mt-2 space-y-2 text-sm'>
                {newOptions.map((o) => {
                  const valid = allowedDay(o.date) && allowedTime(o.start_time);
                  const labelDate = DateTime.fromISO(o.date)
                    .setZone('America/Buenos_Aires')
                    .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
                  return (
                    <li
                      key={o.id}
                      className='flex items-center justify-between border rounded-lg px-3 py-2 bg-white'
                    >
                      <span>
                        {labelDate} • {o.start_time}h • {o.duration_minutes} min
                      </span>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            valid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {valid ? 'válida' : 'inválida'}
                        </span>
                        <button
                          onClick={() => removeOption(o.id)}
                          className='text-xs text-red-600 hover:underline'
                        >
                          quitar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={createPoll}
                className='mt-2 bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg text-sm transition-colors'
              >
                Crear encuesta
              </button>
            </div>
          </div>

          <div className='mt-8'>
            <h3 className='text-md font-medium'>Encuestas existentes</h3>
            <div className='space-y-4 mt-3'>
              {polls.map((p) => {
                const totals = totalsForPoll(p.id);
                return (
                  <div
                    key={p.id}
                    className='rounded-xl border bg-white shadow-sm p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-lg font-semibold text-gray-900'>{p.title}</div>
                        {p.deadline_at && (
                          <div className='text-xs text-gray-600'>
                            Cierra:{' '}
                            {DateTime.fromISO(p.deadline_at)
                              .setZone('America/Buenos_Aires')
                              .toLocaleString(DateTime.DATETIME_SHORT)}
                          </div>
                        )}
                        <div className='text-xs mt-1'>
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              p.status === 'open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                      {p.status === 'open' && (
                        <button
                          onClick={() => closePoll(p.id)}
                          className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-3 py-1.5 rounded-lg text-xs transition-colors'
                        >
                          Cerrar
                        </button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                      {p.options.map((o) => (
                        <div
                          key={o.id}
                          className='border rounded-lg px-3 py-2 text-sm bg-white'
                        >
                          <div className='font-medium'>
                            {DateTime.fromISO(o.date)
                              .setZone('America/Buenos_Aires')
                              .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}{' '}
                            • {o.start_time}h
                          </div>
                          <div className='text-xs text-gray-600'>
                            Duración: {o.duration_minutes} min
                          </div>
                          <div className='text-xs mt-1'>
                            Votos:{' '}
                            <span className='font-semibold'>
                              {totals.get(o.id) || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='mt-4'>
                      <h4 className='text-sm font-medium text-gray-900'>Quién votó</h4>
                      <ul className='mt-2 space-y-2 text-sm'>
                        {votes
                          .filter((v) => v.poll_id === p.id)
                          .map((v) => {
                            const opt = p.options.find((o) => o.id === v.option_id);
                            return (
                              <li
                                key={`${v.user_id}_${v.option_id}`}
                                className='flex items-center justify-between border rounded-lg px-3 py-2 bg-white'
                              >
                                <span>{v.user_name || v.user_id}</span>
                                <span className='text-gray-600'>
                                  {opt
                                    ? `${DateTime.fromISO(opt.date)
                                        .setZone('America/Buenos_Aires')
                                        .toLocaleString(DateTime.DATE_MED)} • ${opt.start_time}h`
                                    : v.option_id}
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
