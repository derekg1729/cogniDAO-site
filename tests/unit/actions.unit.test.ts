import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAgents, deleteAgent, sendMessage, getAgent } from '@/lib/actions';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  default: {
    query: {
      agents: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      }
    },
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  }
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  withSiteAuth: vi.fn((handler) => handler),
  withPostAuth: vi.fn((handler) => handler),
  withAgentAuth: vi.fn((handler) => handler),
}));

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/db-access', () => ({
  getApiConnectionByService: vi.fn(),
}));

vi.mock('@/lib/ai-service', () => ({
  createAIService: vi.fn(),
  sendMessageToAI: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('test-id-123'),
  customAlphabet: vi.fn(() => vi.fn().mockReturnValue('test-id-123')),
}));

// Import mocks after they've been defined
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getApiConnectionByService } from '@/lib/db-access';
import { createAIService, sendMessageToAI } from '@/lib/ai-service';
import { nanoid } from 'nanoid';

describe('Agent Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      user: { 
        id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png'
      }
    });
  });

  describe('getAgents', () => {
    it('should fetch agents for a user', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Test Agent 1',
          description: 'This is a test agent',
          model: 'gpt-4',
          temperature: 0.7,
          instructions: 'You are a helpful assistant for testing purposes',
          userId: 'user-123',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          name: 'Test Agent 2',
          description: 'Another test agent',
          model: 'gpt-3.5-turbo',
          temperature: 0.9,
          instructions: 'You are another helpful assistant for testing',
          userId: 'user-123',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      vi.mocked(db.query.agents.findMany).mockResolvedValue(mockAgents);

      const result = await getAgents('user-123');

      expect(db.query.agents.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockAgents);
    });

    it('should return an empty array if no agents are found', async () => {
      vi.mocked(db.query.agents.findMany).mockResolvedValue([]);

      const result = await getAgents('user-123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(db.query.agents.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getAgents('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getAgent', () => {
    it('should fetch a single agent by ID', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        temperature: 0.7,
        instructions: 'You are a helpful assistant for testing purposes',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(db.query.agents.findFirst).mockResolvedValue(mockAgent);

      const result = await getAgent('agent-123');

      expect(db.query.agents.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockAgent);
    });

    it('should return null if agent is not found', async () => {
      vi.mocked(db.query.agents.findFirst).mockResolvedValue(undefined);

      const result = await getAgent('non-existent-agent');

      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(db.query.agents.findFirst).mockRejectedValue(new Error('Database error'));

      const result = await getAgent('agent-123');

      expect(result).toBeNull();
    });
  });

  describe('deleteAgent', () => {
    it('should delete an agent and return success', async () => {
      // Mock the agent check
      vi.mocked(db.query.agents.findFirst).mockResolvedValue({
        id: 'agent-123',
        name: 'Test Agent',
        description: 'Test description',
        model: 'gpt-4',
        temperature: 0.7,
        instructions: 'You are a helpful assistant for testing purposes',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deleteAgent('agent-123');

      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return an error if agent is not found', async () => {
      vi.mocked(db.query.agents.findFirst).mockResolvedValue(undefined);

      const result = await deleteAgent('agent-123');

      expect(result).toEqual({ 
        error: "Agent not found or you don't have permission to delete it" 
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(db.query.agents.findFirst).mockRejectedValue(new Error('Database error'));

      const result = await deleteAgent('agent-123');

      expect(result).toEqual({ error: "Failed to delete agent" });
    });
  });

  describe('sendMessage', () => {
    it('should send a message to the agent and return the response', async () => {
      // Mock session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      } as any);

      // Mock agent
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        description: 'This is a test agent',
        model: 'gpt-4',
        temperature: 0.7,
        instructions: 'You are a helpful assistant for testing purposes',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock API connection
      const mockApiConnection = {
        id: 'conn-123',
        name: 'OpenAI',
        service: 'openai',
        encryptedApiKey: 'encrypted-key-123',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock AI service response (now mocking sendMessageToAI directly)
      const mockAIResponse = {
        content: 'This is a mock response from the AI model'
      };

      // Set up all mocks
      vi.mocked(db.query.agents.findFirst).mockResolvedValue(mockAgent);
      vi.mocked(getApiConnectionByService).mockResolvedValue(mockApiConnection);
      vi.mocked(sendMessageToAI).mockResolvedValue(mockAIResponse);
      vi.mocked(nanoid).mockReturnValue('test-id-123');

      const result = await sendMessage('agent-123', 'Hello, agent!');

      // Verify all expected functions were called
      expect(getSession).toHaveBeenCalled();
      expect(db.query.agents.findFirst).toHaveBeenCalled();
      expect(getApiConnectionByService).toHaveBeenCalledWith('user-123', 'openai');
      
      // Verify sendMessageToAI was called correctly
      const expectedAgentForAI = {
        ...mockAgent,
        instructions: mockAgent.instructions ?? undefined,
      };
      const expectedMessages = [
        { role: 'user', content: 'Hello, agent!' }
      ];
      expect(sendMessageToAI).toHaveBeenCalledWith(
        expectedAgentForAI,
        expectedMessages,
        mockApiConnection.encryptedApiKey
      );

      // Verify result matches expected format
      expect(result).toEqual({
        id: 'test-id-123',
        role: 'assistant',
        content: 'This is a mock response from the AI model',
      });
    });

    it('should return an error message if agent is not found', async () => {
      // Mock session
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      } as any);

      // Mock agent not found
      vi.mocked(db.query.agents.findFirst).mockResolvedValue(undefined);

      const result = await sendMessage('non-existent-agent', 'Hello, agent!');

      expect(result).toEqual({
        error: 'Agent not found',
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock session throwing an error
      vi.mocked(getSession).mockRejectedValue(new Error('Session error'));

      const result = await sendMessage('agent-123', 'Hello, agent!');
      
      expect(result).toEqual({
        error: 'Session error',
      });
    });
  });
}); 