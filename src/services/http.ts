import { ApiError } from '../types';
import { safeStorage } from '../utils/storage';

export const API_MODE = (import.meta.env.VITE_API_MODE ?? 'mock').toLowerCase();
export const USE_MOCK_API = API_MODE !== 'api';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8081';

export const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8082';

const TOKEN_KEY = 'fintrack_access_token';
const EXPIRES_AT_KEY = 'fintrack_token_expires_at';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getStoredToken(): string | null {
  const token = safeStorage.getItem(TOKEN_KEY);
  const expiresAt = safeStorage.getItem(EXPIRES_AT_KEY);
  if (!token) return null;
  if (expiresAt && Date.now() >= Number(expiresAt)) {
    clearStoredAuth();
    return null;
  }
  return token;
}

export function storeAuthToken(token: string, expiresInSeconds?: number) {
  safeStorage.setItem(TOKEN_KEY, token);
  if (expiresInSeconds && expiresInSeconds > 0) {
    safeStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresInSeconds * 1000));
  } else {
    safeStorage.removeItem(EXPIRES_AT_KEY);
  }
}

export function clearStoredAuth() {
  safeStorage.removeItem(TOKEN_KEY);
  safeStorage.removeItem(EXPIRES_AT_KEY);
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  suppressUnauthorizedEvent?: boolean;
}

async function parseErrorBody(res: Response): Promise<{
  message: string;
  fieldErrors?: Record<string, string>;
}> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && !contentType.includes('problem+json')) {
    const text = await res.text().catch(() => '');
    return {
      message: text || `Erro na requisição (HTTP ${res.status}).`,
    };
  }

  try {
    const data = await res.json();
    const fieldErrors: Record<string, string> = {};

    if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      for (const [key, val] of Object.entries(data.errors)) {
        fieldErrors[key] = String(val);
      }
    } else if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        if (item?.field && item?.defaultMessage) {
          fieldErrors[item.field] = String(item.defaultMessage);
        }
      }
    } else if (data?.fields && typeof data.fields === 'object') {
      for (const [key, val] of Object.entries(data.fields)) {
        fieldErrors[key] = String(val);
      }
    }

    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      data?.title ||
      `Erro na requisição (HTTP ${res.status}).`;

    return {
      message: String(message),
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  } catch {
    return { message: `Erro na requisição (HTTP ${res.status}).` };
  }
}

function createClient(baseUrl: string) {
  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { auth = true, suppressUnauthorizedEvent = false, headers, ...rest } = options;

    const reqHeaders = new Headers(headers);
    if (!reqHeaders.has('Content-Type') && rest.body) {
      reqHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
      const token = getStoredToken();
      if (token) {
        reqHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...rest,
        headers: reqHeaders,
      });
    } catch {
      throw new ApiError(
        `Não foi possível conectar ao servidor (${baseUrl}). Verifique se a API está em execução.`,
        0,
      );
    }

    if (!response.ok) {
      const parsed = await parseErrorBody(response);
      if (response.status === 401 && !suppressUnauthorizedEvent && unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw new ApiError(parsed.message, response.status, parsed.fieldErrors);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  };
}

export const apiClient = createClient(API_BASE_URL);
export const aiClient = createClient(AI_API_BASE_URL);
