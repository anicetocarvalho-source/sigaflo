import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import ForestryPage from "./pages/forestry/ForestryPage";
import CoffeePage from "./pages/coffee/CoffeePage";

// Public Portal
import VerificationPortal from "./pages/public/VerificationPortal";
import QRScanner from "./pages/public/QRScanner";
import VerifyCertificate from "./pages/public/VerifyCertificate";
import VerifyLicense from "./pages/public/VerifyLicense";
import VerifyCoffee from "./pages/public/VerifyCoffee";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Index />} />
          
          {/* Farmers Module */}
          <Route path="/agricultores" element={<FarmersListPage />} />
          <Route path="/agricultores/novo" element={<FarmerNewPage />} />
          <Route path="/agricultores/:id" element={<FarmerDetailPage />} />
          <Route path="/agricultores/:id/editar" element={<FarmerEditPage />} />
          
          {/* Certificates Module */}
          <Route path="/certificados" element={<CertificatesPage />} />
          <Route path="/certificados/novo" element={<CertificateNewPage />} />
          <Route path="/certificados/:id" element={<CertificateDetailPage />} />
          
          {/* Occurrences */}
          <Route path="/ocorrencias/*" element={<Index />} />
          
          {/* Infrastructure */}
          <Route path="/infraestruturas/*" element={<Index />} />
          
          {/* Forestry Module */}
          <Route path="/florestal/*" element={<ForestryPage />} />
          
          {/* Coffee Module */}
          <Route path="/cafe/*" element={<CoffeePage />} />
          
          {/* Rice Strategic Module */}
          <Route path="/arroz/*" element={<RiceDashboard />} />
          
          {/* Secondary Navigation */}
          <Route path="/relatorios" element={<Index />} />
          <Route path="/mapas" element={<Index />} />
          <Route path="/documentacao" element={<Index />} />
          <Route path="/notificacoes" element={<Index />} />
          <Route path="/configuracoes" element={<Index />} />
          
          {/* Public Verification Portal */}
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
  </QueryClientProvider>
);

export default App;
