import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useChat from '@/hooks/use-chat';
import { sendMessage } from '@/lib/actions';
import { getAgent } from '@/lib/actions';
import { getApiConnectionByService } from '@/lib/db-access';
import { createAIService } from '@/lib/ai-service';

// Mock the dependencies
vi.mock('@/lib/actions', () => ({
  sendMessage: vi.fn(),
  getAgent: vi.fn(),
}));

vi.mock('@/lib/db-access', () => ({
  getApiConnectionByService: vi.fn(),
}));

vi.mock('@/lib/ai-service', () => ({
  createAIService: vi.fn(),
}));

describe.skip('AI Integration', () => {
  // Set up mock objects
  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    description: 'A test agent',
    model: 'gpt-4',
    temperature: 0.7,
    instructions: 'You are a test agent for integration testing',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockApiConnection = {
    id: 'api-conn-1',
    name: 'My OpenAI Connection',
    service: 'openai',
    encryptedApiKey: 'encrypted-key-123',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAIService = {
    generateChatResponse: vi.fn().mockResolvedValue({
      content: 'This is a response from the AI service.',
    }),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up mock implementations
    vi.mocked(getAgent).mockResolvedValue(mockAgent);
    vi.mocked(getApiConnectionByService).mockResolvedValue(mockApiConnection);
    vi.mocked(createAIService).mockResolvedValue(mockAIService);
    
    // Mock sendMessage implementation
    vi.mocked(sendMessage).mockImplementation(async (agentId: string, content: string) => {
      // Create a mock response
      return {
        id: 'msg-123',
        role: 'assistant',
        content: 'This is a response from the AI service.',
      };
    });
  });

  it('should send a message and receive a response from the AI service', async () => {
    // Arrange
    const { result } = renderHook(() => useChat('agent-123'));
    
    // Set the input
    act(() => {
      result.current.setInput('Hello, AI!');
    });
    
    // Act
    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });

    // Assert
    expect(sendMessage).toHaveBeenCalledWith('agent-123', 'Hello, AI!');
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('Hello, AI!');
    expect(result.current.messages[1].content).toBe('This is a response from the AI service.');
  });

  it('should set loading state during AI request', async () => {
    // Arrange
    const { result } = renderHook(() => useChat('agent-123'));
    
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // Override the sendMessage mock to use our controlled promise
    vi.mocked(sendMessage).mockImplementationOnce(() => promise as any);

    // Act - Set the input
    act(() => {
      result.current.setInput('Hello, AI!');
    });
    
    // Start the submission but don't await it
    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit(new Event('submit') as any);
    });
    
    // We need a short delay to let React update the state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Assert - Should be loading now
    expect(result.current.isLoading).toBe(true);

    // Act - Resolve the promise
    await act(async () => {
      resolvePromise({
        id: 'msg-123',
        role: 'assistant',
        content: 'This is a response',
      });
      await submitPromise;
    });

    // Assert - Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors from the AI service gracefully', async () => {
    // Arrange
    const { result } = renderHook(() => useChat('agent-123'));
    
    // Mock the sendMessage to throw an error
    vi.mocked(sendMessage).mockRejectedValueOnce(new Error('Failed to generate AI response'));

    // Act - Set the input
    act(() => {
      result.current.setInput('Hello, AI!');
    });
    
    // Submit the message (allowing the promise to reject)
    await act(async () => {
      try {
        await result.current.handleSubmit(new Event('submit') as any);
      } catch (error) {
        // Error is expected
      }
    });

    // Assert - User message should be added, followed by an error message
    expect(sendMessage).toHaveBeenCalledWith('agent-123', 'Hello, AI!');
    expect(result.current.messages).toHaveLength(2); // Now expecting 2 messages (user + error)
    expect(result.current.messages[0].content).toBe('Hello, AI!');
    expect(result.current.messages[1].role).toBe('error');
    expect(result.current.messages[1].content).toContain('Failed to generate AI response');
    expect(result.current.isLoading).toBe(false);
  });
}); 