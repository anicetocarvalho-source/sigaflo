import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ComposedChart,
  Area
} from 'recharts';
import {
  Ship,
  Plus,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar,
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  DollarSign,
  Anchor,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Building2
} from 'lucide-react';
import { useRiceImports, type RiceImport } from '@/hooks/useRice';
import { RiceImportForm } from '@/components/rice/forms';
import { toast } from 'sonner';

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const MONTHS = [
  { value: 1, label: 'Janeiro', short: 'Jan' },
  { value: 2, label: 'Fevereiro', short: 'Fev' },
  { value: 3, label: 'Março', short: 'Mar' },
  { value: 4, label: 'Abril', short: 'Abr' },
  { value: 5, label: 'Maio', short: 'Mai' },
  { value: 6, label: 'Junho', short: 'Jun' },
  { value: 7, label: 'Julho', short: 'Jul' },
  { value: 8, label: 'Agosto', short: 'Ago' },
  { value: 9, label: 'Setembro', short: 'Set' },
  { value: 10, label: 'Outubro', short: 'Out' },
  { value: 11, label: 'Novembro', short: 'Nov' },
  { value: 12, label: 'Dezembro', short: 'Dez' },
];

const RiceImportsPage = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedPort, setSelectedPort] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: imports, isLoading, refetch } = useRiceImports();

  // Get unique values for filters
  const years = [...new Set(imports?.map(i => i.year) || [])].sort((a, b) => b - a);
  const countries = [...new Set(imports?.map(i => i.origin_country) || [])].sort();
  const ports = [...new Set(imports?.map(i => i.port_of_entry).filter(Boolean) || [])].sort();
  const currentYear = new Date().getFullYear();

  // Filter data
  const filteredData = imports?.filter(i => {
    const matchesYear = selectedYear === 'all' || i.year === parseInt(selectedYear);
    const matchesCountry = selectedCountry === 'all' || i.origin_country === selectedCountry;
    const matchesPort = selectedPort === 'all' || i.port_of_entry === selectedPort;
    const matchesSearch = !searchTerm || 
      i.origin_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.importer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.rice_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesCountry && matchesPort && matchesSearch;
  }) || [];

  // Calculate KPIs
  const totalVolume = filteredData.reduce((sum, i) => sum + Number(i.volume_tonnes), 0);
  const totalValue = filteredData.reduce((sum, i) => sum + Number(i.total_value_usd || 0), 0);
  const avgCIF = filteredData.filter(i => i.price_cif_usd).length > 0
    ? filteredData.reduce((sum, i) => sum + Number(i.price_cif_usd || 0), 0) / filteredData.filter(i => i.price_cif_usd).length
    : 0;
  const uniqueCountries = new Set(filteredData.map(i => i.origin_country)).size;

  // Year over year comparison
  const currentYearData = imports?.filter(i => i.year === currentYear) || [];
  const lastYearData = imports?.filter(i => i.year === currentYear - 1) || [];
  const currentYearTotal = currentYearData.reduce((sum, i) => sum + Number(i.volume_tonnes), 0);
  const lastYearTotal = lastYearData.reduce((sum, i) => sum + Number(i.volume_tonnes), 0);
  const yearOverYearChange = lastYearTotal > 0 ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

  // Aggregate by year for trend chart
  const byYear = imports?.reduce((acc: Record<number, any>, i) => {
    if (!acc[i.year]) {
      acc[i.year] = { year: i.year, volume: 0, value: 0, avgCIF: 0, count: 0, cifSum: 0 };
    }
    acc[i.year].volume += Number(i.volume_tonnes);
    acc[i.year].value += Number(i.total_value_usd || 0);
    if (i.price_cif_usd) {
      acc[i.year].cifSum += Number(i.price_cif_usd);
      acc[i.year].count++;
    }
    return acc;
  }, {});

  const yearlyTrendData = Object.values(byYear || {})
    .map((d: any) => ({
      ...d,
      avgCIF: d.count > 0 ? Math.round(d.cifSum / d.count) : 0
    }))
    .sort((a: any, b: any) => a.year - b.year);

  // Aggregate by country
  const byCountry = filteredData.reduce((acc: Record<string, any>, i) => {
    const country = i.origin_country || 'Não especificado';
    if (!acc[country]) {
      acc[country] = { name: country, volume: 0, value: 0, count: 0 };
    }
    acc[country].volume += Number(i.volume_tonnes);
    acc[country].value += Number(i.total_value_usd || 0);
    acc[country].count++;
    return acc;
  }, {});

  const countryData = Object.values(byCountry)
    .map((d: any) => ({
      ...d,
      percentage: totalVolume > 0 ? ((d.volume / totalVolume) * 100).toFixed(1) : 0
    }))
    .sort((a: any, b: any) => b.volume - a.volume);

  // Aggregate by month (for selected year or current year)
  const targetYear = selectedYear !== 'all' ? parseInt(selectedYear) : currentYear;
  const byMonth = imports
    ?.filter(i => i.year === targetYear)
    ?.reduce((acc: Record<number, any>, i) => {
      if (!acc[i.month]) {
        acc[i.month] = { month: i.month, monthName: MONTHS[i.month - 1]?.short || '', volume: 0, value: 0 };
      }
      acc[i.month].volume += Number(i.volume_tonnes);
      acc[i.month].value += Number(i.total_value_usd || 0);
      return acc;
    }, {});

  const monthlyData = Object.values(byMonth || {}).sort((a: any, b: any) => a.month - b.month);

  // Aggregate by port
  const byPort = filteredData.reduce((acc: Record<string, any>, i) => {
    const port = i.port_of_entry || 'Não especificado';
    if (!acc[port]) {
      acc[port] = { name: port, volume: 0, count: 0 };
    }
    acc[port].volume += Number(i.volume_tonnes);
    acc[port].count++;
    return acc;
  }, {});

  const portData = Object.values(byPort).sort((a: any, b: any) => b.volume - a.volume);

  // Aggregate by rice type
  const byType = filteredData.reduce((acc: Record<string, any>, i) => {
    const type = i.rice_type || 'Não especificado';
    if (!acc[type]) {
      acc[type] = { name: type, volume: 0, count: 0 };
    }
    acc[type].volume += Number(i.volume_tonnes);
    acc[type].count++;
    return acc;
  }, {});

  const typeData = Object.values(byType).sort((a: any, b: any) => b.volume - a.volume);

  // Top importers
  const byImporter = filteredData.reduce((acc: Record<string, any>, i) => {
    const importer = i.importer_name || 'Não especificado';
    if (!acc[importer]) {
      acc[importer] = { name: importer, volume: 0, value: 0, count: 0 };
    }
    acc[importer].volume += Number(i.volume_tonnes);
    acc[importer].value += Number(i.total_value_usd || 0);
    acc[importer].count++;
    return acc;
  }, {});

  const importerData = Object.values(byImporter)
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 10);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return new Intl.NumberFormat('pt-AO').format(Math.round(num));
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${num.toFixed(0)}`;
  };

  const handleExport = () => {
    const headers = ['Ano', 'Mês', 'País de Origem', 'Volume (t)', 'Preço FOB (USD)', 'Preço CIF (USD)', 'Valor Total (USD)', 'Tipo de Arroz', 'Importador', 'Porto de Entrada'];
    const rows = filteredData.map(i => [
      i.year,
      MONTHS[i.month - 1]?.label || i.month,
      i.origin_country,
      i.volume_tonnes,
      i.price_fob_usd || '',
      i.price_cif_usd || '',
      i.total_value_usd || '',
      i.rice_type || '',
      i.importer_name || '',
      i.port_of_entry || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `importacoes_arroz_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Dados exportados com sucesso');
  };

  return (
    <MainLayout
      title="Importações de Arroz"
      subtitle="Dados detalhados de importações por país de origem, porto e período"
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
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                {filteredData.length} registos
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registar Importação
            </Button>
            <RiceImportForm 
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
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Países</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger>
                  <Anchor className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Porto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Portos</SelectItem>
                  {ports.map(port => (
                    <SelectItem key={port} value={port!}>{port}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedCountry('all');
                  setSelectedPort('all');
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Ship className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalVolume)}</p>
                <p className="text-sm text-muted-foreground">Volume Total (t)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-muted-foreground">Valor Total (USD)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">${avgCIF.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Preço CIF Médio ($/t)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Globe className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueCountries}</p>
                <p className="text-sm text-muted-foreground">Países de Origem</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${yearOverYearChange <= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {yearOverYearChange <= 0 ? (
                  <ArrowDownRight className="h-6 w-6 text-success" />
                ) : (
                  <ArrowUpRight className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${yearOverYearChange <= 0 ? 'text-success' : 'text-destructive'}`}>
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
            <TabsTrigger value="countries" className="gap-2">
              <Globe className="h-4 w-4" />
              Por País
            </TabsTrigger>
            <TabsTrigger value="importers" className="gap-2">
              <Building2 className="h-4 w-4" />
              Importadores
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Tabela Completa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-6 space-y-6">
            {/* Yearly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Evolução das Importações
                </CardTitle>
                <CardDescription>
                  Volume anual de importações e preço CIF médio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {yearlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={yearlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'Volume' ? `${formatNumber(value)} t` : `$${value}/t`,
                          name
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="volume" name="Volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="avgCIF" name="Preço CIF Médio" stroke="hsl(var(--warning))" strokeWidth={3} dot={{ fill: 'hsl(var(--warning))' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly & Distribution Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly for selected year */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Importações Mensais ({targetYear})</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="monthName" />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                        <Bar dataKey="volume" name="Volume (t)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                      Sem dados para {targetYear}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Rice Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Tipo de Arroz</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          dataKey="volume"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {typeData.map((_, index) => (
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
            </div>

            {/* By Port */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  Importações por Porto de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={portData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                      <Bar dataKey="volume" name="Volume (t)" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
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

          <TabsContent value="countries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Importações por País de Origem</CardTitle>
                <CardDescription>
                  Distribuição do volume e valor por país fornecedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {countryData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={countryData.slice(0, 7)}
                            dataKey="volume"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {countryData.slice(0, 7).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `${formatNumber(value)} t`} />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="space-y-3">
                        {countryData.slice(0, 8).map((c: any, i) => (
                          <div key={c.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-4 w-4 rounded-full" 
                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                              />
                              <div>
                                <p className="font-medium">{c.name}</p>
                                <p className="text-sm text-muted-foreground">{c.count} registos</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatNumber(c.volume)} t</p>
                              <p className="text-sm text-muted-foreground">{c.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
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

          <TabsContent value="importers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Principais Importadores</CardTitle>
                <CardDescription>
                  Ranking das empresas com maior volume de importação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importerData.length > 0 ? (
                  <div className="space-y-4">
                    {importerData.map((imp: any, i) => (
                      <div key={imp.name} className="flex items-center gap-4 rounded-lg border border-border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{imp.name}</p>
                          <p className="text-sm text-muted-foreground">{imp.count} importações</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatNumber(imp.volume)} t</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(imp.value)}</p>
                        </div>
                        <div className="w-24">
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(imp.volume / (importerData[0]?.volume || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Sem dados de importadores disponíveis
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
                    <CardTitle>Registos de Importação</CardTitle>
                    <CardDescription>
                      Lista completa de todos os registos de importação de arroz
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
                          <TableHead>Período</TableHead>
                          <TableHead>País de Origem</TableHead>
                          <TableHead className="text-right">Volume (t)</TableHead>
                          <TableHead className="text-right">FOB ($/t)</TableHead>
                          <TableHead className="text-right">CIF ($/t)</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Importador</TableHead>
                          <TableHead>Porto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((i) => (
                            <TableRow key={i.id}>
                              <TableCell className="font-medium">
                                {MONTHS[i.month - 1]?.short}/{i.year}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{i.origin_country}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatNumber(i.volume_tonnes)}</TableCell>
                              <TableCell className="text-right">{i.price_fob_usd ? `$${i.price_fob_usd}` : '—'}</TableCell>
                              <TableCell className="text-right">{i.price_cif_usd ? `$${i.price_cif_usd}` : '—'}</TableCell>
                              <TableCell className="text-right">{i.total_value_usd ? formatCurrency(i.total_value_usd) : '—'}</TableCell>
                              <TableCell>{i.rice_type || '—'}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{i.importer_name || '—'}</TableCell>
                              <TableCell>{i.port_of_entry || '—'}</TableCell>
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

export default RiceImportsPage;
