import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/design-system/components/ui/command';
import { useShellCommandPalette } from '@/shell/CommandPaletteContext';
import { NAV_ITEMS, SECTION_LABELS } from '@/shell/navigation';
import { useAuth } from '@/core/auth/use-auth';
import { useActiveTenant } from '@/core/tenant/ActiveTenantContext';
import { useAdminTenants } from '@/modules/admin/api/use-admin-tenants';

export function CommandPalette() {
  const { isOpen, open, close, toggle } = useShellCommandPalette();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { activeTenantId, setActiveTenantId } = useActiveTenant();
  const { data: tenants } = useAdminTenants();

  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const grouped = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    if (item.requireRole === 'PLATFORM_ADMIN' && !isAdmin) return acc;
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});

  return (
    <CommandDialog open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <CommandInput placeholder={t('shell.commandPlaceholder')} />
      <CommandList>
        <CommandEmpty>{t('shell.noResults')}</CommandEmpty>

        {/* Business switcher — admin only */}
        {isAdmin && tenants && tenants.length > 0 && (
          <>
            <CommandGroup heading={t('shell.switchBusiness')}>
              {tenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  value={`business ${tenant.name}`}
                  onSelect={() => {
                    setActiveTenantId(tenant.id);
                    close();
                  }}
                  className="flex items-center gap-2"
                >
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>{tenant.name}</span>
                  {activeTenantId === tenant.id && (
                    <span className="ml-auto text-xs text-primary font-medium">active</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        {Object.entries(grouped).map(([section, items]) => (
          <CommandGroup
            key={section}
            heading={t(SECTION_LABELS[section as keyof typeof SECTION_LABELS])}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.to}
                  value={`navigate ${t(item.labelKey)}`}
                  onSelect={() => {
                    navigate(item.to);
                    close();
                  }}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {t(item.labelKey)}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        <CommandSeparator />
        <CommandGroup heading={t('shell.account')}>
          <CommandItem
            value="logout sign out"
            onSelect={() => {
              logout();
              close();
              navigate('/auth/login');
            }}
          >
            {t('shell.logout')}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
