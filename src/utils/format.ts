import type { AccountType } from '../types';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number, hidden = false): string {
  if (hidden) return 'R$ •••••';
  return brlFormatter.format(value);
}

export function formatSignedCurrency(
  value: number,
  type: 'INCOME' | 'EXPENSE',
  hidden = false,
): string {
  const prefix = type === 'INCOME' ? '+ ' : '- ';
  if (hidden) return `${prefix}R$ •••••`;
  return `${prefix}${brlFormatter.format(Math.abs(value))}`;
}

export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('T')[0].split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatTimeBR(date = new Date()): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function parseMoneyInput(raw: string): number {
  const cleaned = raw
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatMoneyInputFromNumber(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export function getInitials(name?: string): string {
  if (!name) return 'FT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  INVESTMENT: 'Investimentos',
  WALLET: 'Carteira',
  CREDIT_CARD: 'Cartão de Crédito',
};

export const TRANSACTION_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Assinaturas',
  'Educação',
  'Outros',
];
