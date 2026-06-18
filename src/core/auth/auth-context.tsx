import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, configureApiClient, ApiError } from '@/core/api/client';
import { authApi } from '@/core/api/auth-api';
import type { MarketingRole, MeResponse, SessionResponse } from '@/core/auth/types';
import {
  clearAuthTokens,
  isTokenExpired,
  loadAuthTokens,
  saveAuthTokens,
} from '@/core/auth/token-storage';

interface AuthContextValue {
  isAuthenticated: boolean;
  session: SessionResponse | null;
  profile: MeResponse | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SessionResponse>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  acceptInvite: (token: string) => Promise<SessionResponse>;
  refreshSession: () => Promise<SessionResponse | null>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getToken: (forceRefresh?: boolean) => Promise<string | null>;
  hasRole: (...roles: MarketingRole[]) => boolean;
  canWrite: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAccessLevelToRole(accessLevel?: string): MarketingRole {
  if (accessLevel === 'platform_admin') return 'ADMIN';
  if (accessLevel === 'platform_team') return 'MEMBER';
  return 'VIEWER';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (forceRefresh = false) => {
    const stored = loadAuthTokens();
    if (!stored) return null;

    if (!forceRefresh && !isTokenExpired(stored)) {
      return stored.idToken;
    }

    try {
      const refreshed = await authApi.refresh(stored.refreshToken);
      saveAuthTokens(refreshed);
      return refreshed.idToken;
    } catch {
      clearAuthTokens();
      return null;
    }
  }, []);

  const loadProfile = useCallback(async () => {
    const me = await authApi.me();
    setProfile(me);
    return me;
  }, []);

  const applyLoginResponse = useCallback(
    async (response: Awaited<ReturnType<typeof authApi.login>>) => {
      saveAuthTokens(response);
      setSession(response.session);
      await loadProfile();
      return response.session;
    },
    [loadProfile],
  );

  const refreshSession = useCallback(async () => {
    const token = await getIdToken(true);
    if (!token) {
      setSession(null);
      setProfile(null);
      return null;
    }
    const data = await authApi.session();
    setSession(data);
    await loadProfile();
    return data;
  }, [getIdToken, loadProfile]);

  const signOut = useCallback(async () => {
    clearAuthTokens();
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    configureApiClient({
      getToken: (forceRefresh) => getIdToken(forceRefresh ?? false),
      onUnauthorized: () => {
        void signOut();
      },
    });
  }, [getIdToken, signOut]);

  useEffect(() => {
    async function bootstrap() {
      const stored = loadAuthTokens();
      if (!stored) {
        setLoading(false);
        return;
      }

      const guestPaths = ['/signup', '/accept-invite', '/login', '/forgot-password'];
      const onGuestPath = guestPaths.some((path) =>
        window.location.pathname.startsWith(path),
      );
      const onSignupPath = window.location.pathname.startsWith('/signup');

      try {
        if (onSignupPath) {
          setSession(null);
          setProfile(null);
        } else {
          const data = await authApi.session();
          setSession(data);
          await loadProfile();
        }
      } catch {
        setSession(null);
        setProfile(null);
        if (!onGuestPath) {
          clearAuthTokens();
        }
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      return applyLoginResponse(response);
    },
    [applyLoginResponse],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.signUp(email, password);
    saveAuthTokens(tokens);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authApi.passwordReset(email.trim());
  }, []);

  const acceptInvite = useCallback(
    async (token: string) => {
      const data = await authApi.acceptInvite(token);
      setSession(data);
      await loadProfile();
      return data;
    },
    [loadProfile],
  );

  const marketingRole = mapAccessLevelToRole(profile?.accessLevel);

  const hasRole = useCallback(
    (...roles: MarketingRole[]) => roles.includes(marketingRole),
    [marketingRole],
  );

  const isAuthenticated = Boolean(session);

  const value = useMemo(
    () => ({
      isAuthenticated,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      resetPassword,
      acceptInvite,
      getIdToken,
      getToken: getIdToken,
      hasRole,
      canWrite: hasRole('ADMIN', 'MEMBER'),
      isAdmin: hasRole('ADMIN'),
    }),
    [
      isAuthenticated,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      resetPassword,
      acceptInvite,
      getIdToken,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}

/** Alias for marketing module compatibility */
export const useAuth = useAuthContext;

export async function apiFetchWithRetry<T>(
  fetcher: (token: string) => Promise<T>,
  getToken: (force?: boolean) => Promise<string | null>,
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ApiError(401, { code: 'UNAUTHORIZED', message: 'Not authenticated' });

  try {
    return await fetcher(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await getToken(true);
      if (!refreshed) throw err;
      return fetcher(refreshed);
    }
    throw err;
  }
}

export { api };
