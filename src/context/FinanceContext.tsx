import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { accountsService } from '../services/accountsService';
import { transactionsService } from '../services/transactionsService';
import type { Account, AccountPayload, Transaction, TransactionPayload } from '../types';
import { safeStorage } from '../utils/storage';
import { useAuth } from './AuthContext';

const HIDE_VALUES_KEY = 'fintrack_hide_values';

interface FinanceContextValue {
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hideValues: boolean;
  toggleHideValues: () => void;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  refreshAll: () => Promise<void>;
  createAccount: (payload: AccountPayload) => Promise<void>;
  updateAccount: (id: string, payload: AccountPayload) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  createTransaction: (payload: TransactionPayload) => Promise<void>;
  updateTransaction: (id: string, payload: TransactionPayload) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideValues, setHideValues] = useState<boolean>(
    () => safeStorage.getItem(HIDE_VALUES_KEY) === 'true',
  );

  const toggleHideValues = useCallback(() => {
    setHideValues((prev) => {
      const next = !prev;
      safeStorage.setItem(HIDE_VALUES_KEY, String(next));
      return next;
    });
  }, []);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) {
      setAccounts([]);
      setTransactions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [accList, txList] = await Promise.all([
        accountsService.list(),
        transactionsService.list(),
      ]);
      setAccounts(accList);
      setTransactions(txList);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados financeiros.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createAccount = useCallback(
    async (payload: AccountPayload) => {
      await accountsService.create(payload);
      await refreshAll();
    },
    [refreshAll],
  );

  const updateAccount = useCallback(
    async (id: string, payload: AccountPayload) => {
      await accountsService.update(id, payload);
      await refreshAll();
    },
    [refreshAll],
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      await accountsService.remove(id);
      await refreshAll();
    },
    [refreshAll],
  );

  const createTransaction = useCallback(
    async (payload: TransactionPayload) => {
      await transactionsService.create(payload);
      await refreshAll();
    },
    [refreshAll],
  );

  const updateTransaction = useCallback(
    async (id: string, payload: TransactionPayload) => {
      await transactionsService.update(id, payload);
      await refreshAll();
    },
    [refreshAll],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await transactionsService.remove(id);
      await refreshAll();
    },
    [refreshAll],
  );

  const summary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = transactions
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { totalBalance, totalIncome, totalExpense };
  }, [accounts, transactions]);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        isLoading,
        error,
        hideValues,
        toggleHideValues,
        ...summary,
        refreshAll,
        createAccount,
        updateAccount,
        deleteAccount,
        createTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  return ctx;
}
