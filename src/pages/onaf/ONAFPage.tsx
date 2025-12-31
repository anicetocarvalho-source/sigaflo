import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExecutiveDashboard } from '@/components/onaf/ExecutiveDashboard';
import { ScenarioSimulator } from '@/components/onaf/ScenarioSimulator';
import { ProvinceComparison } from '@/components/onaf/ProvinceComparison';
import { ReportExporter } from '@/components/onaf/ReportExporter';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FlaskConical,
  MapPin,
  FileText,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function ONAFPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { profile } = useAuth();

  // For now, assume national level access for demo purposes
  // In production, this would check user roles from the auth context
  const canSimulate = true;

  return (
    <MainLayout
      title="ONAF - Observatório Nacional"
      subtitle="Análise integrada para políticas públicas agro-florestais"
    >
      <div className="space-y-6">
        {/* Access Level Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Observatório Nacional Agro-Florestal</p>
                  <p className="text-sm text-muted-foreground">
                    Centralização e análise de dados para suporte a decisões estratégicas
                  </p>
                </div>
              </div>
              <Badge variant={canSimulate ? 'default' : 'secondary'}>
                {canSimulate ? 'Acesso Completo' : 'Apenas Consulta'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Painel Executivo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="simulator" 
              className="flex items-center gap-2"
              disabled={!canSimulate}
            >
              {canSimulate ? (
                <FlaskConical className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Simulações</span>
            </TabsTrigger>
            <TabsTrigger value="provinces" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Províncias</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="simulator" className="mt-6">
            {canSimulate ? (
              <ScenarioSimulator />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                  <p className="text-muted-foreground mt-2">
                    As simulações de cenários estão disponíveis apenas para utilizadores de nível nacional.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="provinces" className="mt-6">
            <ProvinceComparison />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportExporter />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
