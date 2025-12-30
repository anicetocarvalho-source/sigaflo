import { Toaster } from "@/components/ui/toaster";
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
import FarmersListPage from "./pages/farmers/FarmersListPage";
import FarmerNewPage from "./pages/farmers/FarmerNewPage";
import FarmerDetailPage from "./pages/farmers/FarmerDetailPage";
import FarmerEditPage from "./pages/farmers/FarmerEditPage";
import CertificatesPage from "./pages/certificates/CertificatesPage";
import CertificateNewPage from "./pages/certificates/CertificateNewPage";
import CertificateDetailPage from "./pages/certificates/CertificateDetailPage";
import ProductionPage from "./pages/production/ProductionPage";
import ProductionNewPage from "./pages/production/ProductionNewPage";
import ProductionDetailPage from "./pages/production/ProductionDetailPage";
import ProductionEditPage from "./pages/production/ProductionEditPage";
import ForestryPage from "./pages/forestry/ForestryPage";
import CoffeePage from "./pages/coffee/CoffeePage";
import OccurrencesPage from "./pages/occurrences/OccurrencesPage";

// Auth Pages
import AuthPage from "./pages/auth/AuthPage";
import NoPermissionPage from "./pages/auth/NoPermissionPage";
import UsersPage from "./pages/admin/UsersPage";
import ProfilePage from "./pages/profile/ProfilePage";

// Public Portal
import VerificationPortal from "./pages/public/VerificationPortal";
import QRScanner from "./pages/public/QRScanner";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import VerifyLicense from "./pages/public/VerifyLicense";
import VerifyCoffee from "./pages/public/VerifyCoffee";

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
            <Route path="/agricultores/:id" element={<ProtectedRoute><FarmerDetailPage /></ProtectedRoute>} />
            <Route path="/agricultores/:id/editar" element={<ProtectedRoute><FarmerEditPage /></ProtectedRoute>} />
            
            {/* Certificates Module */}
            <Route path="/certificados" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
            <Route path="/certificados/novo" element={<ProtectedRoute><CertificateNewPage /></ProtectedRoute>} />
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
            <Route path="/ocorrencias/*" element={<ProtectedRoute><OccurrencesPage /></ProtectedRoute>} />
            
            {/* Infrastructure */}
            <Route path="/infraestruturas/*" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Forestry Module */}
            <Route path="/florestal/*" element={<ProtectedRoute><ForestryPage /></ProtectedRoute>} />
            
            {/* Coffee Module */}
            <Route path="/cafe/*" element={<ProtectedRoute><CoffeePage /></ProtectedRoute>} />
            
            {/* Rice Strategic Module */}
            <Route path="/arroz/*" element={<ProtectedRoute><RiceDashboard /></ProtectedRoute>} />
            
            {/* Secondary Navigation */}
            <Route path="/relatorios" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/mapas" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
