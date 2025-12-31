import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock
} from 'lucide-react';
import { DatasetsCatalog } from './DatasetsCatalog';
import { QuerySandbox } from './QuerySandbox';
import { OrganizationsManager } from './OrganizationsManager';
import { ResearchersManager } from './ResearchersManager';
import { AccessRequestsManager } from './AccessRequestsManager';
import { ExportsManager } from './ExportsManager';
import { AuditLogViewer } from './AuditLogViewer';

export function DataLabDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useDataLabStats();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Datasets Disponíveis
            </CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_datasets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Catálogo de dados SIGAFLO
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investigadores Activos
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_researchers || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {stats?.total_researchers || 0} registados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actividade Hoje
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.total_queries_today || 0) + (stats?.total_exports_today || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_queries_today || 0} queries, {stats?.total_exports_today || 0} exports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Sandbox</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organizações</span>
          </TabsTrigger>
          <TabsTrigger value="researchers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Investigadores</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Permissões</span>
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportações</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DatasetsCatalog />
        </TabsContent>

        <TabsContent value="sandbox" className="mt-6">
          <QuerySandbox />
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
