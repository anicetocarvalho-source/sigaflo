import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  useNationalStats, 
  useCompositeIndices, 
  calculateCostOfInaction,
  type NationalStats,
  type CompositeIndices 
} from '@/hooks/useONAF';
import {
  Users,
  Wheat,
  TreePine,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ShieldAlert,
  Leaf,
  Heart,
  Building2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

function formatNumber(num: number, decimals = 0): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(decimals);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface IndexCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

function IndexCard({ title, value, icon, description, trend, color }: IndexCardProps) {
  const getColorClass = () => {
    if (value >= 70) return 'text-emerald-500';
    if (value >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 opacity-5 ${color}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className={`text-4xl font-bold ${getColorClass()}`}>{value}</span>
          <span className="text-lg text-muted-foreground mb-1">/100</span>
          {trend && (
            <div className="ml-auto">
              {trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        <Progress value={value} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard() {
  const { data: stats, isLoading } = useNationalStats();
  const indices = useCompositeIndices(stats);
  const costOfInaction = stats ? calculateCostOfInaction(stats) : null;

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

  const sectorData = [
    { name: 'Agricultores', value: stats.totalFarmers, color: '#10b981' },
    { name: 'Cooperativas', value: stats.totalCooperatives, color: '#3b82f6' },
    { name: 'ECAs', value: stats.totalFieldSchools, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Overall Health */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Índice de Saúde Nacional</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{indices.overallHealthIndex}</span>
                  <span className="text-xl text-muted-foreground">/100</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {indices.overallHealthIndex >= 70 ? 'Bom estado geral' :
                   indices.overallHealthIndex >= 40 ? 'Requer atenção' : 'Estado crítico'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Custo da Inação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Anual</span>
                <span className="text-xl font-bold text-red-500">
                  {formatNumber(costOfInaction?.annualCost || 0)} AOA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">5 Anos</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatNumber(costOfInaction?.fiveYearCost || 0)} AOA
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composite Indices */}
      <div className="grid gap-4 md:grid-cols-3">
        <IndexCard
          title="Soberania Alimentar"
          value={indices.foodSovereigntyIndex}
          icon={<Wheat className="h-5 w-5 text-amber-500" />}
          description="Capacidade de produção vs dependência de importações"
          trend="up"
          color="bg-amber-500"
        />
        <IndexCard
          title="Risco Agro-Climático"
          value={100 - indices.agroClimaticRiskIndex}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          description="Resiliência a eventos climáticos adversos"
          trend="down"
          color="bg-orange-500"
        />
        <IndexCard
          title="Pressão Florestal"
          value={100 - indices.forestPressureIndex}
          icon={<TreePine className="h-5 w-5 text-emerald-500" />}
          description="Sustentabilidade da exploração florestal"
          trend="neutral"
          color="bg-emerald-500"
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agricultores</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalFarmers)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalCultivatedArea)} ha cultivados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Wheat className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produção</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalYieldKg / 1000)} t</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalProductionRecords} registos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TreePine className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Licenças Florestais</p>
                <p className="text-2xl font-bold">{stats.activeForestLicenses}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalAuthorizedVolume)} m³ autorizados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocorrências</p>
                <p className="text-2xl font-bold">{stats.totalOccurrences}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.criticalOccurrences} críticas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Distribuição por Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {sectorData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    <span className="font-medium">{formatNumber(item.cost)} AOA</span>
                  </div>
                  <Progress 
                    value={(item.cost / (costOfInaction.annualCost || 1)) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import/Production Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5" />
            Balanço Arroz: Produção vs Importação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-emerald-500/10">
              <Leaf className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Produção Nacional</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalYieldKg / 1000)}</p>
              <p className="text-sm text-muted-foreground">toneladas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10">
              <TrendingDown className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Importações</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalRiceImports)}</p>
              <p className="text-sm text-muted-foreground">toneladas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <DollarSign className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Custo Importações</p>
              <p className="text-3xl font-bold">${formatNumber(stats.riceImportValue)}</p>
              <p className="text-sm text-muted-foreground">USD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
