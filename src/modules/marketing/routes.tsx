import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '@/core/auth/guards';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { AgencyOverviewPage } from '@/modules/marketing/pages/AgencyOverviewPage';
import { CompaniesPage } from '@/modules/marketing/pages/CompaniesPage';
import { CompanyProjectsPage } from '@/modules/marketing/pages/CompanyProjectsPage';
import { ProjectDashboardPage } from '@/modules/marketing/pages/ProjectDashboardPage';
import { OnboardingPage } from '@/modules/marketing/pages/OnboardingPage';
import { SpyPage } from '@/modules/marketing/pages/SpyPage';
import { BrandMemoryPage } from '@/modules/marketing/pages/BrandMemoryPage';
import { ContentStudioPage } from '@/modules/marketing/pages/ContentStudioPage';
import { CreativeStudioPage } from '@/modules/marketing/pages/CreativeStudioPage';
import { SocialCalendarPage } from '@/modules/marketing/pages/SocialCalendarPage';
import { CrmPipelinePage } from '@/modules/marketing/pages/CrmPipelinePage';
import { AdminUsersPage } from '@/modules/marketing/pages/AdminUsersPage';
const MarketingStudioPage = lazy(() =>
  import('@/modules/marketing/pages/MarketingStudioPage').then((m) => ({
    default: m.MarketingStudioPage,
  })),
);

const ThreadWorkspacePage = lazy(() =>
  import('@/modules/marketing/pages/ThreadWorkspacePage').then((m) => ({
    default: m.ThreadWorkspacePage,
  })),
);

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>{children}</Suspense>
  );
}

export function marketingRoutes() {
  return (
  <>
    <Route index element={<AgencyOverviewPage />} />
    <Route path="companies" element={<CompaniesPage />} />
    <Route path="companies/:companyId" element={<CompanyProjectsPage />} />
    <Route path="projects/:projectId" element={<ProjectDashboardPage />} />
    <Route
      path="projects/:projectId/studio"
      element={
        <LazyPage>
          <MarketingStudioPage />
        </LazyPage>
      }
    />
    <Route path="projects/:projectId/onboarding" element={<OnboardingPage />} />
    <Route path="projects/:projectId/spy" element={<SpyPage />} />
    <Route path="projects/:projectId/brand-memory" element={<BrandMemoryPage />} />
    <Route path="projects/:projectId/content" element={<ContentStudioPage />} />
    <Route path="projects/:projectId/creative" element={<CreativeStudioPage />} />
    <Route path="projects/:projectId/social" element={<SocialCalendarPage />} />
    <Route path="projects/:projectId/crm" element={<CrmPipelinePage />} />
    <Route
      path="projects/:projectId/workspace"
      element={
        <LazyPage>
          <ThreadWorkspacePage />
        </LazyPage>
      }
    />
    <Route element={<AdminRoute />}>
      <Route path="admin/users" element={<AdminUsersPage />} />
    </Route>
  </>
  );
}

export const MarketingRoutes = marketingRoutes;
