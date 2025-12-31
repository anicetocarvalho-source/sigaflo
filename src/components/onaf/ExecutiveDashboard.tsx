import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useNationalStats, 
  useProvinceStats,
  useCompositeIndices, 
  usePredictiveAlerts,
  useScenarioProjections,
  useTimelineProjections,
  calculateCostOfInaction,
} from '@/hooks/useONAF';
import { NationalMap } from './NationalMap';
import { ScenarioChart } from './ScenarioChartNew';
import { PredictiveTimeline } from './PredictiveTimeline';
import { AutomaticAlertsPanel } from './AutomaticAlertsPanel';
import {
  Wheat,
  TrendingUp,
  TrendingDown,
  DollarSign,
  TreePine,
  AlertTriangle,
  ShieldAlert,
  Scale,
  FileDown,
  Filter,
} from 'lucide-react';

function formatNumber(num: number, decimals = 0): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(decimals);
}

function formatCurrency(value: number, currency = 'AOA'): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B ${currency}`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ${currency}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K ${currency}`;
  return `${value.toFixed(0)} ${currency}`;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  status?: 'good' | 'warning' | 'critical';
}

function KPICard({ title, value, subtitle, icon, trend, trendValue, color, status }: KPICardProps) {
  const getStatusColor = () => {
    if (status === 'good') return 'border-emerald-500/30 bg-emerald-500/5';
    if (status === 'warning') return 'border-amber-500/30 bg-amber-500/5';
    if (status === 'critical') return 'border-red-500/30 bg-red-500/5';
    return '';
  };

  return (
    <Card className={`relative overflow-hidden ${getStatusColor()}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend === 'up' ? 'text-emerald-500' : 
                trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                 trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');

  const { data: stats, isLoading } = useNationalStats();
  const { data: provinceStats } = useProvinceStats();
  const indices = useCompositeIndices(stats);
  const alerts = usePredictiveAlerts(stats, indices);
  const scenarioProjections = useScenarioProjections(stats);
  const timelineEvents = useTimelineProjections(stats);
  const costOfInaction = stats ? calculateCostOfInaction(stats) : null;

  const handleExportPDF = () => {
    // In production, this would generate a PDF report
    alert('Exportação de relatório executivo em desenvolvimento');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-muted-foreground">Sem dados disponíveis</div>;
  }

  const productionTonnes = (stats.totalYieldKg / 1000) + stats.nationalRiceProduction;

  return (
    <div className="space-y-6">
      {/* Filters & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano Corrente</SelectItem>
              <SelectItem value="5years">5 Anos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cultura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Culturas</SelectItem>
              <SelectItem value="rice">Arroz</SelectItem>
              <SelectItem value="coffee">Café</SelectItem>
              <SelectItem value="maize">Milho</SelectItem>
              <SelectItem value="cassava">Mandioca</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Província" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Províncias</SelectItem>
              {provinceStats?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportPDF} variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Relatório PDF
        </Button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Soberania Alimentar"
          value={`${indices.foodSovereigntyIndex}%`}
          subtitle="Índice Nacional"
          icon={<Scale className="h-6 w-6 text-amber-600" />}
          trend={indices.foodSovereigntyIndex > 50 ? 'up' : 'down'}
          trendValue={indices.foodSovereigntyIndex > 50 ? 'Aceitável' : 'Crítico'}
          color="bg-amber-500/10"
          status={indices.foodSovereigntyIndex > 60 ? 'good' : indices.foodSovereigntyIndex > 40 ? 'warning' : 'critical'}
        />
        <KPICard
          title="Produção vs Importações"
          value={`${indices.productionVsImportsRatio}%`}
          subtitle={`${formatNumber(productionTonnes)}t produzido`}
          icon={<Wheat className="h-6 w-6 text-emerald-600" />}
          trend={indices.productionVsImportsRatio > 50 ? 'up' : 'down'}
          trendValue={`${formatNumber(stats.totalRiceImports)}t importado`}
          color="bg-emerald-500/10"
          status={indices.productionVsImportsRatio > 70 ? 'good' : indices.productionVsImportsRatio > 40 ? 'warning' : 'critical'}
        />
        <KPICard
          title="Défice Alimentar"
          value={`${formatNumber(indices.foodDeficitTonnes)}t`}
          subtitle="Estimativa anual"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          status={indices.foodDeficitTonnes < 10000 ? 'good' : indices.foodDeficitTonnes < 50000 ? 'warning' : 'critical'}
          color="bg-red-500/10"
        />
        <KPICard
          title="Pressão vs Reposição Florestal"
          value={`${indices.forestPressureVsReplenishment}%`}
          subtitle={`${formatNumber(stats.totalReforestedArea)} ha reflorestados`}
          icon={<TreePine className="h-6 w-6 text-emerald-600" />}
          trend={indices.forestPressureVsReplenishment > 50 ? 'up' : 'down'}
          color="bg-emerald-500/10"
          status={indices.forestPressureVsReplenishment > 80 ? 'good' : indices.forestPressureVsReplenishment > 40 ? 'warning' : 'critical'}
        />
        <KPICard
          title="Custo da Inação"
          value={formatCurrency(costOfInaction?.annualCost || 0)}
          subtitle={`$${formatNumber(costOfInaction?.costUSD || 0)} USD/ano`}
          icon={<ShieldAlert className="h-6 w-6 text-red-600" />}
          color="bg-red-500/10"
          status="critical"
        />
      </div>

      {/* Map and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NationalMap provinces={provinceStats || []} />
        </div>
        <div>
          <AutomaticAlertsPanel alerts={alerts} />
        </div>
      </div>

      {/* Scenario Chart */}
      <ScenarioChart projections={scenarioProjections} />

      {/* Timeline and Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PredictiveTimeline events={timelineEvents} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Decomposição do Custo da Inação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costOfInaction?.breakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.category}</span>
                    <span className="font-medium">{formatCurrency(item.cost)}</span>
                  </div>
                  <Progress 
                    value={(item.cost / (costOfInaction.annualCost || 1)) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Anual</span>
                  <span className="text-xl font-bold text-red-500">
                    {formatCurrency(costOfInaction?.annualCost || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Projecção 5 Anos</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(costOfInaction?.fiveYearCost || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatNumber(stats.totalFarmers)}</p>
            <p className="text-xs text-muted-foreground">Agricultores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatNumber(stats.totalCultivatedArea)} ha</p>
            <p className="text-xs text-muted-foreground">Área Cultivada</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.activeForestLicenses}</p>
            <p className="text-xs text-muted-foreground">Licenças Florestais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.totalOccurrences}</p>
            <p className="text-xs text-muted-foreground">Ocorrências</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.criticalOccurrences}</p>
            <p className="text-xs text-muted-foreground">Ocorrências Críticas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.issuedCertificates}</p>
            <p className="text-xs text-muted-foreground">Certificados Emitidos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
