import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { queryClient } from '@/core/query/client';
import { api, ApiError, refreshAuthTokens, setUnauthorizedHandler } from '@/core/api/client';
import {
  clearTokens,
  hasPersistedAuth,
  isAccessTokenExpired,
  loadStoredSession,
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
  expiresIn?: string;
  session: BackendSession;
}

interface AuthTokensResponse {
  idToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

interface AuthContextValue {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (req: LoginRequest) => Promise<User>;
  signUp: (req: SignUpRequest) => Promise<User>;
  acceptInvite: (token: string) => Promise<User>;
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

async function fetchSession(): Promise<BackendSession> {
  return api.post<BackendSession>('/auth/session');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  const markUnauthenticated = useCallback(() => {
    queryClient.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const session = await fetchSession();
      setUser(mapSessionUser(session));
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearTokens();
      }
      markUnauthenticated();
    }
  }, [markUnauthenticated]);

  useEffect(() => {
    setUnauthorizedHandler(markUnauthenticated);
    return () => setUnauthorizedHandler(null);
  }, [markUnauthenticated]);

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!hasPersistedAuth()) {
          markUnauthenticated();
          return;
        }

        const stored = loadStoredSession();
        if (stored && isAccessTokenExpired(stored)) {
          const refreshed = await refreshAuthTokens();
          if (!refreshed) {
            clearTokens();
            markUnauthenticated();
            return;
          }
        }

        await loadMe();
      } catch {
        clearTokens();
        markUnauthenticated();
      } finally {
        setStatus((current) => (current === 'loading' ? 'unauthenticated' : current));
      }
    }

    void bootstrap();
  }, [loadMe, markUnauthenticated]);

  const login = useCallback(async (req: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', req, { skipAuth: true });
    setTokens({
      accessToken: response.idToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    });
    queryClient.clear();
    const nextUser = mapSessionUser(response.session);
    setUser(nextUser);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const signUp = useCallback(
    async (req: SignUpRequest) => {
      const response = await api.post<AuthTokensResponse>(
        '/auth/signup',
        { email: req.email, password: req.password },
        { skipAuth: true },
      );
      setTokens({
        accessToken: response.idToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });
      queryClient.clear();
      const session = await fetchSession();
      const nextUser = mapSessionUser(session);
      setUser(nextUser);
      setStatus('authenticated');
      return nextUser;
    },
    [],
  );

  const acceptInvite = useCallback(async (token: string) => {
    const session = await api.post<BackendSession>('/auth/accept-invite', { token });
    const nextUser = mapSessionUser(session);
    setUser(nextUser);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    markUnauthenticated();
  }, [markUnauthenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, signUp, acceptInvite, logout, refresh: loadMe }),
    [user, status, login, signUp, acceptInvite, logout, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
