import type { Transaction, TransactionPayload } from '../types';
import { INITIAL_DEMO_TRANSACTIONS } from '../utils/demoData';
import { safeStorage } from '../utils/storage';
import { accountsService, writeDemoAccounts } from './accountsService';
import { USE_MOCK_API, apiClient } from './http';

const DEMO_TX_KEY = 'fintrack_demo_transactions';

function readDemoTransactions(): Transaction[] {
  const raw = safeStorage.getItem(DEMO_TX_KEY);
  if (!raw) {
    safeStorage.setItem(DEMO_TX_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
    return [...INITIAL_DEMO_TRANSACTIONS];
  }
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [...INITIAL_DEMO_TRANSACTIONS];
  }
}

function writeDemoTransactions(transactions: Transaction[]) {
  safeStorage.setItem(DEMO_TX_KEY, JSON.stringify(transactions));
}

function normalizeTransaction(raw: Record<string, unknown>): Transaction {
  const rawType = String(raw.type ?? raw.tipo ?? 'EXPENSE').toUpperCase();
  const type = rawType === 'INCOME' || rawType === 'RECEITA' || rawType === 'CREDIT'
    ? 'INCOME'
    : 'EXPENSE';

  return {
    id: String(raw.id ?? ''),
    accountId: String(raw.accountId ?? (raw.account as { id?: string | number })?.id ?? ''),
    description: String(raw.description ?? raw.descricao ?? 'Transação'),
    amount: Math.abs(Number(raw.amount ?? raw.valor ?? 0)),
    type,
    category: String(raw.category ?? raw.categoria ?? 'Outros'),
    date: String(raw.date ?? raw.data ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
  };
}

async function applyDemoBalanceDelta(accountId: string, delta: number) {
  const accounts = await accountsService.list();
  const updated = accounts.map((acc) =>
    acc.id === accountId ? { ...acc, balance: Number((acc.balance + delta).toFixed(2)) } : acc,
  );
  writeDemoAccounts(updated);
}

export const transactionsService = {
  async list(): Promise<Transaction[]> {
    if (USE_MOCK_API) {
      return readDemoTransactions().sort((a, b) => b.date.localeCompare(a.date));
    }
    const data = await apiClient<unknown>('/transactions', { method: 'GET' });
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { content?: unknown[] })?.content)
        ? (data as { content: unknown[] }).content
        : [];
    return list
      .map((item) => normalizeTransaction(item as Record<string, unknown>))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async create(payload: TransactionPayload): Promise<Transaction> {
    if (USE_MOCK_API) {
      const current = readDemoTransactions();
      const created: Transaction = {
        id: `tx-${Date.now()}`,
        ...payload,
      };
      writeDemoTransactions([created, ...current]);
      const delta = payload.type === 'INCOME' ? payload.amount : -payload.amount;
      await applyDemoBalanceDelta(payload.accountId, delta);
      return created;
    }
    const data = await apiClient<Record<string, unknown>>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTransaction(data);
  },

  async update(id: string, payload: TransactionPayload): Promise<Transaction> {
    if (USE_MOCK_API) {
      const current = readDemoTransactions();
      const existing = current.find((t) => t.id === id);
      if (existing) {
        const revertDelta = existing.type === 'INCOME' ? -existing.amount : existing.amount;
        await applyDemoBalanceDelta(existing.accountId, revertDelta);
      }
      const updatedList = current.map((t) => (t.id === id ? { ...payload, id } : t));
      writeDemoTransactions(updatedList);
      const nextDelta = payload.type === 'INCOME' ? payload.amount : -payload.amount;
      await applyDemoBalanceDelta(payload.accountId, nextDelta);
      return { ...payload, id };
    }
    const data = await apiClient<Record<string, unknown>>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeTransaction(data);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const current = readDemoTransactions();
      const existing = current.find((t) => t.id === id);
      writeDemoTransactions(current.filter((t) => t.id !== id));
      if (existing) {
        const revertDelta = existing.type === 'INCOME' ? -existing.amount : existing.amount;
        await applyDemoBalanceDelta(existing.accountId, revertDelta);
      }
      return;
    }
    await apiClient<void>(`/transactions/${id}`, { method: 'DELETE' });
  },
};
