import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Bug, 
  Leaf, 
  AlertTriangle, 
  BarChart3, 
  List, 
  Map as MapIcon,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  FileText,
  Eye
} from 'lucide-react';
import { useOccurrences } from '@/hooks/useOccurrences';
import { PhytosanitaryOccurrenceForm } from '@/components/occurrences/PhytosanitaryOccurrenceForm';
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

const PHYTOSANITARY_TYPES = ['pest', 'disease'];

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pest: { label: 'Praga', icon: <Bug className="h-4 w-4" />, color: 'hsl(var(--destructive))' },
  disease: { label: 'Doença', icon: <Leaf className="h-4 w-4" />, color: 'hsl(var(--warning))' },
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

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--muted))'];

export default function PhytosanitaryOccurrencesPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: allOccurrences, isLoading } = useOccurrences();

  // Filter only phytosanitary occurrences
  const occurrences = allOccurrences?.filter(o => 
    PHYTOSANITARY_TYPES.includes(o.occurrence_type)
  ) || [];

  // Calculate KPIs
  const totalOccurrences = occurrences.length;
  const activeOccurrences = occurrences.filter(o => o.status !== 'resolved').length;
  const criticalOccurrences = occurrences.filter(o => o.severity === 'critical' || o.severity === 'high').length;
  const totalAffectedArea = occurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0);
  const totalAffectedFarmers = occurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0);
  const pestCount = occurrences.filter(o => o.occurrence_type === 'pest').length;
  const diseaseCount = occurrences.filter(o => o.occurrence_type === 'disease').length;

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
    { name: 'Pragas', value: pestCount, color: COLORS[0] },
    { name: 'Doenças', value: diseaseCount, color: COLORS[1] },
  ];

  const severityDistribution = [
    { name: 'Crítico', value: occurrences.filter(o => o.severity === 'critical').length },
    { name: 'Alto', value: occurrences.filter(o => o.severity === 'high').length },
    { name: 'Médio', value: occurrences.filter(o => o.severity === 'medium').length },
    { name: 'Baixo', value: occurrences.filter(o => o.severity === 'low').length },
  ];

  // Monthly trend data (simulated based on report dates)
  const monthlyData = occurrences.reduce((acc, o) => {
    const month = format(new Date(o.report_date), 'MMM', { locale: pt });
    const existing = acc.find(m => m.month === month);
    if (existing) {
      existing.pragas += o.occurrence_type === 'pest' ? 1 : 0;
      existing.doencas += o.occurrence_type === 'disease' ? 1 : 0;
    } else {
      acc.push({
        month,
        pragas: o.occurrence_type === 'pest' ? 1 : 0,
        doencas: o.occurrence_type === 'disease' ? 1 : 0,
      });
    }
    return acc;
  }, [] as { month: string; pragas: number; doencas: number }[]).slice(-6);

  if (isLoading) {
    return (
      <MainLayout title="Ocorrências Fitossanitárias" subtitle="Monitoramento de pragas e doenças">
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
    <MainLayout title="Ocorrências Fitossanitárias" subtitle="Monitoramento de pragas e doenças">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
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
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOccurrences}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{pestCount} pragas</span>
                    <span>•</span>
                    <span>{diseaseCount} doenças</span>
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
                  <CardTitle className="text-sm font-medium">Agricultores Afectados</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAffectedFarmers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total acumulado
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
                  <CardDescription>Pragas vs Doenças</CardDescription>
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
                  <CardDescription>Evolução de ocorrências ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="pragas" 
                          stackId="1" 
                          stroke="hsl(var(--destructive))" 
                          fill="hsl(var(--destructive))" 
                          fillOpacity={0.6}
                          name="Pragas"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="doencas" 
                          stackId="1" 
                          stroke="hsl(var(--warning))" 
                          fill="hsl(var(--warning))" 
                          fillOpacity={0.6}
                          name="Doenças"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Occurrences */}
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências Recentes</CardTitle>
                <CardDescription>Últimas ocorrências fitossanitárias registadas</CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occurrences.slice(0, 5).map((occurrence) => (
                      <TableRow key={occurrence.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {typeConfig[occurrence.occurrence_type]?.icon}
                            <span>{typeConfig[occurrence.occurrence_type]?.label || occurrence.occurrence_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{occurrence.title}</TableCell>
                        <TableCell>
                          {occurrence.provinces?.name || 'N/A'}
                          {occurrence.municipalities?.name && `, ${occurrence.municipalities.name}`}
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
                      </TableRow>
                    ))}
                    {occurrences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma ocorrência fitossanitária registada
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
                <CardTitle>Lista de Ocorrências Fitossanitárias</CardTitle>
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
                      <SelectItem value="pest">Pragas</SelectItem>
                      <SelectItem value="disease">Doenças</SelectItem>
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
                    {filteredOccurrences.map((occurrence) => (
                      <TableRow key={occurrence.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {typeConfig[occurrence.occurrence_type]?.icon}
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOccurrences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Nenhuma ocorrência encontrada com os filtros aplicados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Ocorrências Fitossanitárias</CardTitle>
                <CardDescription>Visualização geográfica de pragas e doenças</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Mapa de ocorrências fitossanitárias
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
                  <CardDescription>Gere relatórios fitossanitários</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Relatório Mensal de Pragas', desc: 'Resumo mensal de ocorrências de pragas' },
                    { title: 'Relatório de Doenças por Cultura', desc: 'Doenças agrupadas por tipo de cultura' },
                    { title: 'Análise de Impacto Regional', desc: 'Impacto por província e município' },
                    { title: 'Recomendações de Tratamento', desc: 'Boas práticas e tratamentos sugeridos' },
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
                  <CardTitle>Estatísticas Rápidas</CardTitle>
                  <CardDescription>Resumo do período actual</CardDescription>
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
                      <div className="text-2xl font-bold text-destructive">{pestCount}</div>
                      <div className="text-xs text-muted-foreground">Pragas</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{diseaseCount}</div>
                      <div className="text-xs text-muted-foreground">Doenças</div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <p className="text-sm font-medium">Pragas/Doenças mais comuns:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Lagarta do milho', 'Ferrugem', 'Mosca da fruta', 'Oídio'].map((item) => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <PhytosanitaryOccurrenceForm open={showForm} onOpenChange={setShowForm} />
      </div>
    </MainLayout>
  );
}
