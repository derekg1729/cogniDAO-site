"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { SendIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Message, MessageComponent, MessageRole } from "./Message";
import { SuggestedActions } from "./SuggestedActions";
import { motion, AnimatePresence } from "framer-motion";
import { cn, generateUUID } from "../lib/utils";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setMessages(messages => messages.map(message => ({
      ...message,
      isStreaming: false
    })));
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    console.log("Sending message:", userMessage);
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: generateUUID(),
      role: 'user',
      content: userMessage
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    resetHeight();
    
    // Create a placeholder for the assistant's message
    const assistantMessageId = generateUUID();
    const placeholderMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    
    setMessages(prev => [...prev, placeholderMessage]);
    setIsStreaming(true);

    try {
      // Send the request to the API
      console.log("Calling API endpoint at:", "/api/ai/chat");
      
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response data:", data);
      
      // Simplify: update the message immediately first, then simulate streaming
      // This ensures the content appears even if streaming fails
      const fullResponse = data.response;
      console.log("Response content to stream:", fullResponse, typeof fullResponse);
      
      // First update with full response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse, isStreaming: false }
            : msg
        )
      );
      
      /* Commented out streaming for troubleshooting
      let streamedContent = "";
      for (let i = 0; i < fullResponse.length; i++) {
        if (!isStreaming) break; // Allow stopping mid-stream
        
        streamedContent += fullResponse[i];
        
        // Add debug logging for a single iteration
        if (i === 0) {
          console.log("First char:", fullResponse[i], "Updated content:", streamedContent);
          console.log("Finding message with ID:", assistantMessageId);
        }
        
        setMessages(prev => {
          const updatedMessages = prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: streamedContent }
              : msg
          );
          
          // Debug the state update for the first character
          if (i === 0) {
            console.log("Message found?", updatedMessages.some(m => m.id === assistantMessageId));
            console.log("Updated messages:", updatedMessages);
          }
          
          return updatedMessages;
        });
        
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      */
      
    } catch (error) {
      console.error("Error details:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    }
  };

  // Define this after sendMessage so we can include it in dependencies
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    sendMessage(suggestion);
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) return;
    sendMessage(input);
  };

  return (
    <div className="cogni-panel w-full max-w-2xl flex flex-col h-[500px]">
      
      <div className="cogni-panel-content flex-1 overflow-y-auto flex flex-col space-y-4 p-2">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6 items-center justify-center text-white/60 p-4"
            >
              <p className="text-center text-lg">Ask a question about CogniDAO or try a suggestion below</p>
              <SuggestedActions onSuggestionClick={handleSuggestionClick} />
            </motion.div>
          ) : (
            messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                isLoading={message.isStreaming}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="cogni-panel-footer p-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="pr-12 resize-none min-h-[56px] max-h-[200px] overflow-y-auto"
            disabled={isStreaming}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isStreaming) {
                  handleSubmit(e);
                }
              }
            }}
          />
          
          <div className="absolute right-3 bottom-3">
            {isStreaming ? (
              <Button
                type="button"
                variant="cogni"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={stopStreaming}
                aria-label="Stop generating"
              >
                <StopIcon />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="cogni"
                size="icon"
                className="h-8 w-8 p-0"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}