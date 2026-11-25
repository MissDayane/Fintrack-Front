import type { Account, AccountPayload } from '../types';
import { INITIAL_DEMO_ACCOUNTS } from '../utils/demoData';
import { safeStorage } from '../utils/storage';
import { USE_MOCK_API, apiClient } from './http';

const DEMO_ACCOUNTS_KEY = 'fintrack_demo_accounts';

function readDemoAccounts(): Account[] {
  const raw = safeStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!raw) {
    safeStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
    return [...INITIAL_DEMO_ACCOUNTS];
  }
  try {
    return JSON.parse(raw) as Account[];
  } catch {
    return [...INITIAL_DEMO_ACCOUNTS];
  }
}

export function writeDemoAccounts(accounts: Account[]) {
  safeStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normalizeAccount(raw: Record<string, unknown>): Account {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.nome ?? 'Conta'),
    type: (raw.type as Account['type']) || 'CHECKING',
    institution: raw.institution ? String(raw.institution) : undefined,
    balance: Number(raw.balance ?? raw.saldo ?? 0),
  };
}

export const accountsService = {
  async list(): Promise<Account[]> {
    if (USE_MOCK_API) {
      return readDemoAccounts();
    }
    const data = await apiClient<unknown>('/accounts', { method: 'GET' });
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { content?: unknown[] })?.content)
        ? (data as { content: unknown[] }).content
        : [];
    return list.map((item) => normalizeAccount(item as Record<string, unknown>));
  },

  async create(payload: AccountPayload): Promise<Account> {
    if (USE_MOCK_API) {
      const current = readDemoAccounts();
      const created: Account = {
        id: `acc-${Date.now()}`,
        ...payload,
      };
      writeDemoAccounts([...current, created]);
      return created;
    }
    const data = await apiClient<Record<string, unknown>>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeAccount(data);
  },

  async update(id: string, payload: AccountPayload): Promise<Account> {
    if (USE_MOCK_API) {
      const current = readDemoAccounts();
      const updated = current.map((acc) => (acc.id === id ? { ...acc, ...payload, id } : acc));
      writeDemoAccounts(updated);
      return updated.find((acc) => acc.id === id)!;
    }
    const data = await apiClient<Record<string, unknown>>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeAccount(data);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const current = readDemoAccounts().filter((acc) => acc.id !== id);
      writeDemoAccounts(current);
      return;
    }
    await apiClient<void>(`/accounts/${id}`, { method: 'DELETE' });
  },
};
