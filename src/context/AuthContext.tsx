import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import {
  clearStoredAuth,
  getStoredToken,
  setUnauthorizedHandler,
  storeAuthToken,
} from '../services/http';
import type { LoginPayload, RegisterPayload, User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(
    (reason?: string) => {
      clearStoredAuth();
      setUser(null);
      if (reason) {
        showToast(reason, 'info');
      }
    },
    [showToast],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout('Sua sessão expirou. Faça login novamente.');
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (active) setIsInitializing(false);
        return;
      }

      try {
        const me = await authService.me();
        if (active) setUser(me);
      } catch {
        clearStoredAuth();
        if (active) setUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    storeAuthToken(response.accessToken, response.expiresIn);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
