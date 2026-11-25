import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { TransactionModal } from '../components/common/TransactionModal';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import type { Transaction } from '../types';
import {
  TRANSACTION_CATEGORIES,
  formatDateBR,
  formatSignedCurrency,
} from '../utils/format';

export function TransactionsPage() {
  const {
    accounts,
    transactions,
    isLoading,
    error,
    hideValues,
    refreshAll,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinance();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const accountNameMap = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc.name])),
    [accounts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (accountFilter !== 'ALL' && tx.accountId !== accountFilter) return false;
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
      if (q) {
        const accountName = (accountNameMap.get(tx.accountId) ?? '').toLowerCase();
        const match =
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          accountName.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, accountFilter, categoryFilter, accountNameMap]);

  const filteredTotals = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    typeFilter !== 'ALL' ||
    accountFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  function clearFilters() {
    setSearch('');
    setTypeFilter('ALL');
    setAccountFilter('ALL');
    setCategoryFilter('ALL');
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleting.id);
      showToast('Transação excluída com sucesso.', 'success');
      setDeleting(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Não foi possível excluir esta transação.',
        'error',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 18, alignItems: 'center' }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={refreshAll}>
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="page-toolbar">
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
            {filtered.length} {filtered.length === 1 ? 'movimentação exibida' : 'movimentações exibidas'}
          </p>
        </div>

        <button
          type="button"
          id="btn-new-transaction"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={17} />
          Nova transação
        </button>
      </div>

      {/* Filtered summary */}
      <section className="tx-summary-strip" aria-label="Totais do extrato filtrado">
        <div className="tx-summary-pill">
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Entradas no filtro
          </span>
          <strong className="tabular-nums" style={{ fontSize: '1.15rem', color: 'var(--color-income)' }}>
            {formatSignedCurrency(filteredTotals.income, 'INCOME', hideValues)}
          </strong>
        </div>
        <div className="tx-summary-pill">
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Saídas no filtro
          </span>
          <strong className="tabular-nums" style={{ fontSize: '1.15rem', color: 'var(--color-expense)' }}>
            {formatSignedCurrency(filteredTotals.expense, 'EXPENSE', hideValues)}
          </strong>
        </div>
        <div className="tx-summary-pill">
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Resultado líquido
          </span>
          <strong
            className="tabular-nums"
            style={{
              fontSize: '1.15rem',
              color:
                filteredTotals.net >= 0 ? 'var(--color-purple-deep)' : 'var(--color-expense)',
            }}
          >
            {formatSignedCurrency(
              filteredTotals.net,
              filteredTotals.net >= 0 ? 'INCOME' : 'EXPENSE',
              hideValues,
            )}
          </strong>
        </div>
      </section>

      {/* Filters */}
      <section className="card" style={{ marginBottom: 18, padding: 16 }} aria-label="Filtros de transações">
        <div className="filters-bar" style={{ marginBottom: hasActiveFilters ? 10 : 0 }}>
          <div className="input-wrap">
            <span className="input-icon-left" aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>
              <Search size={17} />
            </span>
            <input
              type="search"
              className="input has-left-icon"
              placeholder="Buscar descrição, categoria ou conta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar transações"
            />
          </div>

          <select
            className="select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
            aria-label="Filtrar por tipo"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="INCOME">Receitas (+)</option>
            <option value="EXPENSE">Despesas (-)</option>
          </select>

          <select
            className="select"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            aria-label="Filtrar por conta"
          >
            <option value="ALL">Todas as contas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="ALL">Todas as categorias</option>
            {TRANSACTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* Transactions List */}
      <section className="card" style={{ padding: '8px 18px' }} aria-label="Lista de transações">
        {isLoading && transactions.length === 0 ? (
          <div className="stack-20" style={{ padding: '16px 0' }} aria-busy="true">
            <div className="skeleton" style={{ height: 54 }} />
            <div className="skeleton" style={{ height: 54 }} />
            <div className="skeleton" style={{ height: 54 }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={24} />}
            title={
              hasActiveFilters
                ? 'Nenhuma transação encontrada com esses filtros'
                : 'Nenhuma transação registrada'
            }
            description={
              hasActiveFilters
                ? 'Ajuste ou limpe os filtros acima para visualizar outras movimentações.'
                : 'Registre suas receitas e despesas para acompanhar o fluxo financeiro em tempo real.'
            }
            action={
              hasActiveFilters ? (
                <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                  Limpar filtros
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Registrar transação
                </button>
              )
            }
          />
        ) : (
          <div className="tx-list">
            {filtered.map((tx) => (
              <article key={tx.id} className="tx-row">
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
                    {accountNameMap.get(tx.accountId) ?? 'Conta removida'} • {formatDateBR(tx.date)}
                  </div>
                </div>

                <div className="tx-hide-mobile">
                  <span className="badge badge-lavender">{tx.category}</span>
                </div>

                <div className="tx-hide-mobile">
                  <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                    {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </div>

                <div
                  className={`tx-amount tabular-nums ${
                    tx.type === 'INCOME' ? 'tx-amount-income' : 'tx-amount-expense'
                  }`}
                >
                  {formatSignedCurrency(tx.amount, tx.type, hideValues)}
                </div>

                <div className="tx-actions tx-hide-mobile">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      setEditing(tx);
                      setModalOpen(true);
                    }}
                    aria-label={`Editar ${tx.description}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setDeleting(tx)}
                    aria-label={`Excluir ${tx.description}`}
                    style={{ color: 'var(--color-expense)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <TransactionModal
        open={modalOpen}
        accounts={accounts}
        transaction={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await updateTransaction(editing.id, payload);
            showToast('Transação atualizada com sucesso!', 'success');
          } else {
            await createTransaction(payload);
            showToast('Transação registrada com sucesso!', 'success');
          }
        }}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        title="Excluir transação"
        description={`Deseja realmente excluir "${deleting?.description}"? O saldo das contas será atualizado após a exclusão.`}
        confirmLabel="Excluir transação"
        isLoading={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
