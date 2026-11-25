import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';
import { DEMO_USER } from '../utils/demoData';
import { safeStorage } from '../utils/storage';
import { USE_MOCK_API, apiClient } from './http';

const MOCK_USERS_KEY = 'fintrack_mock_users';
const MOCK_ACTIVE_USER_KEY = 'fintrack_mock_active_user';

interface StoredMockUser extends User {
  password: string;
}

function readMockUsers(): StoredMockUser[] {
  const raw = safeStorage.getItem(MOCK_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredMockUser[];
  } catch {
    return [];
  }
}

function writeMockUsers(users: StoredMockUser[]) {
  safeStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'Usuário';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 250));
      const users = readMockUsers();
      const created: StoredMockUser = {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: payload.password,
      };
      const filtered = users.filter((u) => u.email !== created.email);
      writeMockUsers([...filtered, created]);
      return { id: created.id, name: created.name, email: created.email };
    }

    return apiClient<User>('/users', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 280));
      const normalizedEmail = payload.email.trim().toLowerCase();
      const users = readMockUsers();
      const found = users.find((u) => u.email === normalizedEmail);
      const user: User = found
        ? { id: found.id, name: found.name, email: found.email }
        : {
            id: DEMO_USER.id,
            name: nameFromEmail(normalizedEmail),
            email: normalizedEmail,
          };

      safeStorage.setItem(MOCK_ACTIVE_USER_KEY, JSON.stringify(user));
      return {
        accessToken: `mock-jwt-${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        user,
      };
    }

    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      suppressUnauthorizedEvent: true,
      body: JSON.stringify(payload),
    });
  },

  async me(): Promise<User> {
    if (USE_MOCK_API) {
      const raw = safeStorage.getItem(MOCK_ACTIVE_USER_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as User;
        } catch {
          return DEMO_USER;
        }
      }
      return DEMO_USER;
    }

    return apiClient<User>('/auth/me', {
      method: 'GET',
      auth: true,
      suppressUnauthorizedEvent: true,
    });
  },

  async checkStatus(): Promise<{ online: boolean; detail?: string }> {
    if (USE_MOCK_API) {
      return { online: true, detail: 'Frontend standalone (dados locais)' };
    }

    try {
      const res = await apiClient<unknown>('/api/status', {
        method: 'GET',
        auth: false,
      });
      return {
        online: true,
        detail: typeof res === 'string' ? res : 'API operacional',
      };
    } catch {
      return { online: false };
    }
  },
};
