import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '@/core/permissions/use-permissions';
import {
  resolveActiveZone,
  zoneHomePath,
  zoneLabelKey,
  type ProductZone,
} from '@/shell/navigation';

export function useProductZone() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isPlatformOperator, canAccessBusiness, canAccessMarketing } = usePermissions();

  const zone = useMemo(
    () => resolveActiveZone(pathname, isPlatformOperator),
    [pathname, isPlatformOperator],
  );

  const showProductSwitcher =
    canAccessBusiness && canAccessMarketing && !isPlatformOperator;

  const navigateToZone = useCallback(
    (target: ProductZone) => {
      if (target === zone) return;
      navigate(zoneHomePath(target));
    },
    [navigate, zone],
  );

  return {
    zone,
    zoneLabelKey: zoneLabelKey(zone),
    showProductSwitcher,
    navigateToZone,
    isDualService: canAccessBusiness && canAccessMarketing,
  };
}
