import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataLabStats } from '@/hooks/useDataLab';
import { 
  Database, 
  Users, 
  Building2, 
  FileSearch, 
  Download, 
  History, 
  Shield,
  Activity,
  Clock,
  TrendingUp,
  Scale,
  AlertTriangle,
  BookOpen,
  FlaskConical
} from 'lucide-react';
import { DatasetsCatalog } from './DatasetsCatalog';
import { QuerySandbox } from './QuerySandbox';
import { OrganizationsManager } from './OrganizationsManager';
import { ResearchersManager } from './ResearchersManager';
import { AccessRequestsManager } from './AccessRequestsManager';
import { ExportsManager } from './ExportsManager';
import { AuditLogViewer } from './AuditLogViewer';
import { DataLabSmartAlerts } from './DataLabSmartAlerts';
import { TimeSeriesAnalysis } from './TimeSeriesAnalysis';
import { RegionalComparisons } from './RegionalComparisons';

export function DataLabDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useDataLabStats();

  // Mock additional stats
  const studiesInProgress = 12;
  const reportsGenerated = 47;

  return (
    <div className="space-y-6">
      {/* Header with Profile Badges */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Laboratório Nacional de Dados Agro-Florestais
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Exploração avançada e controlada dos dados SIGAF para análise científica
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Building2 className="h-3 w-3" />
                INE
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                Universidades
              </Badge>
              <Badge variant="outline" className="gap-1 bg-amber-50">
                <Shield className="h-3 w-3" />
                Parceiros (Restrito)
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Datasets Activos
            </CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_datasets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Agricultura, Florestas, Café, Clima, Mercado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilizações por Instituição
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_researchers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Investigadores activos de {stats?.total_organizations || 0} organizações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estudos em Curso
            </CardTitle>
            <FileSearch className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studiesInProgress}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_requests || 0} pedidos pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Relatórios Gerados
            </CardTitle>
            <Download className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_exports_today || 0} exportações hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="timeseries" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Séries</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Regiões</span>
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Sandbox</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Org.</span>
          </TabsTrigger>
          <TabsTrigger value="researchers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Invest.</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Acessos</span>
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export.</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DatasetsCatalog />
        </TabsContent>

        <TabsContent value="timeseries" className="mt-6">
          <TimeSeriesAnalysis />
        </TabsContent>

        <TabsContent value="regional" className="mt-6">
          <RegionalComparisons />
        </TabsContent>

        <TabsContent value="sandbox" className="mt-6">
          <QuerySandbox />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <DataLabSmartAlerts />
        </TabsContent>

        <TabsContent value="organizations" className="mt-6">
          <OrganizationsManager />
        </TabsContent>

        <TabsContent value="researchers" className="mt-6">
          <ResearchersManager />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <AccessRequestsManager />
        </TabsContent>

        <TabsContent value="exports" className="mt-6">
          <ExportsManager />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
