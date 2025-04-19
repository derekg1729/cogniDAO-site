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
      className="w-full" 
      data-role={message.role}
    >
      <div
        className={cn(
          'flex gap-3',
          message.role === 'user' ? 'justify-end' : 'justify-start',
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center justify-center shrink-0">
            <div className="text-white w-7 h-7 flex items-center justify-center">
              <SparklesIcon size={16} />
            </div>
          </div>
        )}

        <div className={cn('flex flex-col max-w-[85%]', 
          message.role === 'user' ? 'items-end' : 'items-start'
        )}>
          <div
            data-testid="message-content"
            className={cn('px-0 py-0', {
              'text-white': message.role === 'user',
              'text-gray-300': message.role === 'assistant',
            })}
          >
            {message.content}
            {message.isStreaming && (
              <span className="ml-1 inline-block w-2 h-4 bg-gray-400 animate-pulse"/>
            )}
          </div>
        </div>

        {message.role === 'user' && (
          <div className="size-8 flex items-center justify-center shrink-0">
            <div className="text-white w-7 h-7 flex items-center justify-center">
              <UserIcon size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}