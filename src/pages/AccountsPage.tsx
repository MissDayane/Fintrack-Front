import { useState } from 'react';
import {
  Building2,
  CreditCard,
  Landmark,
  Pencil,
  PiggyBank,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { AccountModal } from '../components/common/AccountModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import type { Account, AccountType } from '../types';
import { ACCOUNT_TYPE_LABELS, formatCurrency } from '../utils/format';

function AccountTypeIcon({ type }: { type: AccountType }) {
  switch (type) {
    case 'SAVINGS':
      return <PiggyBank size={20} />;
    case 'INVESTMENT':
      return <TrendingUp size={20} />;
    case 'WALLET':
      return <Wallet size={20} />;
    case 'CREDIT_CARD':
      return <CreditCard size={20} />;
    default:
      return <Landmark size={20} />;
  }
}

export function AccountsPage() {
  const {
    accounts,
    isLoading,
    error,
    hideValues,
    totalBalance,
    refreshAll,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useFinance();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteAccount(deleting.id);
      showToast(`Conta "${deleting.name}" excluída.`, 'success');
      setDeleting(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Não foi possível excluir esta conta.',
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
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Saldo total somado nas contas cadastradas
          </p>
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-purple-deep)',
            }}
          >
            {formatCurrency(totalBalance, hideValues)}
          </div>
        </div>

        <button
          type="button"
          id="btn-new-account"
          className="btn btn-primary"
          onClick={openCreate}
        >
          <Plus size={17} />
          Nova conta
        </button>
      </div>

      {isLoading && accounts.length === 0 ? (
        <div className="accounts-grid" aria-busy="true">
          <div className="skeleton" style={{ height: 174, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 174, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 174, borderRadius: 16 }} />
        </div>
      ) : accounts.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={<Wallet size={26} />}
            title="Nenhuma conta cadastrada"
            description="Adicione suas contas bancárias, carteira ou investimentos para organizar seu patrimônio no FinTrack."
            action={
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} />
                Criar primeira conta
              </button>
            }
          />
        </section>
      ) : (
        <section className="accounts-grid" aria-label="Lista de contas">
          {accounts.map((acc) => (
            <article key={acc.id} className="account-card">
              <div className="account-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="account-icon-box" aria-hidden="true">
                    <AccountTypeIcon type={acc.type} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.02rem', fontWeight: 700 }}>{acc.name}</h2>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: 2,
                      }}
                    >
                      <Building2 size={13} />
                      <span>{acc.institution || 'Instituição não informada'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', gap: 2 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => openEdit(acc)}
                    aria-label={`Editar ${acc.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setDeleting(acc)}
                    aria-label={`Excluir ${acc.name}`}
                    style={{ color: 'var(--color-expense)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <span className="badge badge-lavender">{ACCOUNT_TYPE_LABELS[acc.type]}</span>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Saldo atual
                </div>
                <div className={`account-balance tabular-nums ${acc.balance < 0 ? 'negative' : ''}`}>
                  {formatCurrency(acc.balance, hideValues)}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <AccountModal
        open={modalOpen}
        account={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await updateAccount(editing.id, payload);
            showToast('Conta atualizada com sucesso!', 'success');
          } else {
            await createAccount(payload);
            showToast('Conta criada com sucesso!', 'success');
          }
        }}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        title="Excluir conta financeira"
        description={`Tem certeza que deseja excluir a conta "${deleting?.name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir conta"
        isLoading={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
