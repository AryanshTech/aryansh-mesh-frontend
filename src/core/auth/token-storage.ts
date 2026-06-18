const STORAGE_KEY = 'aryansh-mesh.auth';

export interface StoredAuthTokens {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function loadAuthTokens(): StoredAuthTokens | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthTokens;
    if (!parsed.idToken || !parsed.refreshToken || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthTokens(tokens: {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}): StoredAuthTokens {
  const expiresInSeconds = Number.parseInt(tokens.expiresIn, 10);
  const stored: StoredAuthTokens = {
    idToken: tokens.idToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + (Number.isFinite(expiresInSeconds) ? expiresInSeconds : 3600) * 1000,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function updateIdToken(idToken: string, expiresIn: string): StoredAuthTokens | null {
  const current = loadAuthTokens();
  if (!current) return null;
  const expiresInSeconds = Number.parseInt(expiresIn, 10);
  const stored: StoredAuthTokens = {
    ...current,
    idToken,
    expiresAt: Date.now() + (Number.isFinite(expiresInSeconds) ? expiresInSeconds : 3600) * 1000,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function clearAuthTokens(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isTokenExpired(tokens: StoredAuthTokens, skewMs = 60_000): boolean {
  return Date.now() >= tokens.expiresAt - skewMs;
}
