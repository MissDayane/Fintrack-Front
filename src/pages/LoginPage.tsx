import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { AuthHeroPanel } from '../components/brand/AuthHeroPanel';
import { FinTrackLogo } from '../components/brand/FinTrackLogo';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Informe seu email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Informe um endereço de email válido.';
    }
    if (!password) {
      errors.password = 'Informe sua senha.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      showToast('Bem-vindo(a) ao FinTrack!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        if (err.status === 401) {
          setFormError('Email ou senha incorretos. Confira seus dados e tente novamente.');
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Não foi possível realizar login. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <AuthHeroPanel />

      <main className="auth-panel">
        <div className="auth-mobile-brand">
          <FinTrackLogo variant="light" size="md" showTagline />
        </div>

        <section className="auth-card" aria-labelledby="login-heading">
          <h1 id="login-heading" className="auth-title">
            Acesse sua conta
          </h1>
          <p className="auth-subtitle">Informe seu email e senha para entrar.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="alert alert-error" role="alert">
                {formError}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="login-email">
                Email <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <User size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className={`input has-left-icon ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">
                Senha <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input has-left-icon has-right-icon ${
                    fieldErrors.password ? 'input-error' : ''
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="auth-forgot">
              Esqueceu a senha?{' '}
              <button type="button" onClick={() => setForgotOpen(true)}>
                Clique aqui
              </button>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer">
            Não Possui Conta?
            <Link to="/cadastro" className="auth-footer-gold">
              Cadastre-se
            </Link>
          </p>
        </section>
      </main>

      <Modal
        open={forgotOpen}
        title="Recuperação de senha"
        onClose={() => setForgotOpen(false)}
        footer={
          <button type="button" className="btn btn-primary" onClick={() => setForgotOpen(false)}>
            Entendi
          </button>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          O fluxo de recuperação de senha por e-mail será ativado quando o endpoint correspondente
          for disponibilizado na API. Por enquanto, você pode entrar com qualquer email válido ou
          criar uma nova conta em <strong>Cadastre-se</strong>.
        </p>
      </Modal>
    </div>
  );
}
