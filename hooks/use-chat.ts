'use client';

import { sendMessage } from '@/lib/actions';
import { useState, FormEvent, useRef } from 'react';
import { nanoid } from 'nanoid';
// Use the Message type from ai-service if it's compatible, or define a local one if needed
// For now, assume HistoryMessage format is needed by the hook/UI
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
}

// Import the type expected by sendMessage (from ai-service)
import type { Message as ActionMessage } from '@/lib/ai-service';

/**
 * Hook for managing chat state and interactions with an agent
 * @param agentId - The ID of the agent to chat with
 * @returns Chat state and functions for interacting with the agent
 */
export default function useChat(agentId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission to send a message to the agent
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Don't send empty messages
    if (!input.trim()) {
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create a new user message
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input,
    };

    // Add the user message to the chat
    setMessages((messages) => [...messages, userMessage]);
    
    // Clear the input
    setInput('');
    
    // Set loading state to true before sending the message
    setIsLoading(true);

    try {
      // Prepare message history for the action INCLUDING the new user message
      const messagesWithNewUserMessage = [
        ...messages, // Current messages state
        userMessage  // The user message we just created
      ];

      const historyForAction: ActionMessage[] = messagesWithNewUserMessage
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Only user/assistant messages
        .map(({ role, content }) => ({ role, content })); // Map to {role, content}

      // Remove the *last* message (the one currently being sent) from the history payload
      const historyToSend = historyForAction.slice(0, -1);

      // Send the message to the agent, including the correctly prepared history
      const response = await sendMessage(
        agentId, 
        userMessage.content, // Send only the content of the current message
        historyToSend      // Pass the history EXCLUDING the current message
      );
      
      // Check for errors
      if ('error' in response) {
        const errorMessage = response.error;
        console.error('Error from AI service:', errorMessage);
        
        // Add an error message to the chat
        setMessages((messages) => [
          ...messages,
          {
            id: nanoid(),
            role: 'error',
            content: `Error: ${errorMessage}`,
          },
        ]);
        
        // Set the error state
        setError(errorMessage ?? null);
        return;
      }
      
      // Add the assistant's response to the chat
      setMessages((messages) => [
        ...messages,
        {
          id: response.id,
          role: response.role as 'assistant',
          content: response.content,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message to the chat
      setMessages((messages) => [
        ...messages,
        {
          id: nanoid(),
          role: 'error',
          content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        },
      ]);
      
      // Set the error state
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      // Set loading state to false after the message is sent
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  };
} 