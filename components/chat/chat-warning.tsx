'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'chat-warning-seen:';

interface Props {
  roomId: string;
}

export function ChatWarning({ roomId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(STORAGE_PREFIX + roomId);
    if (!seen) setVisible(true);
  }, [roomId]);

  if (!visible) return null;

  return (
    <div className='border-b border-border bg-[#fff4f6] dark:bg-[#3a1f26] px-4 py-3 text-sm text-[#660e1b] dark:text-[#ffd3d9] flex items-start gap-3'>
      <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
      <div className='flex-1'>
        <p className='font-medium mb-1'>Antes de iniciar este chat</p>
        <p className='text-[13px] leading-relaxed'>
          Deberás haber cursado los módulos, visto los videos y leído todo el
          material teórico.
        </p>
      </div>
      <button
        onClick={() => {
          localStorage.setItem(STORAGE_PREFIX + roomId, '1');
          setVisible(false);
        }}
        className='text-xs uppercase tracking-wider font-medium text-[#660e1b] dark:text-[#ffd3d9] hover:underline'
      >
        Entendido
      </button>
    </div>
  );
}
