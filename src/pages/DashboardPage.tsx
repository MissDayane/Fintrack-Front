import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { FinTrackMark } from '../components/brand/FinTrackLogo';
import { AccountModal } from '../components/common/AccountModal';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import {
  ACCOUNT_TYPE_LABELS,
  formatCurrency,
  formatDateBR,
  formatSignedCurrency,
} from '../utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const {
    accounts,
    transactions,
    isLoading,
    error,
    hideValues,
    totalBalance,
    totalIncome,
    totalExpense,
    refreshAll,
    createAccount,
  } = useFinance();
  const { showToast } = useToast();
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const accountNameMap = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc.name])),
    [accounts],
  );

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);
  const maxFlow = Math.max(totalIncome, totalExpense, 1);
  const netFlow = totalIncome - totalExpense;

  if (isLoading && accounts.length === 0) {
    return (
      <div className="stack-20" aria-busy="true" aria-label="Carregando dashboard">
        <div className="hero-balance-grid">
          <div className="skeleton" style={{ height: 146, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 146, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 146, borderRadius: 16 }} />
        </div>
        <div className="dashboard-main-grid">
          <div className="skeleton" style={{ height: 340, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 340, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20, alignItems: 'center' }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={refreshAll}>
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.94rem' }}>
          Olá, <strong style={{ color: 'var(--color-purple-deep)' }}>{user?.name}</strong> — aqui
          está o panorama atual das suas finanças.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="hero-balance-grid" aria-label="Resumo financeiro">
        <article className="kpi-card kpi-card-primary">
          <div className="kpi-top">
            <span className="kpi-label">Saldo consolidado</span>
            <span className="kpi-icon kpi-icon-gold" aria-hidden="true">
              <Wallet size={20} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{formatCurrency(totalBalance, hideValues)}</div>
          <div className="kpi-foot">
            <span>
              Distribuído em <strong>{accounts.length}</strong>{' '}
              {accounts.length === 1 ? 'conta ativa' : 'contas ativas'}
            </span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total de receitas</span>
            <span className="kpi-icon kpi-icon-income" aria-hidden="true">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--color-income)' }}>
            {formatSignedCurrency(totalIncome, 'INCOME', hideValues)}
          </div>
          <div className="kpi-foot">
            <span>Entradas registradas no histórico</span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total de despesas</span>
            <span className="kpi-icon kpi-icon-expense" aria-hidden="true">
              <TrendingDown size={20} />
            </span>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--color-expense)' }}>
            {formatSignedCurrency(totalExpense, 'EXPENSE', hideValues)}
          </div>
          <div className="kpi-foot">
            <span>
              Resultado líquido:{' '}
              <strong
                className="tabular-nums"
                style={{ color: netFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}
              >
                {formatSignedCurrency(netFlow, netFlow >= 0 ? 'INCOME' : 'EXPENSE', hideValues)}
              </strong>
            </span>
          </div>
        </article>
      </section>

      {accounts.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={<Wallet size={26} />}
            title="Comece criando sua primeira conta"
            description="Cadastre sua conta corrente, poupança, carteira ou investimentos para acompanhar seu saldo e registrar transações."
            action={
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setAccountModalOpen(true)}
                >
                  <Plus size={16} />
                  Criar primeira conta
                </button>
                <Link to="/assistente" className="btn btn-soft">
                  <Bot size={16} />
                  Conversar com a FinTrack IA
                </Link>
              </div>
            }
          />
        </section>
      ) : (
        <div className="dashboard-main-grid">
          <div className="stack-20">
            {/* Cashflow visual bar */}
            <section className="card" aria-labelledby="cashflow-heading">
              <div className="card-header">
                <div>
                  <h2 id="cashflow-heading" className="card-title">
                    Fluxo de caixa
                  </h2>
                  <p className="card-subtitle">Proporção entre receitas e despesas registradas</p>
                </div>
                <span className={`badge ${netFlow >= 0 ? 'badge-income' : 'badge-expense'}`}>
                  {netFlow >= 0 ? 'Superávit' : 'Déficit'}
                </span>
              </div>

              <div className="cashflow-bars">
                <div className="cashflow-row">
                  <div className="cashflow-meta">
                    <span style={{ color: 'var(--color-income)' }}>+ Receitas</span>
                    <span className="tabular-nums">{formatCurrency(totalIncome, hideValues)}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill-income"
                      style={{ width: `${Math.min(100, (totalIncome / maxFlow) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="cashflow-row">
                  <div className="cashflow-meta">
                    <span style={{ color: 'var(--color-expense)' }}>- Despesas</span>
                    <span className="tabular-nums">{formatCurrency(totalExpense, hideValues)}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill-expense"
                      style={{ width: `${Math.min(100, (totalExpense / maxFlow) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Recent transactions */}
            <section className="card" aria-labelledby="recent-tx-heading">
              <div className="card-header">
                <div>
                  <h2 id="recent-tx-heading" className="card-title">
                    Transações recentes
                  </h2>
                  <p className="card-subtitle">Últimas movimentações em suas contas</p>
                </div>
                <Link to="/transacoes" className="btn btn-ghost btn-sm">
                  Ver extrato
                  <ArrowRight size={15} />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <EmptyState
                  icon={<ArrowUpRight size={24} />}
                  title="Nenhuma transação registrada"
                  description="Clique em Nova transação no topo para lançar sua primeira receita ou despesa."
                />
              ) : (
                <div className="tx-list">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="tx-row"
                      style={{ gridTemplateColumns: 'auto 1fr auto' }}
                    >
                      <span
                        className={`tx-dir-icon ${
                          tx.type === 'INCOME' ? 'tx-dir-income' : 'tx-dir-expense'
                        }`}
                        aria-hidden="true"
                      >
                        {tx.type === 'INCOME' ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownLeft size={18} />
                        )}
                      </span>

                      <div style={{ minWidth: 0 }}>
                        <div className="tx-desc">{tx.description}</div>
                        <div className="tx-sub">
                          {tx.category} • {accountNameMap.get(tx.accountId) ?? 'Conta'} •{' '}
                          {formatDateBR(tx.date)}
                        </div>
                      </div>

                      <div
                        className={`tx-amount tabular-nums ${
                          tx.type === 'INCOME' ? 'tx-amount-income' : 'tx-amount-expense'
                        }`}
                      >
                        {formatSignedCurrency(tx.amount, tx.type, hideValues)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="stack-20">
            {/* FinTrack IA Promo Card */}
            <section className="ai-promo-card" aria-label="Atalho FinTrack IA">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.14)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FinTrackMark size={24} variant="white" />
                </div>
                <span className="badge badge-gold">Assistente Inteligente</span>
              </div>

              <h2 className="ai-promo-title">Planeje seu mês com a FinTrack IA</h2>
              <p className="ai-promo-desc">
                Tire dúvidas sobre orçamento, regra 50-30-20 e reserva de emergência em um chat
                integrado com histórico por usuário.
              </p>

              <Link to="/assistente" className="btn ai-promo-cta btn-sm">
                <Bot size={16} />
                Abrir FinTrack IA
                <ArrowRight size={15} />
              </Link>
            </section>

            {/* Accounts Strip */}
            <section className="card" aria-labelledby="dash-accounts-heading">
              <div className="card-header">
                <div>
                  <h2 id="dash-accounts-heading" className="card-title">
                    Suas contas
                  </h2>
                  <p className="card-subtitle">Saldos por instituição</p>
                </div>
                <Link to="/contas" className="btn btn-ghost btn-sm">
                  Gerenciar
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="account-mini-list">
                {accounts.slice(0, 5).map((acc) => (
                  <div key={acc.id} className="account-mini-item">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        {acc.institution ? `${acc.institution} • ` : ''}
                        {ACCOUNT_TYPE_LABELS[acc.type]}
                      </div>
                    </div>
                    <strong
                      className="tabular-nums"
                      style={{
                        color:
                          acc.balance < 0 ? 'var(--color-expense)' : 'var(--color-purple-deep)',
                      }}
                    >
                      {formatCurrency(acc.balance, hideValues)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      <AccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSubmit={async (payload) => {
          await createAccount(payload);
          showToast('Conta criada com sucesso!', 'success');
        }}
      />
    </div>
  );
}
