import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RiceProductionForm,
  RiceImportForm,
  RicePriceForm,
} from '@/components/rice/forms';
import { GrainTypeSelector } from '@/components/grains/GrainTypeSelector';
import { getGrainLabel, type GrainType } from '@/lib/grains';
import {
  useRiceProduction,
  useRiceImports,
  useRicePrices,
  useRiceConsumption,
  useRiceParameters,
  useRiceAlerts,
} from '@/hooks/useRice';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import {
  Package,
  ShoppingCart,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Leaf,
  Plus,
  Loader2,
  ArrowRight,
  FileText,
  DollarSign,
  Scale,
  Bell,
  ExternalLink,
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--info))'];

export default function RiceDashboard() {
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const [grainType, setGrainType] = useState<GrainType | 'all'>('all');

  const { data: production, isLoading: loadingProduction } = useRiceProduction(undefined, grainType);
  const { data: imports, isLoading: loadingImports } = useRiceImports(undefined, grainType);
  const { data: prices, isLoading: loadingPrices } = useRicePrices(undefined, grainType);
  const { data: consumption, isLoading: loadingConsumption } = useRiceConsumption(grainType);
  const { data: parameters } = useRiceParameters();
  const { data: alerts } = useRiceAlerts(false, grainType);

  const grainLabel = grainType === 'all' ? 'Todos os Grãos' : getGrainLabel(grainType);

  const isLoading = loadingProduction || loadingImports || loadingPrices || loadingConsumption;

  // Calculate totals from real data
  const totalProduction = production?.reduce((sum, p) => sum + Number(p.production_tonnes), 0) || 0;
  const totalArea = production?.reduce((sum, p) => sum + Number(p.cultivated_area_ha), 0) || 0;
  const totalImports = imports?.reduce((sum, i) => sum + Number(i.volume_tonnes), 0) || 0;
  const latestConsumption = consumption?.[0];
  const perCapita = latestConsumption?.per_capita_kg || 0;
  const totalConsumptionTonnes = latestConsumption?.total_consumption_tonnes || 0;
  const population = latestConsumption?.population || 0;
  const gap = totalConsumptionTonnes > 0 ? Math.max(0, totalConsumptionTonnes - totalProduction) : 0;
  
  // Self-sufficiency rate
  const selfSufficiency = totalConsumptionTonnes > 0 
    ? Math.min(100, (totalProduction / totalConsumptionTonnes) * 100) 
    : 0;

  // Unresolved alerts count
  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved).length || 0;

  // Average prices
  const avgRetailPrice = prices?.length 
    ? prices.reduce((sum, p) => sum + Number(p.retail_price_aoa), 0) / prices.length 
    : 0;
  const avgWholesalePrice = prices?.filter(p => p.wholesale_price_aoa)
    .reduce((sum, p, _, arr) => sum + Number(p.wholesale_price_aoa) / arr.length, 0) || 0;

  // Aggregate production by province
  const productionByProvince = production?.reduce((acc: Record<string, any>, p) => {
    const provinceName = p.provinces?.name || 'Não definida';
    if (!acc[provinceName]) {
      acc[provinceName] = { area: 0, production: 0, count: 0 };
    }
    acc[provinceName].area += Number(p.cultivated_area_ha);
    acc[provinceName].production += Number(p.production_tonnes);
    acc[provinceName].count++;
    return acc;
  }, {});

  const productionChartData = Object.entries(productionByProvince || {})
    .map(([province, data]: [string, any]) => ({
      province: province.length > 12 ? province.substring(0, 12) + '...' : province,
      fullName: province,
      area: data.area,
      production: data.production,
      productivity: data.area > 0 ? Number((data.production / data.area).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.production - a.production)
    .slice(0, 8);

  // Aggregate imports by country
  const importsByCountry = imports?.reduce((acc: Record<string, any>, i) => {
    if (!acc[i.origin_country]) {
      acc[i.origin_country] = { volume: 0, value: 0, count: 0 };
    }
    acc[i.origin_country].volume += Number(i.volume_tonnes);
    acc[i.origin_country].value += Number(i.total_value_usd || 0);
    acc[i.origin_country].count++;
    return acc;
  }, {});

  const totalImportVolume = Object.values(importsByCountry || {}).reduce(
    (sum: number, d: any) => sum + d.volume, 0
  );

  const importPieData = Object.entries(importsByCountry || {})
    .map(([country, data]: [string, any]) => ({
      name: country,
      value: data.volume,
      percentage: totalImportVolume > 0 ? Number(((data.volume / totalImportVolume) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Production by year
  const productionByYear = production?.reduce((acc: Record<number, any>, p) => {
    if (!acc[p.year]) {
      acc[p.year] = { production: 0, area: 0 };
    }
    acc[p.year].production += Number(p.production_tonnes);
    acc[p.year].area += Number(p.cultivated_area_ha);
    return acc;
  }, {});

  const yearlyTrendData = Object.entries(productionByYear || {})
    .map(([year, data]: [string, any]) => ({
      year: Number(year),
      production: data.production,
      area: data.area,
    }))
    .sort((a, b) => a.year - b.year)
    .slice(-5);

  // Parameters map
  const paramsMap = parameters?.reduce((acc: Record<string, number>, p) => {
    acc[p.parameter_name] = p.parameter_value;
    return acc;
  }, {}) || {};

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return num.toLocaleString('pt-AO');
    return num.toString();
  };

  // Self-sufficiency radial chart data
  const selfSufficiencyData = [
    { name: 'Auto-suficiência', value: selfSufficiency, fill: 'hsl(var(--success))' },
  ];

  // Quick navigation modules
  const modules = [
    { 
      title: 'Produção', 
      icon: Package, 
      link: '/arroz/producao', 
      value: formatNumber(totalProduction) + ' t',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      title: 'Importações', 
      icon: ShoppingCart, 
      link: '/arroz/importacoes', 
      value: formatNumber(totalImports) + ' t',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      title: 'Preços', 
      icon: DollarSign, 
      link: '/arroz/precos', 
      value: avgRetailPrice > 0 ? `${avgRetailPrice.toFixed(0)} AOA/kg` : '—',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      title: 'Consumo', 
      icon: Users, 
      link: '/arroz/consumo', 
      value: perCapita > 0 ? `${perCapita.toFixed(1)} kg/cap` : '—',
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    { 
      title: 'Políticas', 
      icon: FileText, 
      link: '/arroz/politicas', 
      value: `${parameters?.length || 0} parâmetros`,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
  ];

  return (
    <MainLayout
      title="Produção de Grãos"
      subtitle={`Módulo Estratégico de Soberania Alimentar — ${grainLabel}`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar dados...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Dados actualizados
              </span>
            )}
            {unresolvedAlerts > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-sm font-medium text-warning">
                <Bell className="h-4 w-4" />
                {unresolvedAlerts} alertas
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GrainTypeSelector value={grainType} onChange={setGrainType} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dados
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowProductionForm(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  Registar Produção
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportForm(true)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Registar Importação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPriceForm(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Registar Preço
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Quick Navigation Modules */}
        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {modules.map((module) => (
            <Link key={module.title} to={module.link}>
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-lg p-2.5 ${module.bgColor}`}>
                    <module.icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{module.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{module.value}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* Main KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Produção Nacional"
            value={formatNumber(totalProduction)}
            subtitle={`${formatNumber(totalArea)} ha cultivados`}
            change={12.5}
            changeType="increase"
            icon={<Package className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Importações"
            value={formatNumber(totalImports)}
            subtitle="toneladas/ano"
            change={-8.2}
            changeType="decrease"
            icon={<ShoppingCart className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="Consumo Per Capita"
            value={perCapita > 0 ? `${perCapita.toFixed(1)} kg` : '—'}
            subtitle={population > 0 ? `${formatNumber(population)} habitantes` : 'pessoa/ano'}
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Défice Alimentar"
            value={formatNumber(gap)}
            subtitle={`${selfSufficiency.toFixed(1)}% auto-suficiência`}
            change={gap > 0 ? -15.3 : 0}
            changeType={gap > 0 ? 'decrease' : 'increase'}
            icon={<Target className="h-5 w-5" />}
            variant="accent"
          />
        </section>

        {/* Secondary KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-success/10 p-3">
                <Scale className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalArea > 0 ? (totalProduction / totalArea).toFixed(2) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Produtividade (t/ha)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {avgRetailPrice > 0 ? `${avgRetailPrice.toFixed(0)}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Preço Médio Retalho (AOA/kg)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-warning/10 p-3">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {avgWholesalePrice > 0 ? `${avgWholesalePrice.toFixed(0)}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Preço Médio Atacado (AOA/kg)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-info/10 p-3">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {production?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Registos de Produção</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recommendations */}
        <section className="card-elevated border-l-4 border-l-accent p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Recomendações de Inteligência Analítica
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Expandir Área Cultivada
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aumentar 15% na Cuanza Sul e Malanje para reduzir importações
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Risco de Seca
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prever irrigação adicional no Huambo para Q2 2025
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Leaf className="h-4 w-4 text-primary" />
                    Variedades Melhoradas
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Introduzir NERICA-4 pode aumentar produtividade em 25%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Production by Province */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Produção por Província</CardTitle>
              </div>
              <Link to="/arroz/producao" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {productionChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Sem dados de produção</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowProductionForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              ) : (
                <ChartContainer config={{ production: { label: 'Produção', color: 'hsl(var(--primary))' } }} className="h-[300px]">
                  <BarChart data={productionChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => formatNumber(v)} />
                    <YAxis dataKey="province" type="category" width={100} tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number, name: string, props: any) => [
                        `${value.toLocaleString()} t (${props.payload.productivity} t/ha)`,
                        'Produção'
                      ]}
                    />
                    <Bar dataKey="production" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Imports by Origin - Pie Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-warning" />
                <CardTitle className="text-base font-semibold">Importações por Origem</CardTitle>
              </div>
              <Link to="/arroz/importacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {importPieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Sem dados de importação</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowImportForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ChartContainer config={{}} className="h-[280px] flex-1">
                    <PieChart>
                      <Pie
                        data={importPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percentage }) => `${percentage}%`}
                        labelLine={false}
                      >
                        {importPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        formatter={(value: number, name: string) => [`${value.toLocaleString()} t`, name]}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-2 min-w-[120px]">
                    {importPieData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production Trend */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <CardTitle className="text-base font-semibold">Evolução da Produção</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {yearlyTrendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Dados insuficientes</p>
                </div>
              ) : (
                <ChartContainer 
                  config={{ 
                    production: { label: 'Produção', color: 'hsl(var(--success))' },
                    area: { label: 'Área', color: 'hsl(var(--primary))' }
                  }} 
                  className="h-[280px]"
                >
                  <LineChart data={yearlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" tickFormatter={(v) => formatNumber(v)} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatNumber(v)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="production" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} name="Produção (t)" />
                    <Line yAxisId="right" type="monotone" dataKey="area" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Área (ha)" />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Self-Sufficiency Gauge */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <CardTitle className="text-base font-semibold">Taxa de Auto-suficiência</CardTitle>
              </div>
              <Link to="/arroz/politicas" className="text-sm text-primary hover:underline flex items-center gap-1">
                Políticas <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ChartContainer config={{}} className="h-[200px] w-[200px]">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="90%" 
                    data={selfSufficiencyData} 
                    startAngle={180} 
                    endAngle={0}
                  >
                    <RadialBar 
                      dataKey="value" 
                      cornerRadius={10} 
                      fill="hsl(var(--success))"
                      background={{ fill: 'hsl(var(--muted))' }}
                    />
                  </RadialBarChart>
                </ChartContainer>
              </div>
              <div className="text-center -mt-8">
                <p className="text-4xl font-bold text-foreground">{selfSufficiency.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Meta: {paramsMap['meta_auto_suficiencia'] || 70}%
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-semibold text-foreground">{formatNumber(totalProduction)}</p>
                  <p className="text-xs text-muted-foreground">Produção Nacional</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-semibold text-foreground">{formatNumber(totalConsumptionTonnes)}</p>
                  <p className="text-xs text-muted-foreground">Consumo Nacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Policy Impact */}
        <section className="card-elevated">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-display font-semibold text-foreground">
              Impacto de Políticas Governamentais
            </h3>
            <Link to="/arroz/politicas" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver políticas <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm font-medium text-foreground">
                  Subsídio de Sementes
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">+18.5%</p>
              <p className="text-xs text-muted-foreground">
                Aumento de produtividade em áreas beneficiadas
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm font-medium text-foreground">
                  Programa de Irrigação
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {paramsMap['area_irrigada_alvo'] ? `${formatNumber(paramsMap['area_irrigada_alvo'])} ha` : '45.000 ha'}
              </p>
              <p className="text-xs text-muted-foreground">
                Área irrigada em expansão
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-info" />
                <span className="text-sm font-medium text-foreground">
                  Crédito Agrícola
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">$12.5M</p>
              <p className="text-xs text-muted-foreground">
                Desembolsado para produtores de arroz
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Forms */}
      <RiceProductionForm
        open={showProductionForm}
        onOpenChange={setShowProductionForm}
      />
      <RiceImportForm
        open={showImportForm}
        onOpenChange={setShowImportForm}
      />
      <RicePriceForm
        open={showPriceForm}
        onOpenChange={setShowPriceForm}
      />
    </MainLayout>
  );
}
