import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RiceDashboard from "./pages/rice/RiceDashboard";
import FarmersPage from "./pages/farmers/FarmersPage";
import ForestryPage from "./pages/forestry/ForestryPage";
import CoffeePage from "./pages/coffee/CoffeePage";

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
          <Route path="/agricultores" element={<FarmersPage />} />
          <Route path="/agricultores/escolas" element={<FarmersPage />} />
          <Route path="/agricultores/cooperativas" element={<FarmersPage />} />
          
          {/* Certificates */}
          <Route path="/certificados" element={<FarmersPage />} />
          <Route path="/certificados/verificar" element={<FarmersPage />} />
          
          {/* Occurrences */}
          <Route path="/ocorrencias/climaticas" element={<FarmersPage />} />
          <Route path="/ocorrencias/fitossanitarias" element={<FarmersPage />} />
          <Route path="/ocorrencias/alertas" element={<FarmersPage />} />
          
          {/* Infrastructure */}
          <Route path="/infraestruturas" element={<FarmersPage />} />
          <Route path="/infraestruturas/mercados" element={<FarmersPage />} />
          
          {/* Forestry Module */}
          <Route path="/florestal/licenciamento" element={<ForestryPage />} />
          <Route path="/florestal/rastreabilidade" element={<ForestryPage />} />
          <Route path="/florestal/fiscalizacao" element={<ForestryPage />} />
          <Route path="/florestal/reflorestamento" element={<ForestryPage />} />
          <Route path="/florestal/denuncias" element={<ForestryPage />} />
          
          {/* Coffee Module */}
          <Route path="/cafe/rastreio" element={<CoffeePage />} />
          <Route path="/cafe/semaforizacao" element={<CoffeePage />} />
          <Route path="/cafe/verificar" element={<CoffeePage />} />
          
          {/* Rice Strategic Module */}
          <Route path="/arroz" element={<RiceDashboard />} />
          <Route path="/arroz/producao" element={<RiceDashboard />} />
          <Route path="/arroz/importacoes" element={<RiceDashboard />} />
          <Route path="/arroz/precos" element={<RiceDashboard />} />
          <Route path="/arroz/consumo" element={<RiceDashboard />} />
          <Route path="/arroz/politicas" element={<RiceDashboard />} />
          
          {/* Secondary Navigation */}
          <Route path="/relatorios" element={<Index />} />
          <Route path="/mapas" element={<Index />} />
          <Route path="/documentacao" element={<Index />} />
          <Route path="/notificacoes" element={<Index />} />
          <Route path="/configuracoes" element={<Index />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
