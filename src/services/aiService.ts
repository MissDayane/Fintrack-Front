import type { Account, AiChatResponse, AiHealthResponse, Transaction } from '../types';
import { generateDemoAiReply } from '../utils/demoData';
import { USE_MOCK_API, aiClient } from './http';

export const aiService = {
  async health(): Promise<{ reachable: boolean; modelConfigured: boolean; model?: string }> {
    if (USE_MOCK_API) {
      return {
        reachable: true,
        modelConfigured: true,
        model: 'Assistente local (pronto para conectar :8082)',
      };
    }

    try {
      const data = await aiClient<AiHealthResponse>('/api/ai/health', {
        method: 'GET',
        auth: false,
      });
      return {
        reachable: true,
        modelConfigured: Boolean(data?.modelConfigured),
        model: data?.model,
      };
    } catch {
      return {
        reachable: false,
        modelConfigured: false,
      };
    }
  },

  async sendMessage(
    message: string,
    context?: { accounts: Account[]; transactions: Transaction[] },
  ): Promise<AiChatResponse> {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 620));
      return {
        reply: generateDemoAiReply(
          message,
          context?.accounts ?? [],
          context?.transactions ?? [],
        ),
      };
    }

    return aiClient<AiChatResponse>('/api/ai/chat', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ message }),
    });
  },

  async clearHistory(): Promise<void> {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }

    await aiClient<void>('/api/ai/chat', {
      method: 'DELETE',
      auth: true,
    });
  },
};
