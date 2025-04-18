"use client";

import { cn } from '../lib/utils';
import { SparklesIcon, UserIcon } from './icons';
import { useState, useEffect } from 'react';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

export function MessageComponent({
  message,
  isLoading,
}: {
  message: Message;
  isLoading?: boolean;
}) {
  return (
    <div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      data-role={message.role}
    >
      <div
        className={cn(
          'flex gap-4 w-full',
          message.role === 'user' ? 'justify-end' : 'justify-start',
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center shrink-0 bg-indigo-600/20 border border-indigo-500/30 text-white">
            <SparklesIcon size={16} />
          </div>
        )}

        <div className="flex flex-col gap-2 max-w-[80%]">
          <div
            data-testid="message-content"
            className={cn('flex flex-col gap-2 px-4 py-3 rounded-xl', {
              'bg-indigo-600 text-white': message.role === 'user',
              'bg-black/40 border border-indigo-500/30 text-white': message.role === 'assistant',
            })}
          >
            {message.content}
            {message.isStreaming && (
              <span className="ml-1 inline-block w-2 h-4 bg-white/60 animate-pulse"/>
            )}
          </div>
        </div>

        {message.role === 'user' && (
          <div className="size-8 flex items-center rounded-full justify-center shrink-0 bg-indigo-600/20 border border-indigo-500/30 text-white">
            <UserIcon size={16} />
          </div>
        )}
      </div>
    </div>
  );
}