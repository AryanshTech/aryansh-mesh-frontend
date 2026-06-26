import { Route } from 'react-router-dom';
import DashboardPage from '@/modules/business/pages/DashboardPage';
import ProductsPage from '@/modules/business/pages/ProductsPage';
import ClientsPage from '@/modules/business/pages/ClientsPage';
import BookingsPage from '@/modules/business/pages/BookingsPage';
import CostsPage from '@/modules/business/pages/CostsPage';
import LocationsPage from '@/modules/business/pages/LocationsPage';
import TestimonialsPage from '@/modules/business/pages/TestimonialsPage';
import ContentPage from '@/modules/business/pages/ContentPage';
import BusinessProfilePage from '@/modules/business/pages/BusinessProfilePage';
import PublishPage from '@/modules/business/pages/PublishPage';
import WebsiteConnectPage from '@/modules/business/pages/WebsiteConnectPage';
import OnboardingPage from '@/modules/business/pages/OnboardingPage';
import TeamPage from '@/modules/business/pages/TeamPage';

export const businessRoutes = (
  <>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="clients" element={<ClientsPage />} />
    <Route path="bookings" element={<BookingsPage />} />
    <Route path="costs" element={<CostsPage />} />
    <Route path="locations" element={<LocationsPage />} />
    <Route path="testimonials" element={<TestimonialsPage />} />
    <Route path="content" element={<ContentPage />} />
    <Route path="business" element={<BusinessProfilePage />} />
    <Route path="publish" element={<PublishPage />} />
    <Route path="connect" element={<WebsiteConnectPage />} />
    <Route path="onboarding" element={<OnboardingPage />} />
    <Route path="settings/team" element={<TeamPage />} />
  </>
);
