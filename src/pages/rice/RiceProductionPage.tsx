import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import {
  Wheat,
  Plus,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  Droplets,
  Target,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from 'lucide-react';
import { useRiceProduction, type RiceProduction } from '@/hooks/useRice';
import { RiceProductionForm } from '@/components/rice/forms';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))', '#8b5cf6', '#06b6d4', '#ec4899'];
const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const RiceProductionPage = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: production, isLoading, refetch } = useRiceProduction();
  const { provinces } = useLocationCascade();

  // Get unique years from data
  const years = [...new Set(production?.map(p => p.year) || [])].sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();

  // Filter data
  const filteredData = production?.filter(p => {
    const matchesYear = selectedYear === 'all' || p.year === parseInt(selectedYear);
    const matchesProvince = selectedProvince === 'all' || p.province_id === selectedProvince;
    const matchesSeason = selectedSeason === 'all' || p.season === selectedSeason;
    const matchesSearch = !searchTerm || 
      p.provinces?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variety?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesProvince && matchesSeason && matchesSearch;
  }) || [];

  // Calculate KPIs
  const totalProduction = filteredData.reduce((sum, p) => sum + Number(p.production_tonnes), 0);
  const totalArea = filteredData.reduce((sum, p) => sum + Number(p.cultivated_area_ha), 0);
  const totalHarvested = filteredData.reduce((sum, p) => sum + Number(p.harvested_area_ha), 0);
  const avgProductivity = totalHarvested > 0 ? (totalProduction * 1000) / totalHarvested : 0;
  const harvestEfficiency = totalArea > 0 ? (totalHarvested / totalArea) * 100 : 0;

  // Yearly comparison
  const currentYearData = production?.filter(p => p.year === currentYear) || [];
  const lastYearData = production?.filter(p => p.year === currentYear - 1) || [];
  const currentYearTotal = currentYearData.reduce((sum, p) => sum + Number(p.production_tonnes), 0);
  const lastYearTotal = lastYearData.reduce((sum, p) => sum + Number(p.production_tonnes), 0);
  const yearOverYearChange = lastYearTotal > 0 ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

  // Aggregate by year for trend chart
  const byYear = production?.reduce((acc: Record<number, any>, p) => {
    if (!acc[p.year]) {
      acc[p.year] = { year: p.year, production: 0, area: 0, productivity: 0, count: 0 };
    }
    acc[p.year].production += Number(p.production_tonnes);
    acc[p.year].area += Number(p.cultivated_area_ha);
    acc[p.year].count++;
    return acc;
  }, {});

  const yearlyTrendData = Object.values(byYear || {})
    .map((d: any) => ({
      ...d,
      productivity: d.area > 0 ? Math.round((d.production * 1000) / d.area) : 0
    }))
    .sort((a: any, b: any) => a.year - b.year);

  // Aggregate by province
  const byProvince = filteredData.reduce((acc: Record<string, any>, p) => {
    const name = p.provinces?.name || 'Não especificado';
    if (!acc[name]) {
      acc[name] = { name, production: 0, area: 0, harvested: 0, count: 0 };
    }
    acc[name].production += Number(p.production_tonnes);
    acc[name].area += Number(p.cultivated_area_ha);
    acc[name].harvested += Number(p.harvested_area_ha);
    acc[name].count++;
    return acc;
  }, {});

  const provinceData = Object.values(byProvince)
    .map((d: any) => ({
      ...d,
      productivity: d.harvested > 0 ? Math.round((d.production * 1000) / d.harvested) : 0
    }))
    .sort((a: any, b: any) => b.production - a.production);

  // Aggregate by season
  const bySeason = filteredData.reduce((acc: Record<string, any>, p) => {
    if (!acc[p.season]) {
      acc[p.season] = { name: p.season, production: 0, area: 0 };
    }
    acc[p.season].production += Number(p.production_tonnes);
    acc[p.season].area += Number(p.cultivated_area_ha);
    return acc;
  }, {});

  const seasonData = Object.values(bySeason);

  // Aggregate by variety
  const byVariety = filteredData.reduce((acc: Record<string, any>, p) => {
    const variety = p.variety || 'Não especificado';
    if (!acc[variety]) {
      acc[variety] = { name: variety, production: 0, count: 0 };
    }
    acc[variety].production += Number(p.production_tonnes);
    acc[variety].count++;
    return acc;
  }, {});

  const varietyData = Object.values(byVariety)
    .sort((a: any, b: any) => b.production - a.production)
    .slice(0, 6);

  // Aggregate by irrigation
  const byIrrigation = filteredData.reduce((acc: Record<string, any>, p) => {
    const type = p.irrigation_type || 'Não especificado';
    if (!acc[type]) {
      acc[type] = { name: type, production: 0, area: 0 };
    }
    acc[type].production += Number(p.production_tonnes);
    acc[type].area += Number(p.cultivated_area_ha);
    return acc;
  }, {});

  const irrigationData = Object.values(byIrrigation);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return new Intl.NumberFormat('pt-AO').format(Math.round(num));
    return num.toFixed(0);
  };

  const handleExport = () => {
    const headers = ['Ano', 'Época', 'Província', 'Área Cultivada (ha)', 'Área Colhida (ha)', 'Produção (t)', 'Produtividade (kg/ha)', 'Variedade', 'Irrigação'];
    const rows = filteredData.map(p => [
      p.year,
      p.season,
      p.provinces?.name || '',
      p.cultivated_area_ha,
      p.harvested_area_ha,
      p.production_tonnes,
      p.productivity_kg_ha,
      p.variety || '',
      p.irrigation_type || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `producao_arroz_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Dados exportados com sucesso');
  };

  return (
    <MainLayout
      title="Produção Nacional de Arroz"
      subtitle="Dados detalhados da produção de arroz por província, época e variedade"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar dados...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                {filteredData.length} registos
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registar Produção
            </Button>
            <RiceProductionForm 
              open={showForm} 
              onOpenChange={(open) => {
                setShowForm(open);
                if (!open) refetch();
              }} 
            />
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Província" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Províncias</SelectItem>
                  {provinces?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <Droplets className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Época" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Épocas</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="secundaria">Secundária</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedProvince('all');
                  setSelectedSeason('all');
                  setSearchTerm('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalProduction)}</p>
                <p className="text-sm text-muted-foreground">Produção Total (t)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalArea)}</p>
                <p className="text-sm text-muted-foreground">Área Cultivada (ha)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(avgProductivity)}</p>
                <p className="text-sm text-muted-foreground">Produtividade (kg/ha)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Wheat className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{harvestEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Colheita</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${yearOverYearChange >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {yearOverYearChange >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-success" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${yearOverYearChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {yearOverYearChange >= 0 ? '+' : ''}{yearOverYearChange.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">vs Ano Anterior</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Data */}
        <Tabs defaultValue="charts" className="w-full">
          <TabsList>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="provinces" className="gap-2">
              <MapPin className="h-4 w-4" />
              Por Província
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Tabela Completa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-6 space-y-6">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Evolução da Produção Nacional
                </CardTitle>
                <CardDescription>
                  Produção anual de arroz e produtividade média
                </CardDescription>
              </CardHeader>
              <CardContent>
                {yearlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={yearlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'Produção' ? `${formatNumber(value)} t` : `${value} kg/ha`,
                          name
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="production" name="Produção" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="productivity" name="Produtividade" stroke="hsl(var(--success))" strokeWidth={3} dot={{ fill: 'hsl(var(--success))' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* By Variety */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produção por Variedade</CardTitle>
                </CardHeader>
                <CardContent>
                  {varietyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={varietyData}
                          dataKey="production"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {varietyData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Irrigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produção por Tipo de Irrigação</CardTitle>
                </CardHeader>
                <CardContent>
                  {irrigationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={irrigationData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                        <Bar dataKey="production" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Season Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  Produção por Época Agrícola
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seasonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={seasonData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                      <Bar dataKey="production" name="Produção (t)" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="area" name="Área (ha)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provinces" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Produção por Província</CardTitle>
                <CardDescription>
                  Comparativo detalhado de produção, área e produtividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                {provinceData.length > 0 ? (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={provinceData.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'Produção' ? `${formatNumber(value)} t` : 
                            name === 'Área' ? `${formatNumber(value)} ha` :
                            `${value} kg/ha`,
                            name
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="production" name="Produção" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {provinceData.slice(0, 6).map((p: any, i) => (
                        <Card key={p.name} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                  />
                                  <p className="font-semibold">{p.name}</p>
                                </div>
                                <p className="mt-2 text-2xl font-bold">{formatNumber(p.production)} t</p>
                              </div>
                              <Badge variant="secondary">{p.count} registos</Badge>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Área</p>
                                <p className="font-medium">{formatNumber(p.area)} ha</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Produtividade</p>
                                <p className="font-medium">{p.productivity} kg/ha</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registos de Produção</CardTitle>
                    <CardDescription>
                      Lista completa de todos os registos de produção de arroz
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{filteredData.length} registos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="max-h-[600px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Ano</TableHead>
                          <TableHead>Época</TableHead>
                          <TableHead>Província</TableHead>
                          <TableHead className="text-right">Área Cultivada</TableHead>
                          <TableHead className="text-right">Área Colhida</TableHead>
                          <TableHead className="text-right">Produção</TableHead>
                          <TableHead className="text-right">Produtividade</TableHead>
                          <TableHead>Variedade</TableHead>
                          <TableHead>Irrigação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.year}</TableCell>
                              <TableCell>
                                <Badge variant={p.season === 'principal' ? 'default' : 'secondary'}>
                                  {p.season}
                                </Badge>
                              </TableCell>
                              <TableCell>{p.provinces?.name || '—'}</TableCell>
                              <TableCell className="text-right">{formatNumber(p.cultivated_area_ha)} ha</TableCell>
                              <TableCell className="text-right">{formatNumber(p.harvested_area_ha)} ha</TableCell>
                              <TableCell className="text-right font-medium">{formatNumber(p.production_tonnes)} t</TableCell>
                              <TableCell className="text-right">{formatNumber(p.productivity_kg_ha)} kg/ha</TableCell>
                              <TableCell>{p.variety || '—'}</TableCell>
                              <TableCell>{p.irrigation_type || '—'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                              Nenhum registo encontrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RiceProductionPage;
