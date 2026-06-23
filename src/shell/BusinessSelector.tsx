import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '@/core/auth/use-auth';
import { useActiveTenant } from '@/core/tenant/ActiveTenantContext';
import { useAdminTenants } from '@/modules/admin/api/use-admin-tenants';
import { cn } from '@/design-system/lib/utils';

export function BusinessSelector() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeTenantId, setActiveTenantId } = useActiveTenant();
  const { data: tenants, isLoading } = useAdminTenants();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const items = tenants ?? [];
  const activeTenant = items.find((tenant) => tenant.id === activeTenantId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (items.length === 0) return;
    if (activeTenantId && items.some((tenant) => tenant.id === activeTenantId)) return;
    setActiveTenantId(items[0].id);
  }, [items, activeTenantId, setActiveTenantId]);

  if (user?.role !== 'PLATFORM_ADMIN') return null;

  const isWaitingForTenants = isLoading && items.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={isWaitingForTenants}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted',
          isWaitingForTenants && 'cursor-not-allowed opacity-50',
        )}
      >
        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="max-w-[140px] truncate">
          {activeTenant?.name ?? t('shell.selectBusiness')}
        </span>
        <ChevronDown
          className={cn(
            'size-3 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t('shell.switchBusiness')}
          className="absolute right-0 top-[calc(100%+0.25rem)] z-[100] w-56 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-floating"
        >
          {items.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">{t('shell.noBusinesses')}</p>
          ) : (
            items.map((tenant) => {
              const isActive = tenant.id === activeTenantId;
              return (
                <button
                  key={tenant.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveTenantId(tenant.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent/60 font-medium text-foreground',
                  )}
                >
                  <span className="truncate">{tenant.name}</span>
                  {isActive ? <Check className="size-3.5 shrink-0 text-primary" /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
