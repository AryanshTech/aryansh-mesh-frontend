import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '@/core/auth/use-auth';
import { useActiveTenant } from '@/core/tenant/ActiveTenantContext';
import { useAdminTenants } from '@/modules/admin/api/use-admin-tenants';
import { cn } from '@/design-system/lib/utils';

const MENU_WIDTH = 224;

export function BusinessSelector() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeTenantId, setActiveTenantId } = useActiveTenant();
  const { data: tenants, isLoading, isError, refetch } = useAdminTenants();

  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const items = tenants ?? [];
  const activeTenant = items.find((tenant) => tenant.id === activeTenantId);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8,
      );
      setMenuStyle({ top: rect.bottom + 4, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (items.length === 0) return;
    if (activeTenantId && items.some((tenant) => tenant.id === activeTenantId)) return;
    setActiveTenantId(items[0].id);
  }, [items, activeTenantId, setActiveTenantId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    let onMouseDown: ((event: MouseEvent) => void) | null = null;
    const timerId = window.setTimeout(() => {
      onMouseDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (triggerRef.current?.contains(target)) return;
        if (menuRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('mousedown', onMouseDown);
    }, 0);

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener('keydown', onKeyDown);
      if (onMouseDown) document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  if (user?.role !== 'PLATFORM_ADMIN') return null;

  const isWaitingForTenants = isLoading && items.length === 0;

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={t('shell.switchBusiness')}
            style={{ top: menuStyle.top, left: menuStyle.left, width: MENU_WIDTH }}
            className="fixed z-[300] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-floating"
          >
            {isError ? (
              <div className="flex flex-col gap-2 px-2 py-1.5">
                <p className="text-xs text-destructive">{t('shell.tenantLoadFailed')}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="text-left text-xs text-primary hover:underline"
                >
                  {t('shell.retry')}
                </button>
              </div>
            ) : items.length === 0 ? (
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
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={isWaitingForTenants}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted',
          open && 'bg-muted',
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
      {menu}
    </>
  );
}
