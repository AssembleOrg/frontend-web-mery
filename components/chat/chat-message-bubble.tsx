'use client';

import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat-api';

interface Props {
  message: ChatMessage;
  mine: boolean;
}

export function ChatMessageBubble({ message, mine }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
          mine
            ? 'bg-[#f9bbc4] text-[#3a1f26] rounded-br-sm'
            : 'bg-white dark:bg-card text-foreground border border-border rounded-bl-sm'
        }`}
      >
        {message.imageUrl && (
          <a
            href={message.imageUrl}
            target='_blank'
            rel='noreferrer'
            className='block mb-2'
          >
            <img
              src={message.imageUrl}
              alt=''
              className='rounded-lg max-h-80 w-auto object-cover'
            />
          </a>
        )}
        {message.content && (
          <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
            {message.content}
          </p>
        )}
        <div
          className={`flex items-center gap-1 mt-1 text-[10px] ${
            mine ? 'text-[#660e1b]/70 justify-end' : 'text-muted-foreground'
          }`}
        >
          <span>{time}</span>
          {mine &&
            (message.readAt ? (
              <CheckCheck className='w-3 h-3' />
            ) : (
              <Check className='w-3 h-3' />
            ))}
        </div>
      </div>
    </div>
  );
}
