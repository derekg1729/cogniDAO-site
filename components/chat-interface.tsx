"use client";

import { SelectAgent } from "@/lib/schema";
import useChat from "@/hooks/use-chat";

interface ChatInterfaceProps {
  agent: SelectAgent;
}

export default function ChatInterface({ agent }: ChatInterfaceProps) {
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat(agent.id);

  return (
    <div data-testid="messages-container">
      <div data-testid="input-container">
        <form data-testid="chat-form" onSubmit={handleSubmit}>
          <textarea 
            data-testid="chat-textarea" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button data-testid="send-button" type="submit">Send</button>
        </form>
      </div>
      {isLoading && <div role="status">Loading...</div>}
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
    </div>
  );
} 