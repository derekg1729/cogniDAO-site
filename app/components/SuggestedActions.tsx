"use client";

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';

interface SuggestedActionsProps {
  onSuggestionClick: (action: string) => void;
}

function PureSuggestedActions({ onSuggestionClick }: SuggestedActionsProps) {
  console.log("[SuggestedActions] Rendering component.");
  const suggestedActions = [
    {
      title: 'What is',
      label: 'CogniDAO?',
      action: 'What is CogniDAO?',
    },
    {
      title: 'How can I',
      label: 'use the platform?',
      action: 'How can I use the CogniDAO platform?',
    },
    {
      title: 'Tell me about',
      label: 'AI-powered organizations',
      action: 'Tell me about AI-powered organizations',
    },
    {
      title: 'What tools',
      label: 'does CogniDAO offer?',
      action: 'What tools does CogniDAO offer?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={() => onSuggestionClick(suggestedAction.action)}
            className="text-left border border-indigo-500/30 bg-indigo-900/20 rounded-xl px-4 py-3.5 text-sm gap-1 sm:flex-col w-full h-auto justify-start items-start text-white hover:bg-indigo-900/40"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-indigo-200">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);