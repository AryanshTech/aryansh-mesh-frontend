/**
 * Persists auth tokens in localStorage so sessions survive refresh and new tabs.
 * Access tokens are refreshed proactively using the stored refresh token.
 */

const STORAGE_KEY = 'mesh_auth_session';
const LEGACY_ACCESS_KEY = 'mesh_access_token';
const LEGACY_REFRESH_KEY = 'mesh_refresh_token';
const DEFAULT_EXPIRES_SECONDS = 3600;
const EXPIRY_SKEW_MS = 60_000;

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

let memoryAccess: string | null = null;

function safeLocal(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseExpiresIn(expiresIn?: string | number): number {
  if (expiresIn === undefined) return DEFAULT_EXPIRES_SECONDS;
  const seconds = typeof expiresIn === 'number' ? expiresIn : Number.parseInt(expiresIn, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_EXPIRES_SECONDS;
}

function persistSession(session: StoredAuthSession) {
  const ls = safeLocal();
  if (!ls) return;
  ls.setItem(STORAGE_KEY, JSON.stringify(session));
}

function migrateLegacyKeys(ls: Storage): StoredAuthSession | null {
  const accessToken = ls.getItem(LEGACY_ACCESS_KEY);
  const refreshToken = ls.getItem(LEGACY_REFRESH_KEY);
  if (!accessToken) return null;

  const session: StoredAuthSession = {
    accessToken,
    refreshToken: refreshToken ?? '',
    expiresAt: Date.now() + DEFAULT_EXPIRES_SECONDS * 1000,
  };
  persistSession(session);
  ls.removeItem(LEGACY_ACCESS_KEY);
  ls.removeItem(LEGACY_REFRESH_KEY);
  return session;
}

export function loadStoredSession(): StoredAuthSession | null {
  const ls = safeLocal();
  if (!ls) return null;

  const raw = ls.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
      if (parsed.accessToken) {
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken ?? '',
          expiresAt:
            parsed.expiresAt ?? Date.now() + DEFAULT_EXPIRES_SECONDS * 1000,
        };
      }
    } catch {
      /* fall through to legacy migration */
    }
  }

  return migrateLegacyKeys(ls);
}

export function isAccessTokenExpired(
  session: StoredAuthSession,
  skewMs = EXPIRY_SKEW_MS,
): boolean {
  return Date.now() >= session.expiresAt - skewMs;
}

export function hasPersistedAuth(): boolean {
  const session = loadStoredSession();
  if (!session) return false;
  return Boolean(session.accessToken || session.refreshToken);
}

export function getAccessToken(): string | null {
  if (memoryAccess) return memoryAccess;
  const session = loadStoredSession();
  if (!session?.accessToken) return null;
  memoryAccess = session.accessToken;
  return memoryAccess;
}

export function getRefreshToken(): string | null {
  const session = loadStoredSession();
  return session?.refreshToken ?? null;
}

export function setTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string | number;
}) {
  const current = loadStoredSession();
  const refreshToken = tokens.refreshToken ?? current?.refreshToken ?? '';
  const session: StoredAuthSession = {
    accessToken: tokens.accessToken,
    refreshToken,
    expiresAt: Date.now() + parseExpiresIn(tokens.expiresIn) * 1000,
  };
  memoryAccess = session.accessToken;
  persistSession(session);
}

export function clearTokens() {
  memoryAccess = null;
  const ls = safeLocal();
  if (!ls) return;
  ls.removeItem(STORAGE_KEY);
  ls.removeItem(LEGACY_ACCESS_KEY);
  ls.removeItem(LEGACY_REFRESH_KEY);
}
