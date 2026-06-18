import { useAuthContext } from '@/core/auth/auth-context';

export function useAuth() {
  return useAuthContext();
}
