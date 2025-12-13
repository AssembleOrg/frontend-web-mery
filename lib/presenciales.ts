import { DateTime } from 'luxon';

export type PresencialEligibility = {
  courseIds: string[];
  userOverrides: Array<{ userId?: string; email?: string; allowed: boolean }>;
};

export type PresencialPollOption = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  duration_minutes: number;
};

export type PresencialPoll = {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'open' | 'closed';
  deadline_at?: string;
  options: PresencialPollOption[];
  created_at: string;
  // Elegibilidad específica de esta encuesta
  eligibility: {
    courseIds: string[]; // Cursos cuyos compradores (con suscripción activa) pueden votar
    userOverrides: Array<{ userId?: string; email?: string; allowed: boolean }>; // Usuarios individuales
  };
};

export type PresencialVote = {
  poll_id: string;
  option_id: string;
  user_id: string;
  user_name?: string;
  voted_at: string;
};

const ELIGIBILITY_KEY = 'presenciales:eligibility';
const POLLS_KEY = 'presenciales:polls';
const VOTES_KEY = 'presenciales:votes';

export function loadEligibility(): PresencialEligibility {
  if (typeof window === 'undefined') return { courseIds: [], userOverrides: [] };
  try {
    const raw = localStorage.getItem(ELIGIBILITY_KEY);
    if (!raw) return { courseIds: [], userOverrides: [] };
    const parsed = JSON.parse(raw);
    return {
      courseIds: Array.isArray(parsed.courseIds) ? parsed.courseIds : [],
      userOverrides: Array.isArray(parsed.userOverrides)
        ? parsed.userOverrides
        : [],
    };
  } catch {
    return { courseIds: [], userOverrides: [] };
  }
}

export function saveEligibility(e: PresencialEligibility) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ELIGIBILITY_KEY, JSON.stringify(e));
}

export function loadPolls(): PresencialPoll[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(POLLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePolls(polls: PresencialPoll[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
}

export function loadVotes(): PresencialVote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVotes(votes: PresencialVote[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function allowedDay(dateISO: string, tz?: string): boolean {
  const dt = tz
    ? DateTime.fromISO(dateISO, { zone: tz })
    : DateTime.fromISO(dateISO);
  const dow = dt.weekday; // 1=Mon .. 7=Sun
  return dow >= 2 && dow <= 6; // Tue..Sat
}

export function allowedTime(time: string): boolean {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  if (isNaN(h) || isNaN(m)) return false;
  return h >= 10 && h <= 17 && m >= 0 && m <= 59;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 10; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
