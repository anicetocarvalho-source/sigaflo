import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Filter,
  Users,
  Leaf,
  TreePine,
  Coffee,
  Wheat,
  CloudRain,
  Gift,
  FileCheck,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  PieChart,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useProvinces } from '@/hooks/useFarmers';
import { toast } from 'sonner';
import { 
  fetchAndExport, 
  REPORT_CONFIGS, 
  REPORT_COLUMNS, 
  type ExportFormat 
} from '@/lib/exportService';

// Report types available
const reportCategories = [
  {
    id: 'farmers',
    label: 'Agricultores',
    icon: Users,
    color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    reports: [
      { id: 'farmers_summary', name: 'Resumo de Agricultores', description: 'Totais por tipo, província e status' },
      { id: 'farmers_detail', name: 'Lista Detalhada de Agricultores', description: 'Dados completos de todos os agricultores' },
      { id: 'cooperatives_members', name: 'Membros de Cooperativas', description: 'Agricultores por cooperativa' },
      { id: 'field_schools_members', name: 'Agricultores por Escola de Campo', description: 'Distribuição por ECA' },
    ],
  },
  {
    id: 'production',
    label: 'Produção',
    icon: Leaf,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    reports: [
      { id: 'production_summary', name: 'Resumo de Produção', description: 'Totais por cultura e região' },
      { id: 'production_evolution', name: 'Evolução da Produção', description: 'Comparativo anual de produção' },
      { id: 'production_by_farmer', name: 'Produção por Agricultor', description: 'Histórico individual de produção' },
      { id: 'yield_analysis', name: 'Análise de Rendimento', description: 'Produtividade por hectare' },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificados',
    icon: FileCheck,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    reports: [
      { id: 'certificates_issued', name: 'Certificados Emitidos', description: 'Lista de certificados por período' },
      { id: 'certificates_pending', name: 'Certificados Pendentes', description: 'Solicitações em análise' },
      { id: 'certificates_by_type', name: 'Certificados por Tipo', description: 'Distribuição por tipo de certificado' },
    ],
  },
  {
    id: 'climate',
    label: 'Ocorrências Climáticas',
    icon: CloudRain,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    reports: [
      { id: 'occurrences_summary', name: 'Resumo de Ocorrências', description: 'Totais por tipo e severidade' },
      { id: 'affected_areas', name: 'Áreas Afectadas', description: 'Mapeamento de impacto' },
      { id: 'loss_estimation', name: 'Estimativa de Perdas', description: 'Impacto económico por ocorrência' },
    ],
  },
  {
    id: 'forestry',
    label: 'Gestão Florestal',
    icon: TreePine,
    color: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
    reports: [
      { id: 'licenses_summary', name: 'Licenças Emitidas', description: 'Resumo de licenciamento florestal' },
      { id: 'transport_permits', name: 'Guias de Transporte', description: 'Movimentação de produtos florestais' },
      { id: 'reforestation_progress', name: 'Progresso de Reflorestamento', description: 'Árvores plantadas e sobrevivência' },
      { id: 'infractions', name: 'Infracções Florestais', description: 'Autos de infracção e multas' },
    ],
  },
  {
    id: 'coffee',
    label: 'Cadeia do Café',
    icon: Coffee,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    reports: [
      { id: 'coffee_lots', name: 'Lotes de Café', description: 'Rastreabilidade de lotes' },
      { id: 'coffee_exports', name: 'Exportações de Café', description: 'Volume e destinos de exportação' },
      { id: 'coffee_quality', name: 'Qualidade do Café', description: 'Classificação e grades' },
    ],
  },
  {
    id: 'rice',
    label: 'Produção de Arroz',
    icon: Wheat,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    reports: [
      { id: 'rice_production', name: 'Produção Nacional', description: 'Totais por província e campanha' },
      { id: 'rice_imports', name: 'Importações', description: 'Volume e origem das importações' },
      { id: 'rice_balance', name: 'Balanço Oferta/Procura', description: 'Análise de autossuficiência' },
    ],
  },
  {
    id: 'incentives',
    label: 'Incentivos',
    icon: Gift,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    reports: [
      { id: 'incentives_allocated', name: 'Incentivos Alocados', description: 'Distribuição por programa' },
      { id: 'beneficiaries', name: 'Beneficiários', description: 'Lista de agricultores beneficiados' },
      { id: 'program_impact', name: 'Impacto dos Programas', description: 'Métricas de resultado' },
    ],
  },
];

// Mock recent reports
const recentReports = [
  { id: '1', name: 'Resumo de Agricultores - Luanda', date: '2025-12-28', status: 'completed', format: 'xlsx' },
  { id: '2', name: 'Produção Agrícola 2025', date: '2025-12-27', status: 'completed', format: 'pdf' },
  { id: '3', name: 'Certificados Emitidos - Dezembro', date: '2025-12-26', status: 'processing', format: 'xlsx' },
  { id: '4', name: 'Ocorrências Climáticas Q4', date: '2025-12-25', status: 'completed', format: 'pdf' },
  { id: '5', name: 'Lotes de Café Exportados', date: '2025-12-24', status: 'failed', format: 'xlsx' },
];

// Quick stats for dashboard
const quickStats = [
  { label: 'Relatórios Gerados', value: '1,247', icon: FileText, change: '+12%' },
  { label: 'Downloads Este Mês', value: '384', icon: Download, change: '+8%' },
  { label: 'Relatórios Agendados', value: '23', icon: Calendar, change: '0%' },
  { label: 'Em Processamento', value: '3', icon: Loader2, change: '-2' },
];

const ReportsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedFormat, setSelectedFormat] = useState<string>('xlsx');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: provinces } = useProvinces();

  const handleGenerateReport = async (reportId: string, reportName: string) => {
    setIsGenerating(reportId);
    
    try {
      // Map report IDs to base configs
      const baseConfigs: Record<string, { tableName: string; select: string; orderBy?: { column: string; ascending: boolean }; defaultFilters?: Record<string, any> }> = {
        farmers_summary: { ...REPORT_CONFIGS.farmers },
        farmers_detail: { ...REPORT_CONFIGS.farmers },
        cooperatives_members: { ...REPORT_CONFIGS.farmers, defaultFilters: { farmer_type: 'cooperative' } },
        production_summary: { ...REPORT_CONFIGS.production },
        production_evolution: { ...REPORT_CONFIGS.production },
        certificates_issued: { ...REPORT_CONFIGS.certificates, defaultFilters: { status: 'issued' } },
        certificates_pending: { ...REPORT_CONFIGS.certificates, defaultFilters: { status: 'pending' } },
        coffee_lots: { ...REPORT_CONFIGS.coffee_lots },
        coffee_exports: { ...REPORT_CONFIGS.coffee_lots, defaultFilters: { status: 'exported' } },
        occurrences_summary: { ...REPORT_CONFIGS.occurrences },
      };

      const columnsMap: Record<string, typeof REPORT_COLUMNS[keyof typeof REPORT_COLUMNS]> = {
        farmers_summary: REPORT_COLUMNS.farmers,
        farmers_detail: REPORT_COLUMNS.farmers,
        cooperatives_members: REPORT_COLUMNS.farmers,
        production_summary: REPORT_COLUMNS.production,
        production_evolution: REPORT_COLUMNS.production,
        certificates_issued: REPORT_COLUMNS.certificates,
        certificates_pending: REPORT_COLUMNS.certificates,
        coffee_lots: REPORT_COLUMNS.coffee_lots,
        coffee_exports: REPORT_COLUMNS.coffee_lots,
        occurrences_summary: REPORT_COLUMNS.occurrences,
      };

      const baseConfig = baseConfigs[reportId];
      const columns = columnsMap[reportId];
      
      if (baseConfig && columns) {
        // Combine default filters with province filter
        const filters: Record<string, any> = {
          ...(baseConfig.defaultFilters || {}),
          ...(selectedProvince !== 'all' && { province_id: selectedProvince }),
        };

        await fetchAndExport(
          selectedFormat as ExportFormat,
          { 
            tableName: baseConfig.tableName, 
            select: baseConfig.select, 
            orderBy: baseConfig.orderBy,
            filters 
          },
          {
            filename: `${reportId}_${new Date().toISOString().split('T')[0]}`,
            title: reportName,
            subtitle: `Gerado em ${new Date().toLocaleDateString('pt-AO')}`,
            columns,
          }
        );

        toast.success(`Relatório "${reportName}" gerado com sucesso!`, {
          description: `Ficheiro ${selectedFormat.toUpperCase()} descarregado.`,
        });
      } else {
        // Fallback for reports not yet mapped
        toast.info('Configuração de relatório em desenvolvimento');
      }
    } catch (error: any) {
      toast.error('Erro ao gerar relatório: ' + error.message);
    } finally {
      setIsGenerating(null);
    }
  };

  const filteredCategories = selectedCategory === 'all' 
    ? reportCategories 
    : reportCategories.filter(c => c.id === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> A processar</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" /> Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout 
      title="Relatórios" 
      subtitle="Gere e exporte relatórios do sistema"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="p-2 rounded-lg bg-muted">
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate" className="gap-2">
              <FileText className="h-4 w-4" />
              Gerar Relatório
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="h-4 w-4" />
              Agendados
            </TabsTrigger>
          </TabsList>

          {/* Generate Report Tab */}
          <TabsContent value="generate" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros de Relatório
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {reportCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Província</label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as províncias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Províncias</SelectItem>
                        {provinces?.map(prov => (
                          <SelectItem key={prov.id} value={prov.id}>
                            {prov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mês</SelectItem>
                        <SelectItem value="quarter">Último Trimestre</SelectItem>
                        <SelectItem value="year">Último Ano</SelectItem>
                        <SelectItem value="all">Todo o Período</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Formato</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Excel (.xlsx)
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-red-600" />
                            PDF (.pdf)
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            CSV (.csv)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pesquisar</label>
                    <Input
                      placeholder="Nome do relatório..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Categories */}
            <div className="grid gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.label}</CardTitle>
                        <CardDescription>{category.reports.length} relatórios disponíveis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {category.reports
                        .filter(r => !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{report.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {report.description}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Pré-visualização em desenvolvimento')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleGenerateReport(report.id, report.name)}
                                disabled={isGenerating === report.id}
                              >
                                {isGenerating === report.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Histórico de Relatórios</CardTitle>
                    <CardDescription>Relatórios gerados recentemente</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Relatório</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString('pt-AO')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {report.format}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === 'completed' && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {report.status === 'failed' && (
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatórios Agendados</CardTitle>
                    <CardDescription>Configure relatórios automáticos</CardDescription>
                  </div>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum relatório agendado</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure relatórios automáticos para serem gerados periodicamente
                  </p>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Configurar Primeiro Agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
