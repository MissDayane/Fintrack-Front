import { useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  ApiError,
  type Account,
  type Transaction,
  type TransactionPayload,
  type TransactionType,
} from '../../types';
import {
  TRANSACTION_CATEGORIES,
  formatMoneyInputFromNumber,
  parseMoneyInput,
} from '../../utils/format';
import { Modal } from './Modal';

interface TransactionModalProps {
  open: boolean;
  accounts: Account[];
  transaction?: Transaction | null;
  onClose: () => void;
  onSubmit: (payload: TransactionPayload) => Promise<void>;
}

function TransactionFormContent({
  accounts,
  transaction,
  onClose,
  onSubmit,
}: Omit<TransactionModalProps, 'open'>) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'EXPENSE');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [amountText, setAmountText] = useState(
    transaction ? formatMoneyInputFromNumber(transaction.amount) : '',
  );
  const [accountId, setAccountId] = useState(transaction?.accountId ?? accounts[0]?.id ?? '');
  const [category, setCategory] = useState(
    transaction?.category ?? (transaction?.type === 'INCOME' ? 'Salário' : 'Alimentação'),
  );
  const [date, setDate] = useState(
    () => transaction?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!description.trim()) {
      nextErrors.description = 'Informe uma descrição para a transação.';
    }
    const parsedAmount = parseMoneyInput(amountText);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Informe um valor maior que zero (ex.: 120,50).';
    }
    if (!accountId) {
      nextErrors.accountId = 'Selecione uma conta.';
    }
    if (!date) {
      nextErrors.date = 'Informe a data da transação.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSaving(true);
    try {
      await onSubmit({
        type,
        description: description.trim(),
        amount: parsedAmount,
        accountId,
        category,
        date,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar transação.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="transaction-form" className="form-grid" onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-error">{formError}</div>}

      {accounts.length === 0 && (
        <div className="alert alert-warning">
          Crie ao menos uma conta financeira em <strong>Contas</strong> antes de registrar uma
          transação.
        </div>
      )}

      <div className="field">
        <span className="field-label">Tipo de movimentação</span>
        <div className="type-segment" role="group" aria-label="Tipo de transação">
          <button
            type="button"
            className={`type-segment-btn ${type === 'EXPENSE' ? 'active-expense' : ''}`}
            onClick={() => setType('EXPENSE')}
          >
            <ArrowDownLeft size={16} />
            Despesa (-)
          </button>
          <button
            type="button"
            className={`type-segment-btn ${type === 'INCOME' ? 'active-income' : ''}`}
            onClick={() => setType('INCOME')}
          >
            <ArrowUpRight size={16} />
            Receita (+)
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="tx-description">
          Descrição <span className="field-required">*</span>
        </label>
        <input
          id="tx-description"
          className={`input ${errors.description ? 'input-error' : ''}`}
          placeholder="Ex.: Supermercado, Salário, Aluguel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-row-2">
        <div className="field">
          <label className="field-label" htmlFor="tx-amount">
            Valor (R$) <span className="field-required">*</span>
          </label>
          <input
            id="tx-amount"
            className={`input tabular-nums ${errors.amount ? 'input-error' : ''}`}
            placeholder="0,00"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            inputMode="decimal"
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="tx-date">
            Data <span className="field-required">*</span>
          </label>
          <input
            id="tx-date"
            type="date"
            className={`input ${errors.date ? 'input-error' : ''}`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>
      </div>

      <div className="form-row-2">
        <div className="field">
          <label className="field-label" htmlFor="tx-account">
            Conta <span className="field-required">*</span>
          </label>
          <select
            id="tx-account"
            className={`select ${errors.accountId ? 'input-error' : ''}`}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          {errors.accountId && <span className="field-error">{errors.accountId}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="tx-category">
            Categoria
          </label>
          <select
            id="tx-category"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {TRANSACTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving || accounts.length === 0}
        >
          {isSaving ? 'Salvando...' : transaction ? 'Salvar alterações' : 'Registrar transação'}
        </button>
      </div>
    </form>
  );
}

export function TransactionModal({
  open,
  accounts,
  transaction,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  return (
    <Modal open={open} title={transaction ? 'Editar transação' : 'Nova transação'} onClose={onClose}>
      {open && (
        <TransactionFormContent
          key={transaction?.id ?? 'new-transaction'}
          accounts={accounts}
          transaction={transaction}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
