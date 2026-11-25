import type { Account, Transaction, User } from '../types';
import { formatCurrency } from './format';

export const DEMO_USER: User = {
  id: 'demo-user-01',
  name: 'Marina Oliveira',
  email: 'marina@fintrack.app',
};

export const INITIAL_DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Conta Principal',
    type: 'CHECKING',
    institution: 'Nubank',
    balance: 6840.5,
  },
  {
    id: 'acc-2',
    name: 'Reserva de Emergência',
    type: 'SAVINGS',
    institution: 'Itaú',
    balance: 18500.0,
  },
  {
    id: 'acc-3',
    name: 'Carteira Tesouro & CDB',
    type: 'INVESTMENT',
    institution: 'XP Investimentos',
    balance: 12450.75,
  },
  {
    id: 'acc-4',
    name: 'Carteira Física',
    type: 'WALLET',
    institution: 'Dinheiro',
    balance: 320.0,
  },
];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    description: 'Salário Mensal',
    amount: 7200.0,
    type: 'INCOME',
    category: 'Salário',
    date: daysAgoIso(1),
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    description: 'Aluguel + Condomínio',
    amount: 2150.0,
    type: 'EXPENSE',
    category: 'Moradia',
    date: daysAgoIso(2),
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    description: 'Supermercado Pão de Açúcar',
    amount: 642.8,
    type: 'EXPENSE',
    category: 'Alimentação',
    date: daysAgoIso(3),
  },
  {
    id: 'tx-4',
    accountId: 'acc-3',
    description: 'Projeto Freelance UI Design',
    amount: 1850.0,
    type: 'INCOME',
    category: 'Freelance',
    date: daysAgoIso(5),
  },
  {
    id: 'tx-5',
    accountId: 'acc-1',
    description: 'Plano de Internet & Streaming',
    amount: 189.9,
    type: 'EXPENSE',
    category: 'Assinaturas',
    date: daysAgoIso(6),
  },
  {
    id: 'tx-6',
    accountId: 'acc-1',
    description: 'Transporte e Combustível',
    amount: 315.4,
    type: 'EXPENSE',
    category: 'Transporte',
    date: daysAgoIso(8),
  },
  {
    id: 'tx-7',
    accountId: 'acc-2',
    description: 'Rendimento CDB Liquidez Diária',
    amount: 194.2,
    type: 'INCOME',
    category: 'Investimentos',
    date: daysAgoIso(10),
  },
];

export const AI_SUGGESTION_PROMPTS = [
  'Como organizar meu orçamento mensal?',
  'Como aplicar a regra 50-30-20?',
  'Dicas para montar reserva de emergência',
  'Como reduzir gastos com assinaturas e alimentação?',
];

export function generateDemoAiReply(
  message: string,
  accounts: Account[],
  transactions: Transaction[],
): string {
  const lower = message.toLowerCase();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  if (lower.includes('50-30-20') || lower.includes('50 30 20') || lower.includes('regra')) {
    const base = income > 0 ? income : 5000;
    return [
      'A **regra 50-30-20** divide sua renda líquida em três blocos práticos:',
      `- **50% Necessidades essenciais** (${formatCurrency(base * 0.5)}): moradia, alimentação básica, contas fixas e transporte.`,
      `- **30% Desejos pessoais** (${formatCurrency(base * 0.3)}): lazer, restaurantes, viagens e assinaturas.`,
      `- **20% Metas e investimentos** (${formatCurrency(base * 0.2)}): reserva de emergência e aportes mensais.`,
      'Se quiser, posso sugerir como adaptar esses percentuais para a sua realidade atual.',
    ].join('\n');
  }

  if (lower.includes('reserva') || lower.includes('emerg')) {
    const monthlyExpense = expense > 0 ? expense : 3000;
    return [
      'Para uma **reserva de emergência sólida**, o ideal é acumular de **6 a 12 meses** do seu custo de vida essencial:',
      `- Com base nas saídas registradas (${formatCurrency(monthlyExpense)}), uma meta inicial de 6 meses seria cerca de **${formatCurrency(monthlyExpense * 6)}**.`,
      '- Priorize aplicações com **liquidez diária e baixo risco** (ex.: Tesouro Selic ou CDB 100% CDI com liquidez diária).',
      '- Automatize um aporte fixo logo no dia em que o salário cair na conta.',
    ].join('\n');
  }

  if (lower.includes('orçamento') || lower.includes('orcamento') || lower.includes('organizar')) {
    return [
      'Um plano simples em 4 passos para organizar seu orçamento mensal:',
      '- **1. Mapeie sua renda real** e fixe um teto por categoria (Moradia, Alimentação, Transporte, Lazer).',
      '- **2. Registre os gastos no mesmo dia** aqui no FinTrack para evitar surpresas no fim do mês.',
      '- **3. Separe a poupança primeiro** antes de gastar o restante.',
      '- **4. Faça uma revisão semanal de 10 minutos** comparando entradas vs. saídas.',
      `No momento, seu saldo consolidado é **${formatCurrency(totalBalance)}** com entradas de **${formatCurrency(income)}** e saídas de **${formatCurrency(expense)}**.`,
    ].join('\n');
  }

  return [
    'Ótima pergunta! Aqui vão recomendações diretas para fortalecer seu controle financeiro:',
    `- **Acompanhe seu fluxo:** você tem ${accounts.length} conta(s) cadastrada(s) somando **${formatCurrency(totalBalance)}**.`,
    '- **Categorize todas as despesas** para identificar rapidamente onde o orçamento está vazando (assinaturas recorrentes e pequenos gastos diários costumam surpreender).',
    '- **Defina uma meta mensal de sobra** e transfira esse valor para sua conta de reserva/investimentos no início do mês.',
  ].join('\n');
}
