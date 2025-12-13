'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getCategories,
  getPresencialPolls,
  createPresencialPoll,
  closePresencialPoll,
  getPresencialPollVotes,
} from '@/lib/api-client';
import {
  allowedDay,
  allowedTime,
  PresencialPoll,
  PresencialPollOption,
  PresencialVote,
} from '@/lib/presenciales';
import { DateTime } from 'luxon';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const storage = JSON.parse(
      localStorage.getItem('auth-token-storage') || '{}'
    );
    return storage.state?.token || null;
  } catch {
    return null;
  }
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

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

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [polls, setPolls] = useState<PresencialPoll[]>([]);
  const [votes, setVotes] = useState<PresencialVote[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollDeadline, setNewPollDeadline] = useState<string>(''); // YYYY-MM-DD (zona GMT-3)
  const [optDate, setOptDate] = useState<string>('');
  const [optTime, setOptTime] = useState<string>('10:00');
  const [newOptions, setNewOptions] = useState<PresencialPollOption[]>([]);
  // Elegibilidad específica de la nueva encuesta
  const [newPollEligibleCourseIds, setNewPollEligibleCourseIds] = useState<string[]>([]);
  const [newPollUserOverrideAllowed, setNewPollUserOverrideAllowed] = useState(true);
  const [newPollUserOverrides, setNewPollUserOverrides] = useState<Array<{ userId?: string; email?: string; allowed: boolean }>>([]);
  
  // Estados para búsqueda de usuarios
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Buscar usuarios con el endpoint
  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setFoundUsers([]);
      setShowUserDropdown(false);
      return;
    }

    try {
      setSearchingUsers(true);
      const token = getAuthToken();
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');
      params.append('search', searchTerm.trim());

      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error('Error al buscar usuarios');

      const responseData = await response.json();
      const usersData = responseData.data?.data || responseData.data || [];
      setFoundUsers(Array.isArray(usersData) ? usersData : []);
      setShowUserDropdown(true);
    } catch (error) {
      setFoundUsers([]);
      setShowUserDropdown(false);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  // Debounce para búsqueda de usuarios
  useEffect(() => {
    if (!userSearchTerm.trim() || userSearchTerm.trim().length < 2) {
      setFoundUsers([]);
      setShowUserDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchUsers(userSearchTerm);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchTerm, searchUsers]);

  useEffect(() => {
    setLoadingCourses(true);
    getCategories({ isActive: true })
      .then((resp) => setCourses(resp.data.data))
      .finally(() => setLoadingCourses(false));
  }, []);

  const loadPollsData = useCallback(async () => {
    try {
      setLoadingPolls(true);
      const response = await getPresencialPolls();
      setPolls(response.data);
    } catch (error) {
      console.error('Error loading polls:', error);
      setPolls([]);
    } finally {
      setLoadingPolls(false);
    }
  }, []);

  const loadVotesForPoll = useCallback(async (pollId: string) => {
    try {
      const response = await getPresencialPollVotes(pollId);
      return response.data;
    } catch (error) {
      console.error('Error loading votes:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadPollsData();
    const interval = setInterval(() => {
      loadPollsData();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadPollsData]);


  const addOption = (date: string, time: string) => {
    const valid = allowedDay(date) && allowedTime(time);
    const opt: PresencialPollOption = {
      id: uid('opt'),
      date,
      start_time: time,
      duration_minutes: 120, // Duración fija de 120 minutos
    };
    setNewOptions((prev) =>
      valid ? [...prev, opt] : [...prev, { ...opt, id: uid('opt_invalid') }]
    );
  };

  const removeOption = (id: string) => {
    setNewOptions((prev) => prev.filter((o) => o.id !== id));
  };


  // Agregar usuario seleccionado
  const addUserToOverrides = (user: User) => {
    const override = { userId: user.id, email: user.email, allowed: newPollUserOverrideAllowed };
    
    // Verificar si ya existe
    const exists = newPollUserOverrides.some(
      (o) => o.userId === user.id || o.email?.toLowerCase() === user.email.toLowerCase()
    );
    
    if (!exists) {
      setNewPollUserOverrides([...newPollUserOverrides, override]);
    }
    setUserSearchTerm('');
    setFoundUsers([]);
    setShowUserDropdown(false);
  };

  const removeNewPollUserOverride = (emailOrId: string) => {
    const isEmail = emailOrId.includes('@');
    setNewPollUserOverrides((prev) =>
      prev.filter((o) =>
        isEmail
          ? o.email?.toLowerCase() !== emailOrId.toLowerCase()
          : o.userId !== emailOrId
      )
    );
  };

  const toggleNewPollCourseEligibility = (courseId: string) => {
    setNewPollEligibleCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const createPoll = async () => {
    if (!newPollTitle) return;
    const sanitizedOptions = newOptions.filter(
      (o) => allowedDay(o.date) && allowedTime(o.start_time)
    );
    
    if (sanitizedOptions.length === 0) {
      alert('Debes agregar al menos una opción de horario válida');
      return;
    }

    let deadlineISO: string | undefined = undefined;
    if (newPollDeadline) {
      const dt = DateTime.fromISO(newPollDeadline, {
        zone: 'America/Buenos_Aires',
      }).set({ hour: 23, minute: 59, second: 0, millisecond: 0 });
      deadlineISO = dt.toISO(); // incluye -03:00
    }

    try {
      setIsCreating(true);
      const pollData = {
        title: newPollTitle,
        description: newPollDesc || null,
        deadline_at: deadlineISO || null,
        options: sanitizedOptions.map((o) => ({
          date: o.date,
          start_time: o.start_time,
          duration_minutes: o.duration_minutes,
        })),
        eligibility: {
          courseIds: newPollEligibleCourseIds,
          userOverrides: newPollUserOverrides,
        },
      };

      await createPresencialPoll(pollData);
      await loadPollsData();
      
      // Resetear formulario
      setNewPollTitle('');
      setNewPollDesc('');
      setNewPollDeadline('');
      setOptDate('');
      setOptTime('10:00');
      setNewOptions([]);
      setNewPollEligibleCourseIds([]);
      setNewPollUserOverrides([]);
      setUserSearchTerm('');
    } catch (error: any) {
      console.error('Error creating poll:', error);
      alert(error.message || 'Error al crear la encuesta');
    } finally {
      setIsCreating(false);
    }
  };

  const closePoll = async (id: string) => {
    try {
      await closePresencialPoll(id);
      await loadPollsData();
    } catch (error: any) {
      console.error('Error closing poll:', error);
      alert(error.message || 'Error al cerrar la encuesta');
    }
  };



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

      <div className='grid grid-cols-1 gap-8'>
        <section className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Crear nueva encuesta</h2>
          <p className='text-sm text-gray-600 mb-6'>
            Configura la encuesta, horarios disponibles y quién puede votar. Todo en un solo formulario.
          </p>

          <div className='space-y-6'>
            {/* Información básica */}
            <div className='border-b pb-6'>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>Información de la encuesta</h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium block mb-2'>Título *</label>
                  <input
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder='Ej: Horarios disponibles para marzo'
                    className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium block mb-2'>Descripción</label>
                  <textarea
                    value={newPollDesc}
                    onChange={(e) => setNewPollDesc(e.target.value)}
                    placeholder='Información adicional sobre la encuesta...'
                    rows={3}
                    className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium block mb-2'>Fecha límite para votar</label>
                  <input
                    type='date'
                    value={newPollDeadline}
                    onChange={(e) => setNewPollDeadline(e.target.value)}
                    className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
                  />
                </div>
              </div>
            </div>

            {/* Elegibilidad - Quién puede votar */}
            <div className='border-b pb-6'>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>¿Quién puede votar?</h3>
              <p className='text-xs text-gray-600 mb-4'>
                Selecciona los cursos cuyos compradores (con suscripción activa) pueden votar, o agrega usuarios específicos.
              </p>
              
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium block mb-3'>Cursos habilitados</label>
                  {loadingCourses ? (
                    <p className='text-sm text-gray-600'>Cargando cursos…</p>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {courses.map((c) => {
                        const checked = newPollEligibleCourseIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type='button'
                            onClick={() => toggleNewPollCourseEligibility(c.id)}
                            className={`text-left rounded-lg px-3 py-2 border transition-colors text-sm ${
                              checked
                                ? 'border-[#f9bbc4] bg-[#FBE8EA] text-[#660e1b]'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {newPollEligibleCourseIds.length > 0 && (
                    <p className='text-xs text-gray-600 mt-2'>
                      {newPollEligibleCourseIds.length} curso(s) seleccionado(s). Los compradores con suscripción activa de estos cursos podrán votar.
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium block mb-3'>Usuarios individuales</label>
                  <div className='relative'>
                    <div className='flex gap-2 mb-2'>
                      <div className='flex-1 relative'>
                        <input
                          type='text'
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          onFocus={() => {
                            if (foundUsers.length > 0) setShowUserDropdown(true);
                          }}
                          onBlur={() => {
                            // Delay para permitir click en dropdown
                            setTimeout(() => setShowUserDropdown(false), 200);
                          }}
                          placeholder='Buscar usuario por email o nombre...'
                          className='border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-[#f9bbc4]'
                        />
                        {showUserDropdown && foundUsers.length > 0 && (
                          <div className='absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                            {foundUsers.map((user) => (
                              <button
                                key={user.id}
                                type='button'
                                onClick={() => addUserToOverrides(user)}
                                className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm'
                              >
                                <div className='font-medium'>{user.email}</div>
                                {(user.firstName || user.lastName || user.name) && (
                                  <div className='text-xs text-gray-600'>
                                    {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchingUsers && (
                          <div className='absolute right-3 top-2.5 text-xs text-gray-500'>
                            Buscando...
                          </div>
                        )}
                      </div>
                      <select
                        value={newPollUserOverrideAllowed ? 'true' : 'false'}
                        onChange={(e) => setNewPollUserOverrideAllowed(e.target.value === 'true')}
                        className='border rounded-lg px-3 py-2 text-sm focus:outline-none'
                      >
                        <option value='true'>permitir</option>
                        <option value='false'>bloquear</option>
                      </select>
                    </div>
                    {newPollUserOverrides.length > 0 && (
                      <ul className='mt-2 space-y-2'>
                        {newPollUserOverrides.map((o, idx) => (
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
                              type='button'
                              onClick={() => removeNewPollUserOverride(o.email || o.userId || '')}
                              className='text-xs text-red-600 hover:underline'
                            >
                              quitar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de horarios */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>Opciones de horarios</h3>
              <p className='text-xs text-gray-600 mb-4'>
                Agrega opciones válidas (solo martes–sábado, entre 10:00–17:00 GMT-3).
              </p>
              
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
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
                </div>
                <button
                  type='button'
                  onClick={() => {
                    if (optDate && optTime) {
                      addOption(optDate, optTime);
                      setOptDate('');
                      setOptTime('10:00');
                    }
                  }}
                  className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-4 py-2 rounded-lg text-sm transition-colors'
                >
                  Agregar opción
                </button>
                
                {newOptions.length > 0 && (
                  <ul className='mt-3 space-y-2 text-sm'>
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
                              type='button'
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
                )}
              </div>
            </div>

            {/* Botón crear */}
            <div className='pt-4 border-t'>
              <button
                type='button'
                onClick={createPoll}
                disabled={!newPollTitle || newOptions.length === 0 || isCreating}
                className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors'
              >
                {isCreating ? 'Creando...' : 'Crear encuesta'}
              </button>
            </div>
          </div>

          <div className='mt-8'>
            <h3 className='text-md font-medium'>Encuestas existentes</h3>
            {loadingPolls ? (
              <p className='text-sm text-gray-600 mt-3'>Cargando encuestas...</p>
            ) : (
              <div className='space-y-4 mt-3'>
                {polls.map((p) => (
                  <PollCard
                    key={p.id}
                    poll={p}
                    onClose={closePoll}
                    loadVotes={loadVotesForPoll}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Componente para mostrar cada encuesta
function PollCard({
  poll,
  onClose,
  loadVotes,
}: {
  poll: PresencialPoll;
  onClose: (id: string) => void;
  loadVotes: (pollId: string) => Promise<PresencialVote[]>;
}) {
  const [votes, setVotes] = useState<PresencialVote[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      setLoadingVotes(true);
      const pollVotes = await loadVotes(poll.id);
      setVotes(pollVotes);
      setLoadingVotes(false);
    };
    fetchVotes();
    const interval = setInterval(fetchVotes, 3000);
    return () => clearInterval(interval);
  }, [poll.id, loadVotes]);

  const totals = useMemo(() => {
    const byOpt = new Map<string, number>();
    votes.forEach((v) => {
      byOpt.set(v.option_id, (byOpt.get(v.option_id) || 0) + 1);
    });
    return byOpt;
  }, [votes]);

  return (
    <div className='rounded-xl border bg-white shadow-sm p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-semibold text-gray-900'>{poll.title}</div>
          {poll.deadline_at && (
            <div className='text-xs text-gray-600'>
              Cierra:{' '}
              {DateTime.fromISO(poll.deadline_at)
                .setZone('America/Buenos_Aires')
                .toLocaleString(DateTime.DATETIME_SHORT)}
            </div>
          )}
          <div className='text-xs mt-1'>
            <span
              className={`px-2 py-0.5 rounded-full ${
                poll.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {poll.status}
            </span>
          </div>
        </div>
        {poll.status === 'open' && (
          <button
            onClick={() => onClose(poll.id)}
            className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-3 py-1.5 rounded-lg text-xs transition-colors'
          >
            Cerrar
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
        {poll.options.map((o) => (
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
        {loadingVotes ? (
          <p className='text-xs text-gray-600 mt-2'>Cargando votos...</p>
        ) : votes.length === 0 ? (
          <p className='text-xs text-gray-600 mt-2'>Aún no hay votos</p>
        ) : (
          <ul className='mt-2 space-y-2 text-sm'>
            {votes.map((v) => {
              const opt = poll.options.find((o) => o.id === v.option_id);
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
        )}
      </div>
    </div>
  );
}
        </section>
      </div>
    </div>
  );
}
