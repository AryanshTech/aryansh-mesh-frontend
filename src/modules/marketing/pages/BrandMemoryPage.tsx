import { Navigate } from 'react-router-dom';

/** Legacy brand-memory URL → Brand tab (voice section). */
export default function BrandMemoryPage() {
  return <Navigate to="/marketing?tab=brand&section=voice" replace />;
}
