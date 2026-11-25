import { Bot, LogOut, Server, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AI_API_BASE_URL, API_BASE_URL, USE_MOCK_API } from '../services/http';
import { getInitials } from '../utils/format';

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-grid">
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Dados da conta</h2>
            <p className="card-subtitle">Informações do usuário autenticado na sessão atual</p>
          </div>
          <span className="badge badge-income">
            <ShieldCheck size={13} />
            Ativo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div
            className="avatar"
            style={{ width: 60, height: 60, fontSize: '1.25rem' }}
            aria-hidden="true"
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              {user?.email}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
              ID: <code>{String(user?.id ?? '—')}</code>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-danger-soft"
          onClick={() => logout('Você saiu da sua conta.')}
        >
          <LogOut size={16} />
          Encerrar sessão
        </button>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Integração com a API</h2>
            <p className="card-subtitle">
              Camada de serviços desacoplada pronta para conectar ao backend Java
            </p>
          </div>
          <span className={`badge ${USE_MOCK_API ? 'badge-lavender' : 'badge-income'}`}>
            {USE_MOCK_API ? 'Modo Local (Mock)' : 'Conectado à API'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="service-status-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Server size={20} style={{ color: 'var(--color-purple-deep)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>API Principal (Java)</div>
                <code style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  {API_BASE_URL}
                </code>
              </div>
            </div>
            <span className="badge badge-lavender">
              {USE_MOCK_API ? 'Pronto p/ conectar' : 'Ativo'}
            </span>
          </div>

          <div className="service-status-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bot size={20} style={{ color: 'var(--color-purple-tech)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Microserviço de IA</div>
                <code style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  {AI_API_BASE_URL}
                </code>
              </div>
            </div>
            <span className="badge badge-lavender">
              {USE_MOCK_API ? 'Pronto p/ conectar' : 'Ativo'}
            </span>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginTop: 18 }}>
          <span>
            Para conectar este frontend à API Java depois, basta definir{' '}
            <code>VITE_API_MODE=api</code> no arquivo <code>.env</code> com as URLs dos serviços.
          </span>
        </div>
      </section>
    </div>
  );
}
