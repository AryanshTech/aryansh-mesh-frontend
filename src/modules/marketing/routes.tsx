import { Navigate, Route } from 'react-router-dom';
import MarketingWorkspacePage from '@/modules/marketing/pages/MarketingWorkspacePage';
import ProjectDashboardPage from '@/modules/marketing/pages/ProjectDashboardPage';
import ThreadWorkspacePage from '@/modules/marketing/pages/ThreadWorkspacePage';
import BrandMemoryPage from '@/modules/marketing/pages/BrandMemoryPage';
import SocialCalendarPage from '@/modules/marketing/pages/SocialCalendarPage';

export const marketingRoutes = (
  <Route path="marketing">
    <Route index element={<MarketingWorkspacePage />} />
    <Route path="companies" element={<Navigate to="/marketing" replace />} />
    <Route path="companies/:companyId" element={<Navigate to="/marketing" replace />} />
    <Route path="agency" element={<Navigate to="/marketing" replace />} />
    <Route path="projects/:projectId" element={<ProjectDashboardPage />} />
    <Route path="projects/:projectId/threads/:threadId" element={<ThreadWorkspacePage />} />
    <Route path="projects/:projectId/brand-memory" element={<BrandMemoryPage />} />
    <Route path="projects/:projectId/social" element={<SocialCalendarPage />} />
  </Route>
);
