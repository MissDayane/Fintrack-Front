import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Bot,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Plus,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/format';
import { FinTrackLogo } from '../brand/FinTrackLogo';
import { TransactionModal } from '../common/TransactionModal';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contas', label: 'Contas', icon: Wallet },
  { to: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { to: '/assistente', label: 'FinTrack IA', icon: Bot, badge: 'IA' },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
];

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/contas': 'Minhas Contas',
  '/transacoes': 'Transações',
  '/assistente': 'FinTrack IA',
  '/perfil': 'Perfil',
};

export function AppShell() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { accounts, hideValues, toggleHideValues, createTransaction } = useFinance();
  const { showToast } = useToast();
  const [quickTxOpen, setQuickTxOpen] = useState(false);

  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'FinTrack';

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="sidebar-brand">
          <FinTrackLogo variant="dark" size="sm" showTagline />
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {badge && <span className="nav-item-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={() => logout('Você saiu da sua conta.')}
          >
            <LogOut size={17} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="header-left">
            <h1 className="header-title">{pageTitle}</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn icon-btn-outlined"
              onClick={toggleHideValues}
              aria-label={hideValues ? 'Mostrar valores monetários' : 'Ocultar valores monetários'}
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {hideValues ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <button
              type="button"
              id="btn-quick-transaction"
              className="btn btn-primary btn-sm"
              onClick={() => setQuickTxOpen(true)}
            >
              <Plus size={16} />
              <span className="hide-sm">Nova transação</span>
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Navegação mobile">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label === 'FinTrack IA' ? 'IA' : label}</span>
          </NavLink>
        ))}
      </nav>

      <TransactionModal
        open={quickTxOpen}
        accounts={accounts}
        onClose={() => setQuickTxOpen(false)}
        onSubmit={async (payload) => {
          await createTransaction(payload);
          showToast('Transação registrada com sucesso!', 'success');
        }}
      />
    </div>
  );
}
