import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/core/auth/use-auth';

interface ActiveTenantContextValue {
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
}

const ActiveTenantContext = createContext<ActiveTenantContextValue | null>(null);

const SESSION_KEY = 'activeTenantId';

export function ActiveTenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    if (user?.role === 'PLATFORM_ADMIN') {
      return sessionStorage.getItem(SESSION_KEY) ?? '';
    }
    return user?.tenantId ?? '';
  });

  // Sync when user changes (login / logout)
  useEffect(() => {
    if (!user) {
      setActiveTenantIdState('');
      return;
    }
    if (user.role !== 'PLATFORM_ADMIN') {
      setActiveTenantIdState(user.tenantId ?? '');
    } else {
      const saved = sessionStorage.getItem(SESSION_KEY) ?? '';
      setActiveTenantIdState(saved || user.tenantId || '');
    }
  }, [user]);

  const setActiveTenantId = useCallback((id: string) => {
    sessionStorage.setItem(SESSION_KEY, id);
    setActiveTenantIdState(id);
  }, []);

  return (
    <ActiveTenantContext.Provider value={{ activeTenantId, setActiveTenantId }}>
      {children}
    </ActiveTenantContext.Provider>
  );
}

export function useActiveTenant(): ActiveTenantContextValue {
  const ctx = useContext(ActiveTenantContext);
  if (!ctx) throw new Error('useActiveTenant must be used within ActiveTenantProvider');
  return ctx;
}
