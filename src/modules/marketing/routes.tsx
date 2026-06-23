import { Route } from 'react-router-dom';
import MarketingWorkspacePage from '@/modules/marketing/pages/MarketingWorkspacePage';
import AgencyOverviewPage from '@/modules/marketing/pages/AgencyOverviewPage';
import CompaniesPage from '@/modules/marketing/pages/CompaniesPage';
import CompanyProjectsPage from '@/modules/marketing/pages/CompanyProjectsPage';
import ProjectDashboardPage from '@/modules/marketing/pages/ProjectDashboardPage';
import ThreadWorkspacePage from '@/modules/marketing/pages/ThreadWorkspacePage';
import BrandMemoryPage from '@/modules/marketing/pages/BrandMemoryPage';
import SocialCalendarPage from '@/modules/marketing/pages/SocialCalendarPage';

export const marketingRoutes = (
  <Route path="marketing">
    <Route index element={<MarketingWorkspacePage />} />
    <Route path="agency" element={<AgencyOverviewPage />} />
    <Route path="companies" element={<CompaniesPage />} />
    <Route path="companies/:companyId" element={<CompanyProjectsPage />} />
    <Route path="projects/:projectId" element={<ProjectDashboardPage />} />
    <Route path="projects/:projectId/threads/:threadId" element={<ThreadWorkspacePage />} />
    <Route path="projects/:projectId/brand-memory" element={<BrandMemoryPage />} />
    <Route path="projects/:projectId/social" element={<SocialCalendarPage />} />
  </Route>
);
