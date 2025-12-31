import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Shield, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Building2,
  Landmark,
  FileCheck
} from 'lucide-react';
import { useCreditInsuranceStats } from '@/hooks/useCreditInsurance';
import { FinancialProfilesList } from './FinancialProfilesList';
import { CreditSimulator } from './CreditSimulator';
import { ProductionCertificates } from './ProductionCertificates';
import { InsuranceRiskScores } from './InsuranceRiskScores';
import { CreditDossiers } from './CreditDossiers';
import { AlternativeGuarantees } from './AlternativeGuarantees';
import { CreditInsuranceAlerts } from './CreditInsuranceAlerts';
import { InstitutionalDashboard } from './InstitutionalDashboard';

export function CreditInsuranceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useCreditInsuranceStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfis Financeiros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProfiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.eligibleForCredit || 0} elegíveis para crédito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio de Crédito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgCreditScore || 0}/100</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">Baixo: {stats?.riskDistribution.low || 0}</span>
              <span className="text-xs text-yellow-600">Médio: {stats?.riskDistribution.medium || 0}</span>
              <span className="text-xs text-red-600">Alto: {stats?.riskDistribution.high || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dossiês de Crédito</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDossiers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approvedDossiers || 0} aprovados | {stats?.submittedDossiers || 0} em análise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Recomendado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalCreditRecommended || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.unreadAlerts || 0} alertas não lidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <CreditInsuranceAlerts compact />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="overview" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Perfis</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Simulador</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-1">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Certificados</span>
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguro</span>
          </TabsTrigger>
          <TabsTrigger value="dossiers" className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dossiês</span>
          </TabsTrigger>
          <TabsTrigger value="guarantees" className="gap-1">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Garantias</span>
          </TabsTrigger>
          <TabsTrigger value="institutional" className="gap-1">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Instituições</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinancialProfilesList />
        </TabsContent>

        <TabsContent value="simulator">
          <CreditSimulator />
        </TabsContent>

        <TabsContent value="certificates">
          <ProductionCertificates />
        </TabsContent>

        <TabsContent value="insurance">
          <InsuranceRiskScores />
        </TabsContent>

        <TabsContent value="dossiers">
          <CreditDossiers />
        </TabsContent>

        <TabsContent value="guarantees">
          <AlternativeGuarantees />
        </TabsContent>

        <TabsContent value="institutional">
          <InstitutionalDashboard />
        </TabsContent>

        <TabsContent value="alerts">
          <CreditInsuranceAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
