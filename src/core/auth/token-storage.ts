/**
 * Token storage — accessToken in memory + sessionStorage,
 * refreshToken via httpOnly cookie (managed by backend).
 * We also stash accessToken in localStorage so a hard refresh recovers session.
 */

const ACCESS_KEY = 'mesh_access_token';
const REFRESH_KEY = 'mesh_refresh_token';

let memoryAccess: string | null = null;

function safeLocal(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (memoryAccess) return memoryAccess;
  const ls = safeLocal();
  if (!ls) return null;
  memoryAccess = ls.getItem(ACCESS_KEY);
  return memoryAccess;
}

export function getRefreshToken(): string | null {
  return safeLocal()?.getItem(REFRESH_KEY) ?? null;
}

export function setTokens(tokens: { accessToken: string; refreshToken?: string }) {
  memoryAccess = tokens.accessToken;
  const ls = safeLocal();
  if (ls) {
    ls.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) ls.setItem(REFRESH_KEY, tokens.refreshToken);
  }
}

export function clearTokens() {
  memoryAccess = null;
  const ls = safeLocal();
  if (ls) {
    ls.removeItem(ACCESS_KEY);
    ls.removeItem(REFRESH_KEY);
  }
}
