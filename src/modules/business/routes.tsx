import { Navigate, Route } from 'react-router-dom';
import { AdminRoute, OnboardingRoute } from '@/core/auth/guards';
import { OnboardingPage } from '@/modules/business/features/onboarding/OnboardingPage';
import { DashboardPage } from '@/modules/business/features/dashboard/DashboardPage';
import { BusinessPage } from '@/modules/business/features/business/BusinessPage';
import { ProductListPage } from '@/modules/business/features/products/ProductListPage';
import { ProductFormPage } from '@/modules/business/features/products/ProductFormPage';
import { CostListPage } from '@/modules/business/features/costs/CostListPage';
import { CostFormPage } from '@/modules/business/features/costs/CostFormPage';
import { ClientListPage } from '@/modules/business/features/clients/ClientListPage';
import { ClientFormPage } from '@/modules/business/features/clients/ClientFormPage';
import { LocationListPage } from '@/modules/business/features/locations/LocationListPage';
import { LocationFormPage } from '@/modules/business/features/locations/LocationFormPage';
import { TestimonialListPage } from '@/modules/business/features/testimonials/TestimonialListPage';
import { TestimonialFormPage } from '@/modules/business/features/testimonials/TestimonialFormPage';
import { ContentCollectionListPage } from '@/modules/business/features/content/ContentCollectionListPage';
import { ContentCollectionFormPage } from '@/modules/business/features/content/ContentCollectionFormPage';
import { BookingListPage } from '@/modules/business/features/bookings/BookingListPage';
import { PublishPage } from '@/modules/business/features/publish/PublishPage';
import { TeamPage } from '@/modules/business/features/settings/TeamPage';
import { AccountPage } from '@/modules/business/features/settings/AccountPage';
import { TenantListPage } from '@/modules/business/features/admin/TenantListPage';
import { TenantCreatePage } from '@/modules/business/features/admin/TenantCreatePage';
import { TenantDetailPage } from '@/modules/business/features/admin/TenantDetailPage';
import { TenantWorkspaceLayout } from '@/modules/business/features/admin/TenantWorkspaceLayout';

function workspaceRoutes() {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<BusinessPage />} />
      <Route path="business" element={<Navigate to="../profile" replace relative="path" />} />
      <Route path="products" element={<ProductListPage />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id" element={<ProductFormPage />} />
      <Route path="costs" element={<CostListPage />} />
      <Route path="costs/new" element={<CostFormPage />} />
      <Route path="costs/:id" element={<CostFormPage />} />
      <Route path="clients" element={<ClientListPage />} />
      <Route path="clients/new" element={<ClientFormPage />} />
      <Route path="clients/:id" element={<ClientFormPage />} />
      <Route path="locations" element={<LocationListPage />} />
      <Route path="locations/new" element={<LocationFormPage />} />
      <Route path="locations/:id" element={<LocationFormPage />} />
      <Route path="testimonials" element={<TestimonialListPage />} />
      <Route path="testimonials/new" element={<TestimonialFormPage />} />
      <Route path="testimonials/:id" element={<TestimonialFormPage />} />
      <Route path="content" element={<ContentCollectionListPage />} />
      <Route path="content/new" element={<ContentCollectionFormPage />} />
      <Route path="content/:id" element={<ContentCollectionFormPage />} />
      <Route path="bookings" element={<BookingListPage />} />
      <Route path="publish" element={<PublishPage />} />
      <Route path="settings/team" element={<TeamPage />} />
      <Route path="settings/account" element={<AccountPage />} />
      <Route path="onboarding" element={<OnboardingPage />} />
    </>
  );
}

export function businessRoutes() {
  return (
    <>
      <Route element={<OnboardingRoute />}>
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<BusinessPage />} />
      <Route path="products" element={<ProductListPage />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id" element={<ProductFormPage />} />
      <Route path="costs" element={<CostListPage />} />
      <Route path="costs/new" element={<CostFormPage />} />
      <Route path="costs/:id" element={<CostFormPage />} />
      <Route path="clients" element={<ClientListPage />} />
      <Route path="clients/new" element={<ClientFormPage />} />
      <Route path="clients/:id" element={<ClientFormPage />} />
      <Route path="locations" element={<LocationListPage />} />
      <Route path="locations/new" element={<LocationFormPage />} />
      <Route path="locations/:id" element={<LocationFormPage />} />
      <Route path="testimonials" element={<TestimonialListPage />} />
      <Route path="testimonials/new" element={<TestimonialFormPage />} />
      <Route path="testimonials/:id" element={<TestimonialFormPage />} />
      <Route path="content" element={<ContentCollectionListPage />} />
      <Route path="content/new" element={<ContentCollectionFormPage />} />
      <Route path="content/:id" element={<ContentCollectionFormPage />} />
      <Route path="bookings" element={<BookingListPage />} />
      <Route path="publish" element={<PublishPage />} />
      <Route path="settings/team" element={<TeamPage />} />
      <Route path="settings/account" element={<AccountPage />} />
      <Route element={<AdminRoute />}>
        <Route path="admin/tenants" element={<TenantListPage />} />
        <Route path="admin/tenants/new" element={<TenantCreatePage />} />
        <Route path="admin/tenants/:id" element={<TenantDetailPage />} />
        <Route path="admin/tenants/:tenantId/workspace" element={<TenantWorkspaceLayout />}>
          {workspaceRoutes()}
        </Route>
      </Route>
    </>
  );
}

export const BusinessRoutes = businessRoutes;
