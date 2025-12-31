import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, TrendingUp, TrendingDown, Store, Download, Plus, 
  Search, MapPin, Calendar, BarChart3, ArrowUpDown
} from 'lucide-react';
import { useRicePrices } from '@/hooks/useRice';
import { RicePriceForm } from '@/components/rice/forms/RicePriceForm';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, AreaChart, Area, BarChart, Bar, ComposedChart
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });
};

export default function RicePricesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [riceTypeFilter, setRiceTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const { data: prices, isLoading } = useRicePrices(500);
  const { data: provinces } = useProvinces();

  // Filter data
  const filteredData = useMemo(() => {
    if (!prices) return [];
    
    const startDate = subDays(new Date(), parseInt(dateRange));
    
    return prices.filter(p => {
      const matchesSearch = !searchTerm || 
        p.market_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.provinces?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvince = provinceFilter === 'all' || p.province_id === provinceFilter;
      const matchesType = riceTypeFilter === 'all' || p.rice_type === riceTypeFilter;
      const matchesDate = isWithinInterval(parseISO(p.recorded_date), { start: startDate, end: new Date() });
      
      return matchesSearch && matchesProvince && matchesType && matchesDate;
    });
  }, [prices, searchTerm, provinceFilter, riceTypeFilter, dateRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) return {
      avgRetail: 0,
      avgWholesale: 0,
      minRetail: 0,
      maxRetail: 0,
      priceVariation: 0,
      recordsCount: 0,
      marketsCount: 0
    };

    const retailPrices = filteredData.map(p => Number(p.retail_price_aoa));
    const wholesalePrices = filteredData.filter(p => p.wholesale_price_aoa).map(p => Number(p.wholesale_price_aoa));
    const markets = new Set(filteredData.map(p => p.market_name));

    const avgRetail = retailPrices.reduce((a, b) => a + b, 0) / retailPrices.length;
    const avgWholesale = wholesalePrices.length 
      ? wholesalePrices.reduce((a, b) => a + b, 0) / wholesalePrices.length 
      : 0;
    const minRetail = Math.min(...retailPrices);
    const maxRetail = Math.max(...retailPrices);
    const priceVariation = ((maxRetail - minRetail) / minRetail) * 100;

    return {
      avgRetail,
      avgWholesale,
      minRetail,
      maxRetail,
      priceVariation,
      recordsCount: filteredData.length,
      marketsCount: markets.size
    };
  }, [filteredData]);

  // Chart data - Price evolution by date
  const evolutionData = useMemo(() => {
    if (!filteredData.length) return [];

    const byDate: Record<string, { date: string; retail: number; wholesale: number; count: number; wholesaleCount: number }> = {};

    filteredData.forEach(p => {
      const date = p.recorded_date;
      if (!byDate[date]) {
        byDate[date] = { date, retail: 0, wholesale: 0, count: 0, wholesaleCount: 0 };
      }
      byDate[date].retail += Number(p.retail_price_aoa);
      byDate[date].count += 1;
      if (p.wholesale_price_aoa) {
        byDate[date].wholesale += Number(p.wholesale_price_aoa);
        byDate[date].wholesaleCount += 1;
      }
    });

    return Object.values(byDate)
      .map(d => ({
        date: d.date,
        retail: Math.round(d.retail / d.count),
        wholesale: d.wholesaleCount > 0 ? Math.round(d.wholesale / d.wholesaleCount) : null,
        margin: d.wholesaleCount > 0 ? Math.round((d.retail / d.count) - (d.wholesale / d.wholesaleCount)) : null
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Chart data - Price by province
  const provinceData = useMemo(() => {
    if (!filteredData.length) return [];

    const byProvince: Record<string, { name: string; retail: number; wholesale: number; count: number; wholesaleCount: number }> = {};

    filteredData.forEach(p => {
      const name = p.provinces?.name || 'Nacional';
      if (!byProvince[name]) {
        byProvince[name] = { name, retail: 0, wholesale: 0, count: 0, wholesaleCount: 0 };
      }
      byProvince[name].retail += Number(p.retail_price_aoa);
      byProvince[name].count += 1;
      if (p.wholesale_price_aoa) {
        byProvince[name].wholesale += Number(p.wholesale_price_aoa);
        byProvince[name].wholesaleCount += 1;
      }
    });

    return Object.values(byProvince)
      .map(p => ({
        name: p.name,
        retail: Math.round(p.retail / p.count),
        wholesale: p.wholesaleCount > 0 ? Math.round(p.wholesale / p.wholesaleCount) : 0
      }))
      .sort((a, b) => b.retail - a.retail);
  }, [filteredData]);

  // Chart data - Price by rice type
  const riceTypeData = useMemo(() => {
    if (!filteredData.length) return [];

    const byType: Record<string, { type: string; retail: number; wholesale: number; count: number; wholesaleCount: number }> = {};

    filteredData.forEach(p => {
      const type = p.rice_type || 'Não especificado';
      if (!byType[type]) {
        byType[type] = { type, retail: 0, wholesale: 0, count: 0, wholesaleCount: 0 };
      }
      byType[type].retail += Number(p.retail_price_aoa);
      byType[type].count += 1;
      if (p.wholesale_price_aoa) {
        byType[type].wholesale += Number(p.wholesale_price_aoa);
        byType[type].wholesaleCount += 1;
      }
    });

    return Object.values(byType)
      .map(t => ({
        type: t.type,
        retail: Math.round(t.retail / t.count),
        wholesale: t.wholesaleCount > 0 ? Math.round(t.wholesale / t.wholesaleCount) : 0
      }))
      .sort((a, b) => b.retail - a.retail);
  }, [filteredData]);

  // Get unique rice types
  const riceTypes = useMemo(() => {
    if (!prices) return [];
    return [...new Set(prices.map(p => p.rice_type).filter(Boolean))];
  }, [prices]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0
    }).format(value);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Província', 'Mercado', 'Tipo Arroz', 'Preço Retalho (AOA/kg)', 'Preço Atacado (AOA/kg)', 'Câmbio USD'];
    const rows = filteredData.map(p => [
      format(parseISO(p.recorded_date), 'dd/MM/yyyy'),
      p.provinces?.name || '-',
      p.market_name || '-',
      p.rice_type || '-',
      p.retail_price_aoa,
      p.wholesale_price_aoa || '-',
      p.exchange_rate_usd || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `precos_arroz_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <MainLayout title="Preços do Arroz">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Preços do Arroz">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8 text-amber-600" />
              Preços do Arroz
            </h1>
            <p className="text-muted-foreground">
              Monitorização de preços no mercado interno
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Preço
                </Button>
              </DialogTrigger>
              <RicePriceForm open={formOpen} onOpenChange={setFormOpen} />
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar mercado..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Província" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Províncias</SelectItem>
                  {provinces?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riceTypeFilter} onValueChange={setRiceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Arroz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {riceTypes.map(type => (
                    <SelectItem key={type} value={type!}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setProvinceFilter('all');
                  setRiceTypeFilter('all');
                  setDateRange('30');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preço Médio Retalho</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {formatCurrency(kpis.avgRetail)}/kg
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Store className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Min: {formatCurrency(kpis.minRetail)} | Max: {formatCurrency(kpis.maxRetail)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preço Médio Atacado</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(kpis.avgWholesale)}/kg
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Margem média: {formatCurrency(kpis.avgRetail - kpis.avgWholesale)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Variação de Preço</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {kpis.priceVariation.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Amplitude entre min e max
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registos / Mercados</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {kpis.recordsCount} / {kpis.marketsCount}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                No período selecionado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Evolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Evolução de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tickFormatter={(v) => format(parseISO(v), 'dd/MM', { locale: pt })}
                    />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v}`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'retail' ? 'Retalho' : name === 'wholesale' ? 'Atacado' : 'Margem'
                      ]}
                      labelFormatter={(label) => format(parseISO(label), 'dd/MM/yyyy', { locale: pt })}
                    />
                    <Legend formatter={(value) => value === 'retail' ? 'Retalho' : value === 'wholesale' ? 'Atacado' : 'Margem'} />
                    <Area 
                      type="monotone" 
                      dataKey="retail" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wholesale" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Bar 
                      dataKey="margin" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      barSize={8}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price by Province */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Preços por Província
              </CardTitle>
            </CardHeader>
            <CardContent>
              {provinceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={provinceData.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      className="text-xs" 
                      width={100}
                      tickFormatter={(v) => v.length > 12 ? `${v.slice(0, 12)}...` : v}
                    />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="retail" name="Retalho" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="wholesale" name="Atacado" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price by Rice Type */}
          <Card>
            <CardHeader>
              <CardTitle>Preços por Tipo de Arroz</CardTitle>
            </CardHeader>
            <CardContent>
              {riceTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riceTypeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="type" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="retail" name="Retalho" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wholesale" name="Atacado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Distribution Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Preços por Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[250px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mercado</TableHead>
                      <TableHead>Província</TableHead>
                      <TableHead className="text-right">Retalho</TableHead>
                      <TableHead className="text-right">Atacado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const byMarket: Record<string, any> = {};
                      filteredData.forEach(p => {
                        const key = p.market_name || 'Sem nome';
                        if (!byMarket[key]) {
                          byMarket[key] = { 
                            market: key, 
                            province: p.provinces?.name || '-',
                            retail: 0, 
                            wholesale: 0, 
                            count: 0, 
                            wholesaleCount: 0 
                          };
                        }
                        byMarket[key].retail += Number(p.retail_price_aoa);
                        byMarket[key].count += 1;
                        if (p.wholesale_price_aoa) {
                          byMarket[key].wholesale += Number(p.wholesale_price_aoa);
                          byMarket[key].wholesaleCount += 1;
                        }
                      });
                      return Object.values(byMarket)
                        .map((m: any) => ({
                          market: m.market,
                          province: m.province,
                          retail: Math.round(m.retail / m.count),
                          wholesale: m.wholesaleCount > 0 ? Math.round(m.wholesale / m.wholesaleCount) : null
                        }))
                        .sort((a: any, b: any) => b.retail - a.retail)
                        .slice(0, 10);
                    })().map((m: any) => (
                      <TableRow key={m.market}>
                        <TableCell className="font-medium">{m.market}</TableCell>
                        <TableCell>{m.province}</TableCell>
                        <TableCell className="text-right">{formatCurrency(m.retail)}</TableCell>
                        <TableCell className="text-right">
                          {m.wholesale ? formatCurrency(m.wholesale) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registos de Preços ({filteredData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Província</TableHead>
                      <TableHead>Mercado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Retalho (AOA/kg)</TableHead>
                      <TableHead className="text-right">Atacado (AOA/kg)</TableHead>
                      <TableHead className="text-right">Câmbio USD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 100).map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>
                          {format(parseISO(price.recorded_date), 'dd/MM/yyyy', { locale: pt })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{price.provinces?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>{price.market_name || '-'}</TableCell>
                        <TableCell>{price.rice_type || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-amber-600">
                          {formatCurrency(Number(price.retail_price_aoa))}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {price.wholesale_price_aoa ? formatCurrency(Number(price.wholesale_price_aoa)) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {price.exchange_rate_usd || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum registo encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {filteredData.length > 100 && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Mostrando 100 de {filteredData.length} registos. Exporte para ver todos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
