import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Plus,
  FileText,
  Settings,
  BarChart3,
  Target
} from 'lucide-react';
import { useIncentiveStats, useIncentivePrograms } from '@/hooks/useIncentives';
import { ProgramsList } from './ProgramsList';
import { ProgramForm } from './ProgramForm';
import { AllocationManager } from './AllocationManager';
import { ImpactSimulator } from './ImpactSimulator';
import { PostAllocationMonitor } from './PostAllocationMonitor';
import { IncentiveAlerts } from './IncentiveAlerts';
import { IncentiveReports } from './IncentiveReports';

export function IncentivesDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useIncentiveStats();
  const { data: programs } = useIncentivePrograms();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowProgramForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Programa
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Total</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatCurrency(stats?.totalBudget || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.activePrograms || 0} programas ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Execução</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : `${(stats?.executionRate || 0).toFixed(1)}%`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats?.totalDisbursed || 0)} desembolsado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Beneficiários</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalBeneficiaries || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingAllocations || 0} pendentes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.unresolvedAlerts || 0}
                </p>
                {(stats?.criticalAlerts || 0) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats?.criticalAlerts} críticos
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Programas</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Simulação</span>
          </TabsTrigger>
          <TabsTrigger value="allocations" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Alocações</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Monitorização</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProgramsList 
            programs={programs || []}
            onSelect={setSelectedProgram}
            onEdit={(id) => {
              setSelectedProgram(id);
              setShowProgramForm(true);
            }}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Elegibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProgram ? (
                <ProgramForm 
                  programId={selectedProgram} 
                  onClose={() => setSelectedProgram(null)}
                  rulesOnly
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um programa para configurar as regras de elegibilidade</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('overview')}
                  >
                    Ver Programas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="mt-6">
          <ImpactSimulator programs={programs || []} />
        </TabsContent>

        <TabsContent value="allocations" className="mt-6">
          <AllocationManager programs={programs || []} />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PostAllocationMonitor />
            </div>
            <div>
              <IncentiveAlerts />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <IncentiveReports programs={programs || []} />
        </TabsContent>
      </Tabs>

      {/* Program Form Dialog */}
      {showProgramForm && (
        <ProgramForm 
          programId={selectedProgram}
          onClose={() => {
            setShowProgramForm(false);
            setSelectedProgram(null);
          }}
        />
      )}
    </div>
  );
}
