import { Toaster } from "@/components/ui/toaster";
import CoffeeTraceabilityPage from "./pages/coffee/CoffeeTraceabilityPage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
import VerificationPortal from "./pages/public/VerificationPortal";
import QRScanner from "./pages/public/QRScanner";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import VerifyLicense from "./pages/public/VerifyLicense";
import VerifyCoffee from "./pages/public/VerifyCoffee";
import ReportsPage from "./pages/reports/ReportsPage";
import MapsPage from "./pages/maps/MapsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/sem-permissao" element={<NoPermissionPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Farmers Module */}
            <Route path="/agricultores" element={<ProtectedRoute><FarmersListPage /></ProtectedRoute>} />
            <Route path="/agricultores/novo" element={<ProtectedRoute><FarmerNewPage /></ProtectedRoute>} />
            <Route path="/agricultores/escolas" element={<ProtectedRoute><FieldSchoolsPage /></ProtectedRoute>} />
            <Route path="/agricultores/cooperativas" element={<ProtectedRoute><CooperativesPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id" element={<ProtectedRoute><FarmerDetailPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id/editar" element={<ProtectedRoute><FarmerEditPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id/membros" element={<ProtectedRoute><AddMembersPage /></ProtectedRoute>} />
            
            {/* Certificates Module */}
            <Route path="/certificados" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
            <Route path="/certificados/novo" element={<ProtectedRoute><CertificateNewPage /></ProtectedRoute>} />
            <Route path="/certificados/verificar" element={<ProtectedRoute><CertificateVerificationPage /></ProtectedRoute>} />
            <Route path="/certificados/:id" element={<ProtectedRoute><CertificateDetailPage /></ProtectedRoute>} />
            
            {/* Production Module */}
            <Route path="/producao" element={<ProtectedRoute><ProductionPage /></ProtectedRoute>} />
            <Route path="/producao/novo" element={<ProtectedRoute><ProductionNewPage /></ProtectedRoute>} />
            <Route path="/producao/:id" element={<ProtectedRoute><ProductionDetailPage /></ProtectedRoute>} />
            <Route path="/producao/:id/editar" element={<ProtectedRoute><ProductionEditPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route 
              path="/utilizadores" 
              element={
                <ProtectedRoute requiredRoles={['admin_national', 'admin_provincial', 'admin_municipal']}>
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile */}
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Occurrences */}
            <Route path="/ocorrencias/climaticas" element={<ProtectedRoute><ClimateOccurrencesPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/climaticas/:id" element={<ProtectedRoute><OccurrenceDetailPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/fitossanitarias" element={<ProtectedRoute><PhytosanitaryOccurrencesPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/alertas" element={<ProtectedRoute><OccurrenceAlertsPage /></ProtectedRoute>} />
            <Route path="/ocorrencias/*" element={<ProtectedRoute><OccurrencesPage /></ProtectedRoute>} />
            
            {/* Infrastructure Module */}
            <Route path="/infraestruturas/agropecuarias" element={<ProtectedRoute><AgriculturalInfrastructurePage /></ProtectedRoute>} />
            <Route path="/infraestruturas/mercados" element={<ProtectedRoute><MarketsInfrastructurePage /></ProtectedRoute>} />
            
            {/* Forestry Module */}
            <Route path="/florestal" element={<ProtectedRoute><ForestryPage /></ProtectedRoute>} />
            <Route path="/florestal/inventario" element={<ProtectedRoute><ForestInventoryPage /></ProtectedRoute>} />
            <Route path="/florestal/licenciamento" element={<ProtectedRoute><ForestryPage /></ProtectedRoute>} />
            <Route path="/florestal/rastreabilidade" element={<ProtectedRoute><ForestryTraceabilityPage /></ProtectedRoute>} />
            <Route path="/florestal/fiscalizacao" element={<ProtectedRoute><ForestryEnforcementPage /></ProtectedRoute>} />
            <Route path="/florestal/reflorestamento" element={<ProtectedRoute><ForestryReforestationPage /></ProtectedRoute>} />
            <Route path="/florestal/denuncias" element={<ProtectedRoute><ForestryComplaintsPage /></ProtectedRoute>} />
            <Route path="/florestal/concessao/:id" element={<ProtectedRoute><ConcessionDetailPage /></ProtectedRoute>} />
            <Route path="/florestal/*" element={<ProtectedRoute><ForestryPage /></ProtectedRoute>} />
            
            {/* Coffee Module */}
            <Route path="/cafe" element={<ProtectedRoute><CoffeePage /></ProtectedRoute>} />
            <Route path="/cafe/lotes" element={<ProtectedRoute><CoffeeLotsPage /></ProtectedRoute>} />
            <Route path="/cafe/semaforizacao" element={<ProtectedRoute><CoffeeSemaphorePage /></ProtectedRoute>} />
            <Route path="/cafe/verificar" element={<ProtectedRoute><CoffeeVerificationPage /></ProtectedRoute>} />
            <Route path="/cafe/rastreio" element={<ProtectedRoute><CoffeeTraceabilityPage /></ProtectedRoute>} />
            <Route path="/cafe/*" element={<ProtectedRoute><CoffeePage /></ProtectedRoute>} />
            
            {/* Rice Strategic Module */}
            <Route path="/arroz" element={<ProtectedRoute><RiceDashboard /></ProtectedRoute>} />
            <Route path="/arroz/producao" element={<ProtectedRoute><RiceProductionPage /></ProtectedRoute>} />
            <Route path="/arroz/importacoes" element={<ProtectedRoute><RiceImportsPage /></ProtectedRoute>} />
            <Route path="/arroz/precos" element={<ProtectedRoute><RicePricesPage /></ProtectedRoute>} />
            <Route path="/arroz/consumo" element={<ProtectedRoute><RiceConsumptionPage /></ProtectedRoute>} />
            <Route path="/arroz/politicas" element={<ProtectedRoute><RicePoliciesPage /></ProtectedRoute>} />
            <Route path="/arroz/*" element={<ProtectedRoute><RiceDashboard /></ProtectedRoute>} />
            
            {/* ONAF Module */}
            <Route path="/onaf/*" element={<ProtectedRoute><ONAFPage /></ProtectedRoute>} />
            
            {/* IPN Module */}
            <Route path="/ipn/*" element={<ProtectedRoute><IPNPage /></ProtectedRoute>} />
            
            {/* Incentives Module */}
            <Route path="/incentivos/*" element={<ProtectedRoute><IncentivesPage /></ProtectedRoute>} />
            
            {/* Incentives Analytics Module */}
            <Route path="/incentivos-analytics/*" element={<ProtectedRoute><IncentivesAnalyticsPage /></ProtectedRoute>} />
            
            
            {/* Climate Risk Module */}
            <Route path="/risco-climatico/*" element={<ProtectedRoute><ClimateRiskPage /></ProtectedRoute>} />
            
            {/* Climate Risk Analytics Module */}
            <Route path="/risco-climatico-analytics/*" element={<ProtectedRoute><ClimateRiskAnalyticsPage /></ProtectedRoute>} />
            
            {/* Credit & Insurance Module */}
            <Route path="/credito-seguro/*" element={<ProtectedRoute><CreditInsurancePage /></ProtectedRoute>} />
            
            {/* Data Lab Module */}
            <Route 
              path="/laboratorio-dados/*" 
              element={
                <ProtectedRoute requiredRoles={['admin_national', 'admin_provincial', 'technician_national']}>
                  <DataLabPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Secondary Navigation */}
            <Route path="/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/mapas" element={<ProtectedRoute><MapsPage /></ProtectedRoute>} />
            <Route path="/documentacao" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Public Verification Portal (no auth required) */}
            <Route path="/verificar" element={<VerificationPortal />} />
            <Route path="/verificar/scanner" element={<QRScanner />} />
            <Route path="/verificar/certificado" element={<VerifyCertificate />} />
            <Route path="/verificar/certificado/:code" element={<VerifyCertificate />} />
            <Route path="/verificar/licenca" element={<VerifyLicense />} />
            <Route path="/verificar/licenca/:code" element={<VerifyLicense />} />
            <Route path="/verificar/cafe" element={<VerifyCoffee />} />
            <Route path="/verificar/cafe/:code" element={<VerifyCoffee />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
