"use client";

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';

interface SuggestedActionsProps {
  onSuggestionClick: (action: string) => void;
}

function PureSuggestedActions({ onSuggestionClick }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      action: 'What are the advantages of using Next.js?',
    },
    {
      action: 'Write code to demonstrate dijkstra\'s algorithm',
    },
    {
      action: 'Help me write an essay about silicon valley',
    },
    {
      action: 'What is the weather in San Francisco?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-3 w-full max-w-4xl mx-auto"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => onSuggestionClick(suggestedAction.action)}
            className="text-left border border-gray-700 bg-gray-900/30 rounded-lg px-4 py-3 text-sm w-full h-auto justify-start items-start text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <span className="text-sm">{suggestedAction.action}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);