import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportOccurrenceForm } from '@/components/occurrences/ReportOccurrenceForm';
import { 
  AlertTriangle, 
  Search, 
  MapPin,
  Plus,
  Sun,
  Droplets,
  Snowflake,
  Flame,
  CloudRain,
  Wind,
  ThermometerSun,
  Eye,
  BarChart3,
  List,
  Map as MapIcon,
  FileText,
  Activity,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useOccurrences } from '@/hooks/useOccurrences';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Only climate-related types (excluding pest and disease)
const CLIMATE_TYPES = ['drought', 'flood', 'frost', 'hail', 'fire', 'storm', 'other'];

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  drought: { label: 'Seca', icon: <Sun className="h-4 w-4" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  flood: { label: 'Inundação', icon: <Droplets className="h-4 w-4" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  frost: { label: 'Geada', icon: <Snowflake className="h-4 w-4" />, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  hail: { label: 'Granizo', icon: <CloudRain className="h-4 w-4" />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  fire: { label: 'Incêndio', icon: <Flame className="h-4 w-4" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  storm: { label: 'Tempestade', icon: <Wind className="h-4 w-4" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  other: { label: 'Outro', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

const severityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  critical: { label: 'Crítico', variant: 'destructive' },
  high: { label: 'Alto', variant: 'destructive' },
  medium: { label: 'Médio', variant: 'default' },
  low: { label: 'Baixo', variant: 'secondary' },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  reported: { label: 'Reportado', variant: 'outline' },
  investigating: { label: 'Investigando', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  resolved: { label: 'Resolvido', variant: 'outline' },
};

const COLORS = ['hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export default function ClimateOccurrencesPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: allOccurrences, isLoading } = useOccurrences();

  // Filter only climate occurrences (exclude pest and disease)
  const occurrences = allOccurrences?.filter(o => 
    !['pest', 'disease'].includes(o.occurrence_type)
  ) || [];

  // Calculate KPIs
  const totalOccurrences = occurrences.length;
  const activeOccurrences = occurrences.filter(o => o.status !== 'resolved').length;
  const criticalOccurrences = occurrences.filter(o => o.severity === 'critical' || o.severity === 'high').length;
  const totalAffectedArea = occurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0);
  const totalAffectedFarmers = occurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0);
  const totalEstimatedLoss = occurrences.reduce((sum, o) => sum + (o.estimated_loss_aoa || 0), 0);

  // Count by type
  const droughtCount = occurrences.filter(o => o.occurrence_type === 'drought').length;
  const floodCount = occurrences.filter(o => o.occurrence_type === 'flood').length;
  const frostCount = occurrences.filter(o => o.occurrence_type === 'frost').length;
  const fireCount = occurrences.filter(o => o.occurrence_type === 'fire').length;

  // Filter occurrences for list view
  const filteredOccurrences = occurrences.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || o.occurrence_type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || o.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Prepare chart data
  const typeDistribution = [
    { name: 'Seca', value: droughtCount },
    { name: 'Inundação', value: floodCount },
    { name: 'Geada', value: frostCount },
    { name: 'Incêndio', value: fireCount },
    { name: 'Outros', value: occurrences.filter(o => !['drought', 'flood', 'frost', 'fire'].includes(o.occurrence_type)).length },
  ].filter(d => d.value > 0);

  const severityDistribution = [
    { name: 'Crítico', value: occurrences.filter(o => o.severity === 'critical').length },
    { name: 'Alto', value: occurrences.filter(o => o.severity === 'high').length },
    { name: 'Médio', value: occurrences.filter(o => o.severity === 'medium').length },
    { name: 'Baixo', value: occurrences.filter(o => o.severity === 'low').length },
  ];

  // Monthly trend data
  const monthlyData = occurrences.reduce((acc, o) => {
    const month = format(new Date(o.report_date), 'MMM', { locale: pt });
    const existing = acc.find(m => m.month === month);
    if (existing) {
      existing.ocorrencias += 1;
      existing.area += o.affected_area_ha || 0;
    } else {
      acc.push({
        month,
        ocorrencias: 1,
        area: o.affected_area_ha || 0,
      });
    }
    return acc;
  }, [] as { month: string; ocorrencias: number; area: number }[]).slice(-6);

  if (isLoading) {
    return (
      <MainLayout title="Ocorrências Climáticas" subtitle="Monitoramento de eventos climáticos">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Ocorrências Climáticas" subtitle="Monitoramento de eventos climáticos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CloudRain className="h-8 w-8 text-primary" />
              Ocorrências Climáticas
            </h1>
            <p className="text-muted-foreground">
              Monitoramento de secas, inundações, geadas e outros eventos climáticos
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
                  <CloudRain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOccurrences}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{droughtCount} secas</span>
                    <span>•</span>
                    <span>{floodCount} inundações</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ocorrências Activas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeOccurrences}</div>
                  <p className="text-xs text-muted-foreground">
                    {criticalOccurrences} com severidade alta/crítica
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Área Afectada</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAffectedArea.toLocaleString()} ha</div>
                  <p className="text-xs text-muted-foreground">
                    Total acumulado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Perdas Estimadas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(totalEstimatedLoss / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AOA em perdas estimadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Tipos de eventos climáticos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Severidade</CardTitle>
                  <CardDescription>Classificação das ocorrências</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                  <CardDescription>Evolução de ocorrências e área afectada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="ocorrencias" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.6}
                          name="Ocorrências"
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="area" 
                          stroke="hsl(var(--warning))" 
                          fill="hsl(var(--warning))" 
                          fillOpacity={0.4}
                          name="Área (ha)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats by Type */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Sun className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{droughtCount}</p>
                      <p className="text-sm text-muted-foreground">Secas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Droplets className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{floodCount}</p>
                      <p className="text-sm text-muted-foreground">Inundações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-cyan-500/5 border-cyan-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Snowflake className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{frostCount}</p>
                      <p className="text-sm text-muted-foreground">Geadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{fireCount}</p>
                      <p className="text-sm text-muted-foreground">Incêndios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Occurrences Table */}
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências Recentes</CardTitle>
                <CardDescription>Últimas ocorrências climáticas registadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occurrences.slice(0, 5).map((occurrence) => {
                      const config = typeConfig[occurrence.occurrence_type] || typeConfig.other;
                      return (
                        <TableRow key={occurrence.id}>
                          <TableCell>
                            <div className={`flex items-center gap-2 px-2 py-1 rounded ${config.bg} w-fit`}>
                              {config.icon}
                              <span className={`text-sm ${config.color}`}>{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{occurrence.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {occurrence.provinces?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={severityConfig[occurrence.severity]?.variant || 'secondary'}>
                              {severityConfig[occurrence.severity]?.label || occurrence.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[occurrence.status]?.variant || 'outline'}>
                              {statusConfig[occurrence.status]?.label || occurrence.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(occurrence.report_date), 'dd/MM/yyyy', { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/ocorrencias/climaticas/${occurrence.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {occurrences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhuma ocorrência climática registada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Ocorrências Climáticas</CardTitle>
                <CardDescription>
                  {filteredOccurrences.length} ocorrência(s) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar ocorrências..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="drought">Seca</SelectItem>
                      <SelectItem value="flood">Inundação</SelectItem>
                      <SelectItem value="frost">Geada</SelectItem>
                      <SelectItem value="hail">Granizo</SelectItem>
                      <SelectItem value="fire">Incêndio</SelectItem>
                      <SelectItem value="storm">Tempestade</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as severidades</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Agricultores</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOccurrences.map((occurrence) => {
                      const config = typeConfig[occurrence.occurrence_type] || typeConfig.other;
                      return (
                        <TableRow key={occurrence.id}>
                          <TableCell>
                            <div className={`flex items-center gap-2 ${config.color}`}>
                              {config.icon}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {occurrence.title}
                          </TableCell>
                          <TableCell>
                            {occurrence.provinces?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {occurrence.affected_area_ha?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>
                            {occurrence.affected_farmers_count?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={severityConfig[occurrence.severity]?.variant || 'secondary'}>
                              {severityConfig[occurrence.severity]?.label || occurrence.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[occurrence.status]?.variant || 'outline'}>
                              {statusConfig[occurrence.status]?.label || occurrence.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(occurrence.report_date), 'dd/MM/yyyy', { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/ocorrencias/climaticas/${occurrence.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredOccurrences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Nenhuma ocorrência encontrada com os filtros aplicados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Summary */}
                {filteredOccurrences.length > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t mt-4">
                    <span>{filteredOccurrences.length} ocorrências</span>
                    <div className="flex gap-4">
                      <span>{totalAffectedFarmers.toLocaleString()} agricultores afectados</span>
                      <span>{totalAffectedArea.toLocaleString()} ha afectados</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Ocorrências Climáticas</CardTitle>
                <CardDescription>Visualização geográfica de eventos climáticos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Mapa de ocorrências climáticas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {occurrences.filter(o => o.latitude && o.longitude).length} ocorrências com coordenadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Disponíveis</CardTitle>
                  <CardDescription>Gere relatórios de ocorrências climáticas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Relatório Mensal de Secas', desc: 'Resumo mensal de ocorrências de seca' },
                    { title: 'Relatório de Inundações por Região', desc: 'Inundações agrupadas por província' },
                    { title: 'Análise de Impacto Climático', desc: 'Impacto económico e social por tipo' },
                    { title: 'Alerta Precoce', desc: 'Previsões e alertas baseados em histórico' },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">{report.desc}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Período</CardTitle>
                  <CardDescription>Estatísticas consolidadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Resolução</span>
                      <span className="font-medium">
                        {totalOccurrences > 0 
                          ? Math.round((occurrences.filter(o => o.status === 'resolved').length / totalOccurrences) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${totalOccurrences > 0 
                            ? (occurrences.filter(o => o.status === 'resolved').length / totalOccurrences) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{totalAffectedFarmers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Agricultores Afectados</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{totalAffectedArea.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Hectares Afectados</div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <p className="text-sm font-medium">Províncias mais afectadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(occurrences.map(o => o.provinces?.name).filter(Boolean))).slice(0, 4).map((province) => (
                        <Badge key={province} variant="outline">{province}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <ReportOccurrenceForm open={showForm} onOpenChange={setShowForm} />
      </div>
    </MainLayout>
  );
}
