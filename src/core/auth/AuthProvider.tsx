import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/core/api/client';
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from '@/core/auth/token-storage';
import type {
  LoginRequest,
  SignUpRequest,
  User,
} from '@/core/auth/types';

interface BackendSession {
  uid: string;
  email: string;
  displayName?: string | null;
  accessLevel: string;
  businessRole?: string | null;
  role: string;
  tenantId?: string | null;
}

interface LoginResponse {
  idToken: string;
  refreshToken?: string;
  session: BackendSession;
}

interface AuthTokensResponse {
  idToken: string;
  refreshToken?: string;
}

interface AuthContextValue {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (req: LoginRequest) => Promise<void>;
  signUp: (req: SignUpRequest) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSessionUser(session: BackendSession): User {
  const role: User['role'] =
    session.accessLevel === 'platform_admin'
      ? 'PLATFORM_ADMIN'
      : session.role === 'tenant_owner'
        ? 'OWNER'
        : session.role === 'tenant_admin'
          ? 'ADMIN'
          : 'MEMBER';

  return {
    id: session.uid,
    email: session.email,
    name: session.displayName || session.email,
    role,
    tenantId: session.tenantId ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  const loadMe = useCallback(async () => {
    try {
      const session = await api.post<BackendSession>('/auth/session');
      setUser(mapSessionUser(session));
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
      clearTokens();
    }
  }, []);

  useEffect(() => {
    if (getAccessToken()) {
      void loadMe();
    } else {
      setStatus('unauthenticated');
    }
  }, [loadMe]);

  const login = useCallback(
    async (req: LoginRequest) => {
      const response = await api.post<LoginResponse>('/auth/login', req, { skipAuth: true });
      setTokens({ accessToken: response.idToken, refreshToken: response.refreshToken });
      setUser(mapSessionUser(response.session));
      setStatus('authenticated');
    },
    []
  );

  const signUp = useCallback(
    async (req: SignUpRequest) => {
      const response = await api.post<AuthTokensResponse>('/auth/signup', req, { skipAuth: true });
      setTokens({ accessToken: response.idToken, refreshToken: response.refreshToken });
      await loadMe();
    },
    [loadMe]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, signUp, logout, refresh: loadMe }),
    [user, status, login, signUp, logout, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
