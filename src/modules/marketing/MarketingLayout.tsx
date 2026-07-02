import { Outlet } from 'react-router-dom';
import { MarketingQuerySync } from '@/modules/marketing/components/MarketingQuerySync';
import { FormDialogScope } from '@/shared/components/FormDialog';

export function MarketingLayout() {
  return (
    <FormDialogScope className="flex min-h-0 flex-1 flex-col">
      <MarketingQuerySync />
      <Outlet />
    </FormDialogScope>
  );
}
