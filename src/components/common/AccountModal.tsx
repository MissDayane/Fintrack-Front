import { useState, type FormEvent } from 'react';
import { ApiError, type Account, type AccountPayload, type AccountType } from '../../types';
import {
  ACCOUNT_TYPE_LABELS,
  formatMoneyInputFromNumber,
  parseMoneyInput,
} from '../../utils/format';
import { Modal } from './Modal';

interface AccountModalProps {
  open: boolean;
  account?: Account | null;
  onClose: () => void;
  onSubmit: (payload: AccountPayload) => Promise<void>;
}

const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[];

function AccountFormContent({
  account,
  onClose,
  onSubmit,
}: Omit<AccountModalProps, 'open'>) {
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? 'CHECKING');
  const [institution, setInstitution] = useState(account?.institution ?? '');
  const [balanceText, setBalanceText] = useState(
    account ? formatMoneyInputFromNumber(account.balance) : '0,00',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = 'Informe o nome da conta.';
    }
    const parsedBalance = parseMoneyInput(balanceText);
    if (Number.isNaN(parsedBalance)) {
      nextErrors.balance = 'Informe um saldo válido (ex.: 1500,00).';
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
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        balance: parsedBalance,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar conta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="account-form" className="form-grid" onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-error">{formError}</div>}

      <div className="field">
        <label className="field-label" htmlFor="account-name">
          Nome da conta <span className="field-required">*</span>
        </label>
        <input
          id="account-name"
          className={`input ${errors.name ? 'input-error' : ''}`}
          placeholder="Ex.: Conta Corrente Principal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-row-2">
        <div className="field">
          <label className="field-label" htmlFor="account-type">
            Tipo <span className="field-required">*</span>
          </label>
          <select
            id="account-type"
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="account-balance">
            Saldo (R$) <span className="field-required">*</span>
          </label>
          <input
            id="account-balance"
            className={`input tabular-nums ${errors.balance ? 'input-error' : ''}`}
            placeholder="0,00"
            value={balanceText}
            onChange={(e) => setBalanceText(e.target.value)}
            inputMode="decimal"
          />
          {errors.balance && <span className="field-error">{errors.balance}</span>}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="account-institution">
          Instituição / Banco
        </label>
        <input
          id="account-institution"
          className="input"
          placeholder="Ex.: Nubank, Itaú, XP, Carteira"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Salvando...' : account ? 'Salvar alterações' : 'Criar conta'}
        </button>
      </div>
    </form>
  );
}

export function AccountModal({ open, account, onClose, onSubmit }: AccountModalProps) {
  return (
    <Modal open={open} title={account ? 'Editar conta' : 'Nova conta financeira'} onClose={onClose}>
      {open && (
        <AccountFormContent
          key={account?.id ?? 'new-account'}
          account={account}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
