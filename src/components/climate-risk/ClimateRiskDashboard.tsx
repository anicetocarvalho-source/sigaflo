import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClimateRiskStats } from '@/hooks/useClimateRisk';
import { 
  CloudRain, 
  AlertTriangle, 
  TrendingDown, 
  MapPin, 
  Users, 
  Banknote,
  FileCheck,
  BarChart3
} from 'lucide-react';
import { RiskMap } from './RiskMap';
import { ClimateEventsHistory } from './ClimateEventsHistory';
import { ClimateProductionCorrelation } from './ClimateProductionCorrelation';
import { LossSimulator } from './LossSimulator';
import { InsuranceEvidenceManager } from './InsuranceEvidenceManager';
import { ClimateRiskReports } from './ClimateRiskReports';
import { ClimateRiskAlerts } from './ClimateRiskAlerts';

export function ClimateRiskDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useClimateRiskStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Climáticos
            </CardTitle>
            <CloudRain className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.events_this_year || 0} este ano
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perdas Estimadas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_loss_aoa || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.total_affected_area_ha || 0)} ha afectados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agricultores Afectados
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats?.total_affected_farmers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_compensations || 0} compensações pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Províncias Alto Risco
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.high_risk_provinces || 0}</div>
            <p className="text-xs text-muted-foreground">
              ~{(stats?.avg_monthly_events || 0).toFixed(1)} eventos/mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <ClimateRiskAlerts />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Mapa de Risco</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Correlação</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Simulação</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Evidências</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <RiskMap />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ClimateEventsHistory />
        </TabsContent>

        <TabsContent value="correlation" className="mt-6">
          <ClimateProductionCorrelation />
        </TabsContent>

        <TabsContent value="simulation" className="mt-6">
          <LossSimulator />
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <InsuranceEvidenceManager />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ClimateRiskReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
