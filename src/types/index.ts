export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'WALLET' | 'CREDIT_CARD';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  balance: number;
}

export interface AccountPayload {
  name: string;
  type: AccountType;
  institution?: string;
  balance: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface TransactionPayload {
  accountId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface AiHealthResponse {
  status?: string;
  modelConfigured: boolean;
  model?: string;
}

export interface AiChatResponse {
  reply: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
