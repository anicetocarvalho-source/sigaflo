import { Toaster } from "@/components/ui/toaster";
import CoffeeTraceabilityPage from "./pages/coffee/CoffeeTraceabilityPage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { initSyncEngine } from "@/lib/offline/syncEngine";

const CooperativeAliasRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/agricultores/cooperativas/${id}/editar`} replace />;
};
const FieldSchoolAliasRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/agricultores/escolas/${id}/editar`} replace />;
};

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RiceDashboard from "./pages/rice/RiceDashboard";
import RiceProductionPage from "./pages/rice/RiceProductionPage";
import RiceImportsPage from "./pages/rice/RiceImportsPage";
import RicePricesPage from "./pages/rice/RicePricesPage";
import RiceConsumptionPage from "./pages/rice/RiceConsumptionPage";
import RicePoliciesPage from "./pages/rice/RicePoliciesPage";
import FarmersListPage from "./pages/farmers/FarmersListPage";
import FarmerNewPage from "./pages/farmers/FarmerNewPage";
import FarmerDetailPage from "./pages/farmers/FarmerDetailPage";
import FarmerEditPage from "./pages/farmers/FarmerEditPage";
import AddMembersPage from "./pages/farmers/AddMembersPage";
import FieldSchoolsPage from "./pages/farmers/FieldSchoolsPage";
import CooperativesPage from "./pages/farmers/CooperativesPage";
import CooperativeFormPage from "./pages/farmers/CooperativeFormPage";
import FieldSchoolFormPage from "./pages/farmers/FieldSchoolFormPage";
import FieldRegistrationPage from "./pages/farmers/FieldRegistrationPage";
import ExternalAccessPage from "./pages/farmers/ExternalAccessPage";
import ParcelsListPage from "./pages/farmers/ParcelsListPage";
import CertificatesPage from "./pages/certificates/CertificatesPage";
import CertificateNewPage from "./pages/certificates/CertificateNewPage";
import CertificateDetailPage from "./pages/certificates/CertificateDetailPage";
import CertificateVerificationPage from "./pages/certificates/CertificateVerificationPage";
import ProductionPage from "./pages/production/ProductionPage";
import ProductionNewPage from "./pages/production/ProductionNewPage";
import ProductionDetailPage from "./pages/production/ProductionDetailPage";
import ProductionEditPage from "./pages/production/ProductionEditPage";
import ForestryPage from "./pages/forestry/ForestryPage";
import ForestInventoryPage from "./pages/forestry/ForestInventoryPage";
import ForestryTraceabilityPage from "./pages/forestry/ForestryTraceabilityPage";
import ForestryEnforcementPage from "./pages/forestry/ForestryEnforcementPage";
import ForestryReforestationPage from "./pages/forestry/ForestryReforestationPage";
import ForestryComplaintsPage from "./pages/forestry/ForestryComplaintsPage";
import ConcessionDetailPage from "./pages/forestry/ConcessionDetailPage";
import CoffeePage from "./pages/coffee/CoffeePage";
import CoffeeLotsPage from "./pages/coffee/CoffeeLotsPage";
import CoffeeSemaphorePage from "./pages/coffee/CoffeeSemaphorePage";
import CoffeeVerificationPage from "./pages/coffee/CoffeeVerificationPage";
import OccurrencesPage from "./pages/occurrences/OccurrencesPage";
import ClimateOccurrencesPage from "./pages/occurrences/ClimateOccurrencesPage";
import PhytosanitaryOccurrencesPage from "./pages/occurrences/PhytosanitaryOccurrencesPage";
import OccurrenceAlertsPage from "./pages/occurrences/OccurrenceAlertsPage";
import OccurrenceDetailPage from "./pages/occurrences/OccurrenceDetailPage";
import ONAFPage from "./pages/onaf/ONAFPage";
import IPNPage from "./pages/ipn/IPNPage";
import IncentivesPage from "./pages/incentives/IncentivesPage";
import IncentivesAnalyticsPage from "./pages/incentives-analytics/IncentivesAnalyticsPage";
import ClimateRiskPage from "./pages/climate-risk/ClimateRiskPage";
import ClimateRiskAnalyticsPage from "./pages/climate-risk-analytics/ClimateRiskAnalyticsPage";
import DataLabPage from "./pages/data-lab/DataLabPage";
import CreditInsurancePage from "./pages/credit-insurance/CreditInsurancePage";

// Auth Pages
import AuthPage from "./pages/auth/AuthPage";
import NoPermissionPage from "./pages/auth/NoPermissionPage";
import UsersPage from "./pages/admin/UsersPage";
import ProfilePage from "./pages/profile/ProfilePage";

// Infrastructure
import AgriculturalInfrastructurePage from "./pages/infrastructure/AgriculturalInfrastructurePage";
import MarketsInfrastructurePage from "./pages/infrastructure/MarketsInfrastructurePage";

// Public Portal
import PublicLayout from "./components/public/PublicLayout";
import PortalHome from "./pages/public/PortalHome";
import PortalAgriculture from "./pages/public/PortalAgriculture";
import PortalForestry from "./pages/public/PortalForestry";
import PortalCoffee from "./pages/public/PortalCoffee";
import PortalRice from "./pages/public/PortalRice";
import PortalAbout from "./pages/public/PortalAbout";
import PortalIndicators from "./pages/public/PortalIndicators";
import PortalLegislation from "./pages/public/PortalLegislation";
import PortalLegislationDetail from "./pages/public/PortalLegislationDetail";
import PortalNews from "./pages/public/PortalNews";
import PortalNewsDetail from "./pages/public/PortalNewsDetail";
import PortalMap from "./pages/public/PortalMap";
import PortalFAQ from "./pages/public/PortalFAQ";
import PortalContacts from "./pages/public/PortalContacts";
import PortalRegistry from "./pages/public/PortalRegistry";
import VerificationPortal from "./pages/public/VerificationPortal";
import QRScanner from "./pages/public/QRScanner";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import VerifyLicense from "./pages/public/VerifyLicense";
import VerifyCoffee from "./pages/public/VerifyCoffee";
import PortalNotFound from "./pages/public/PortalNotFound";
import ReportsPage from "./pages/reports/ReportsPage";
import MapsPage from "./pages/maps/MapsPage";
import DocumentationPage from "./pages/docs/DocumentationPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import SettingsPage from "./pages/settings/SettingsPage";

// POS Module
import POSPage from "./pages/pos/POSPage";
import MechanizationPage from "./pages/mechanization/MechanizationPage";
import TechniciansPage from "./pages/technicians/TechniciansPage";
import TechnicianDetailPage from "./pages/technicians/TechnicianDetailPage";
import FaturasPage from "./pages/pos/FaturasPage";
import ComprasPage from "./pages/pos/ComprasPage";
import PacotesComprasPage from "./pages/pos/PacotesComprasPage";

// Monitoring Module
import AlertsPage from "./pages/monitoring/AlertsPage";
import AgriculturalScorePage from "./pages/monitoring/AgriculturalScorePage";
import NDVIPage from "./pages/monitoring/NDVIPage";

// Insurance Module
import InsurancePage from "./pages/insurance/InsurancePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h — needed for persistence
      staleTime: 1000 * 60 * 5,
      networkMode: 'offlineFirst',
      retry: (count, err: any) => {
        if (!navigator.onLine) return false;
        return count < 2;
      },
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined as any,
  key: 'sigaflo-rq-cache',
  throttleTime: 1000,
});

// Role groups for route protection
const ADMIN_ROLES: Array<'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer'> = ['admin_national', 'admin_provincial', 'admin_municipal'];
const TECHNICIAN_AND_ADMIN: Array<'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer'> = [
  'admin_national', 'admin_provincial', 'admin_municipal',
  'technician_national', 'technician_provincial', 'technician_municipal'
];
const NATIONAL_LEVEL: Array<'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer'> = ['admin_national', 'technician_national'];
const ALL_INTERNAL: Array<'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer'> = [
  'admin_national', 'admin_provincial', 'admin_municipal',
  'technician_national', 'technician_provincial', 'technician_municipal',
  'private_entity'
];
const FORESTRY_ROLES: Array<'admin_national' | 'admin_provincial' | 'admin_municipal' | 'technician_national' | 'technician_provincial' | 'technician_municipal' | 'private_entity' | 'viewer'> = [
  'admin_national', 'admin_provincial', 'admin_municipal',
  'technician_national', 'technician_provincial', 'technician_municipal',
  'private_entity'
];

const App = () => {
  useEffect(() => { initSyncEngine(queryClient); }, []);
  return (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/sem-permissao" element={<NoPermissionPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Farmers Module - all internal roles */}
            <Route path="/agricultores" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><FarmersListPage /></ProtectedRoute>} />
            <Route path="/agricultores/novo" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FarmerNewPage /></ProtectedRoute>} />
            <Route path="/agricultores/escolas" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><FieldSchoolsPage /></ProtectedRoute>} />
            <Route path="/agricultores/cooperativas" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CooperativesPage /></ProtectedRoute>} />
            <Route path="/agricultores/cooperativas/nova" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CooperativeFormPage mode="new" /></ProtectedRoute>} />
            <Route path="/agricultores/cooperativas/:id/editar" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CooperativeFormPage mode="edit" /></ProtectedRoute>} />
            <Route path="/agricultores/escolas/nova" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FieldSchoolFormPage mode="new" /></ProtectedRoute>} />
            <Route path="/agricultores/escolas/:id/editar" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FieldSchoolFormPage mode="edit" /></ProtectedRoute>} />
            {/* Aliases curtos para compatibilidade */}
            <Route path="/cooperativas" element={<Navigate to="/agricultores/cooperativas" replace />} />
            <Route path="/cooperativas/nova" element={<Navigate to="/agricultores/cooperativas/nova" replace />} />
            <Route path="/cooperativas/:id/editar" element={<CooperativeAliasRedirect />} />
            <Route path="/escolas-campo" element={<Navigate to="/agricultores/escolas" replace />} />
            <Route path="/escolas-campo/nova" element={<Navigate to="/agricultores/escolas/nova" replace />} />
            <Route path="/escolas-campo/:id/editar" element={<FieldSchoolAliasRedirect />} />
            <Route path="/agricultores/:id" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><FarmerDetailPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id/editar" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FarmerEditPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id/membros" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><AddMembersPage /></ProtectedRoute>} />
            <Route path="/cadastro-campo" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FieldRegistrationPage /></ProtectedRoute>} />
            <Route path="/cadastro-externo" element={<ProtectedRoute requiredRoles={ADMIN_ROLES}><ExternalAccessPage /></ProtectedRoute>} />
            <Route path="/parcelas" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><ParcelsListPage /></ProtectedRoute>} />
            
            {/* Certificates Module */}
            <Route path="/certificados" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CertificatesPage /></ProtectedRoute>} />
            <Route path="/certificados/novo" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CertificateNewPage /></ProtectedRoute>} />
            <Route path="/certificados/verificar" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CertificateVerificationPage /></ProtectedRoute>} />
            <Route path="/certificados/:id" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CertificateDetailPage /></ProtectedRoute>} />
            
            {/* Production Module */}
            <Route path="/producao" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><ProductionPage /></ProtectedRoute>} />
            <Route path="/producao/novo" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ProductionNewPage /></ProtectedRoute>} />
            <Route path="/producao/:id" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><ProductionDetailPage /></ProtectedRoute>} />
            <Route path="/producao/:id/editar" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ProductionEditPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/utilizadores" element={<ProtectedRoute requiredRoles={ADMIN_ROLES}><UsersPage /></ProtectedRoute>} />
            
            {/* Profile */}
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Occurrences */}
            <Route path="/ocorrencias/climaticas" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ClimateOccurrencesPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/climaticas/:id" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><OccurrenceDetailPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/fitossanitarias" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><PhytosanitaryOccurrencesPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/alertas" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><OccurrenceAlertsPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/*" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><OccurrencesPage /></ProtectedRoute>} />
            
            {/* Infrastructure Module */}
            <Route path="/infraestruturas/agropecuarias" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><AgriculturalInfrastructurePage /></ProtectedRoute>} />
            <Route path="/infraestruturas/mercados" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><MarketsInfrastructurePage /></ProtectedRoute>} />
            
            {/* Forestry Module */}
            <Route path="/florestal" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryPage /></ProtectedRoute>} />
            <Route path="/florestal/inventario" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestInventoryPage /></ProtectedRoute>} />
            <Route path="/florestal/licenciamento" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryPage /></ProtectedRoute>} />
            <Route path="/florestal/rastreabilidade" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryTraceabilityPage /></ProtectedRoute>} />
            <Route path="/florestal/fiscalizacao" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ForestryEnforcementPage /></ProtectedRoute>} />
            <Route path="/florestal/reflorestamento" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryReforestationPage /></ProtectedRoute>} />
            <Route path="/florestal/denuncias" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryComplaintsPage /></ProtectedRoute>} />
            <Route path="/florestal/concessao/:id" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ConcessionDetailPage /></ProtectedRoute>} />
            <Route path="/florestal/*" element={<ProtectedRoute requiredRoles={FORESTRY_ROLES}><ForestryPage /></ProtectedRoute>} />
            
            {/* Coffee Module */}
            <Route path="/cafe" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CoffeePage /></ProtectedRoute>} />
            <Route path="/cafe/lotes" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CoffeeLotsPage /></ProtectedRoute>} />
            <Route path="/cafe/semaforizacao" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CoffeeSemaphorePage /></ProtectedRoute>} />
            <Route path="/cafe/verificar" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CoffeeVerificationPage /></ProtectedRoute>} />
            <Route path="/cafe/rastreio" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CoffeeTraceabilityPage /></ProtectedRoute>} />
            <Route path="/cafe/*" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><CoffeePage /></ProtectedRoute>} />
            
            {/* Rice Strategic Module */}
            <Route path="/arroz" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RiceDashboard /></ProtectedRoute>} />
            <Route path="/arroz/producao" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RiceProductionPage /></ProtectedRoute>} />
            <Route path="/arroz/importacoes" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RiceImportsPage /></ProtectedRoute>} />
            <Route path="/arroz/precos" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RicePricesPage /></ProtectedRoute>} />
            <Route path="/arroz/consumo" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RiceConsumptionPage /></ProtectedRoute>} />
            <Route path="/arroz/politicas" element={<ProtectedRoute requiredRoles={NATIONAL_LEVEL}><RicePoliciesPage /></ProtectedRoute>} />
            <Route path="/arroz/*" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><RiceDashboard /></ProtectedRoute>} />
            
            {/* ONAF Module - national level */}
            <Route path="/onaf/*" element={<ProtectedRoute requiredRoles={NATIONAL_LEVEL}><ONAFPage /></ProtectedRoute>} />
            
            {/* IPN Module */}
            <Route path="/ipn/*" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><IPNPage /></ProtectedRoute>} />
            
            {/* Incentives Module - admin only */}
            <Route path="/incentivos/*" element={<ProtectedRoute requiredRoles={ADMIN_ROLES}><IncentivesPage /></ProtectedRoute>} />
            <Route path="/incentivos-analytics/*" element={<ProtectedRoute requiredRoles={NATIONAL_LEVEL}><IncentivesAnalyticsPage /></ProtectedRoute>} />
            
            {/* Climate Risk Module */}
            <Route path="/risco-climatico/*" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ClimateRiskPage /></ProtectedRoute>} />
            <Route path="/risco-climatico-analytics/*" element={<ProtectedRoute requiredRoles={NATIONAL_LEVEL}><ClimateRiskAnalyticsPage /></ProtectedRoute>} />
            
            {/* Credit & Insurance Module */}
            <Route path="/credito-seguro/*" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><CreditInsurancePage /></ProtectedRoute>} />
            
            {/* Mechanization Module */}
            <Route path="/mecanizacao" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><MechanizationPage /></ProtectedRoute>} />
            
            {/* Technicians Module */}
            <Route path="/tecnicos" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><TechniciansPage /></ProtectedRoute>} />
            <Route path="/tecnicos/:id" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><TechnicianDetailPage /></ProtectedRoute>} />
            
            {/* POS & Sales Module */}
            <Route path="/pos" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><POSPage /></ProtectedRoute>} />
            <Route path="/faturas" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><FaturasPage /></ProtectedRoute>} />
            <Route path="/compras" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ComprasPage /></ProtectedRoute>} />
            <Route path="/pacotes-compras" element={<ProtectedRoute requiredRoles={ADMIN_ROLES}><PacotesComprasPage /></ProtectedRoute>} />
            
            {/* Monitoring Module */}
            <Route path="/monitoria/alertas" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><AlertsPage /></ProtectedRoute>} />
            <Route path="/monitoria/score" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><AgriculturalScorePage /></ProtectedRoute>} />
            <Route path="/monitoria/ndvi" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><NDVIPage /></ProtectedRoute>} />

            {/* Insurance Module */}
            <Route path="/seguros" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><InsurancePage /></ProtectedRoute>} />

            {/* Data Lab Module - national level */}
            <Route path="/laboratorio-dados/*" element={<ProtectedRoute requiredRoles={NATIONAL_LEVEL}><DataLabPage /></ProtectedRoute>} />
            
            {/* Secondary Navigation */}
            <Route path="/relatorios" element={<ProtectedRoute requiredRoles={TECHNICIAN_AND_ADMIN}><ReportsPage /></ProtectedRoute>} />
            <Route path="/mapas" element={<ProtectedRoute requiredRoles={ALL_INTERNAL}><MapsPage /></ProtectedRoute>} />
            <Route path="/documentacao" element={<ProtectedRoute><DocumentationPage /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* Public Portal */}
            <Route path="/portal" element={<PublicLayout />}>
              <Route index element={<PortalHome />} />
              <Route path="agricultura" element={<PortalAgriculture />} />
              <Route path="florestal" element={<PortalForestry />} />
              <Route path="cafe" element={<PortalCoffee />} />
              <Route path="arroz" element={<PortalRice />} />
              <Route path="sobre" element={<PortalAbout />} />
              <Route path="indicadores" element={<PortalIndicators />} />
              <Route path="legislacao" element={<PortalLegislation />} />
              <Route path="legislacao/:id" element={<PortalLegislationDetail />} />
              <Route path="noticias" element={<PortalNews />} />
              <Route path="noticias/:id" element={<PortalNewsDetail />} />
              <Route path="mapa" element={<PortalMap />} />
              <Route path="faq" element={<PortalFAQ />} />
              <Route path="contactos" element={<PortalContacts />} />
              <Route path="registos" element={<PortalRegistry />} />
              <Route path="verificar" element={<VerificationPortal />} />
              <Route path="verificar/scanner" element={<QRScanner />} />
              <Route path="verificar/certificado" element={<VerifyCertificate />} />
              <Route path="verificar/certificado/:code" element={<VerifyCertificate />} />
              <Route path="verificar/licenca" element={<VerifyLicense />} />
              <Route path="verificar/licenca/:code" element={<VerifyLicense />} />
              <Route path="verificar/cafe" element={<VerifyCoffee />} />
              <Route path="verificar/cafe/:code" element={<VerifyCoffee />} />
              <Route path="*" element={<PortalNotFound />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/verificar" element={<Navigate to="/portal/verificar" replace />} />
            <Route path="/verificar/*" element={<Navigate to="/portal/verificar" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </PersistQueryClientProvider>
  );
};
export default App;
