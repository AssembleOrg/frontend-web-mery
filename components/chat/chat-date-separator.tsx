'use client';

import { DateTime } from 'luxon';

interface ChatDateSeparatorProps {
  createdAt: string;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ChatDateSeparator({ createdAt }: ChatDateSeparatorProps) {
  const dt = DateTime.fromISO(createdAt).setLocale('es');
  const now = DateTime.now().setLocale('es');

  const isToday = dt.hasSame(now, 'day');
  const isYesterday = dt.hasSame(now.minus({ days: 1 }), 'day');
  const daysDiff = dt.startOf('day').diff(now.startOf('day'), 'days').days;
  const withinWeek = daysDiff >= -7 && daysDiff < 0;

  let label: string;
  if (isToday) label = 'Hoy';
  else if (isYesterday) label = 'Ayer';
  else if (withinWeek) label = capitalize(dt.toFormat('cccc'));
  else label = dt.toFormat("d 'de' LLLL yyyy");

  const fullDateForA11y = dt.toFormat("cccc d 'de' LLLL 'de' yyyy");

  return (
    <div role='separator' aria-label={fullDateForA11y} className='flex justify-center my-2'>
      <span
        className={`text-[11px] px-3 py-1 rounded-full border bg-white shadow-sm ${
          isToday
            ? 'text-[#EBA2A8] border-[#f9bbc4]/60 font-medium'
            : 'text-muted-foreground border-border'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
