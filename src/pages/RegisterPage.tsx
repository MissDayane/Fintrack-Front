import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AuthHeroPanel } from '../components/brand/AuthHeroPanel';
import { FinTrackLogo } from '../components/brand/FinTrackLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Informe seu nome completo.';
    }
    if (!email.trim()) {
      errors.email = 'Informe seu email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Informe um endereço de email válido.';
    }
    if (!password || password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setFormError(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir seu cadastro. Tente novamente.',
      );
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

        <section className="auth-card" aria-labelledby="register-heading">
          <h1 id="register-heading" className="auth-title">
            Crie sua conta
          </h1>
          <p className="auth-subtitle">
            Comece a controlar seu dinheiro com clareza em poucos segundos.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="alert alert-error" role="alert">
                {formError}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="reg-name">
                Nome completo <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <User size={18} />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  className={`input has-left-icon ${fieldErrors.name ? 'input-error' : ''}`}
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-email">
                Email <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="reg-email"
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
              <label className="field-label" htmlFor="reg-password">
                Senha <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input has-left-icon has-right-icon ${
                    fieldErrors.password ? 'input-error' : ''
                  }`}
                  placeholder="Mínimo 6 caracteres"
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

            <div className="field">
              <label className="field-label" htmlFor="reg-confirm">
                Confirmar senha <span className="field-required">*</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-left" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input has-left-icon ${
                    fieldErrors.confirmPassword ? 'input-error' : ''
                  }`}
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              id="btn-register-submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="auth-footer">
            Já possui conta?
            <Link to="/login" className="auth-footer-gold">
              Entrar
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
