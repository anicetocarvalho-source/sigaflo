import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, TrendingUp, Download, Plus, 
  Search, MapPin, Calendar, BarChart3, Utensils, Scale
} from 'lucide-react';
import { useRiceConsumption } from '@/hooks/useRice';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Area, BarChart, Bar, ComposedChart, Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

const consumptionSchema = z.object({
  province_id: z.string().optional(),
  year: z.coerce.number().min(2000).max(2100),
  population: z.coerce.number().min(1),
  total_consumption_tonnes: z.coerce.number().min(0).optional(),
  per_capita_kg: z.coerce.number().min(0),
  data_source: z.string().optional(),
  notes: z.string().optional()
});

type ConsumptionFormData = z.infer<typeof consumptionSchema>;

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

export default function RiceConsumptionPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const queryClient = useQueryClient();
  const { data: consumption, isLoading } = useRiceConsumption();
  const { data: provinces } = useProvinces();

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      population: 0,
      per_capita_kg: 0
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ConsumptionFormData) => {
      const { error } = await supabase
        .from('rice_consumption')
        .insert([{
          year: data.year,
          population: data.population,
          per_capita_kg: data.per_capita_kg,
          total_consumption_tonnes: data.total_consumption_tonnes,
          province_id: data.province_id || null,
          data_source: data.data_source || null,
          notes: data.notes || null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rice-consumption'] });
      toast.success('Registo de consumo adicionado com sucesso');
      setFormOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar registo: ${error.message}`);
    }
  });

  // Filter data
  const filteredData = useMemo(() => {
    if (!consumption) return [];
    
    return consumption.filter(c => {
      const matchesSearch = !searchTerm || 
        c.provinces?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.data_source?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvince = provinceFilter === 'all' || c.province_id === provinceFilter;
      const matchesYear = yearFilter === 'all' || c.year.toString() === yearFilter;
      
      return matchesSearch && matchesProvince && matchesYear;
    });
  }, [consumption, searchTerm, provinceFilter, yearFilter]);

  // Get unique years
  const years = useMemo(() => {
    if (!consumption) return [];
    return [...new Set(consumption.map(c => c.year))].sort((a, b) => b - a);
  }, [consumption]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) return {
      totalConsumption: 0,
      totalPopulation: 0,
      avgPerCapita: 0,
      recordsCount: 0
    };

    const totalConsumption = filteredData.reduce((sum, c) => sum + Number(c.total_consumption_tonnes || 0), 0);
    const totalPopulation = filteredData.reduce((sum, c) => sum + Number(c.population), 0);
    const avgPerCapita = filteredData.reduce((sum, c) => sum + Number(c.per_capita_kg), 0) / filteredData.length;

    return {
      totalConsumption,
      totalPopulation,
      avgPerCapita,
      recordsCount: filteredData.length
    };
  }, [filteredData]);

  // Chart data - Consumption by year
  const yearlyData = useMemo(() => {
    if (!consumption) return [];

    const byYear: Record<number, { year: number; consumption: number; population: number; perCapita: number; count: number }> = {};

    consumption.forEach(c => {
      if (!byYear[c.year]) {
        byYear[c.year] = { year: c.year, consumption: 0, population: 0, perCapita: 0, count: 0 };
      }
      byYear[c.year].consumption += Number(c.total_consumption_tonnes || 0);
      byYear[c.year].population += Number(c.population);
      byYear[c.year].perCapita += Number(c.per_capita_kg);
      byYear[c.year].count += 1;
    });

    return Object.values(byYear)
      .map(d => ({
        year: d.year,
        consumption: Math.round(d.consumption),
        population: Math.round(d.population / 1000000 * 10) / 10,
        perCapita: Math.round(d.perCapita / d.count * 10) / 10
      }))
      .sort((a, b) => a.year - b.year);
  }, [consumption]);

  // Chart data - Consumption by province
  const provinceData = useMemo(() => {
    if (!filteredData.length) return [];

    const byProvince: Record<string, { name: string; consumption: number; population: number; perCapita: number; count: number }> = {};

    filteredData.forEach(c => {
      const name = c.provinces?.name || 'Nacional';
      if (!byProvince[name]) {
        byProvince[name] = { name, consumption: 0, population: 0, perCapita: 0, count: 0 };
      }
      byProvince[name].consumption += Number(c.total_consumption_tonnes || 0);
      byProvince[name].population += Number(c.population);
      byProvince[name].perCapita += Number(c.per_capita_kg);
      byProvince[name].count += 1;
    });

    return Object.values(byProvince)
      .map(p => ({
        name: p.name,
        consumption: Math.round(p.consumption),
        population: Math.round(p.population / 1000),
        perCapita: Math.round(p.perCapita / p.count * 10) / 10
      }))
      .sort((a, b) => b.consumption - a.consumption);
  }, [filteredData]);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  const exportToCSV = () => {
    const headers = ['Ano', 'Província', 'População', 'Consumo Total (ton)', 'Per Capita (kg)', 'Fonte'];
    const rows = filteredData.map(c => [
      c.year,
      c.provinces?.name || 'Nacional',
      c.population,
      c.total_consumption_tonnes || '-',
      c.per_capita_kg,
      c.data_source || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consumo_arroz_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <MainLayout title="Consumo de Arroz">
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
    <MainLayout title="Consumo de Arroz">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Utensils className="h-8 w-8 text-green-600" />
              Consumo de Arroz
            </h1>
            <p className="text-muted-foreground">
              Análise do consumo nacional e per capita
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
                  Registar Consumo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Registo de Consumo</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="province_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Província (opcional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Nacional (todas)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provinces?.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="population"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>População</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="total_consumption_tonnes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consumo Total (ton)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="per_capita_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumo Per Capita (kg/ano)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data_source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte dos Dados</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: INE, FAO..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'A guardar...' : 'Guardar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar..." 
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
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setProvinceFilter('all');
                  setYearFilter('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumo Total</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatNumber(kpis.totalConsumption)} ton
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {kpis.recordsCount} registos no período
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">População Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatNumber(Math.round(kpis.totalPopulation / 1000000 * 10) / 10)}M
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Habitantes estimados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumo Per Capita</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {kpis.avgPerCapita.toFixed(1)} kg/ano
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Scale className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Média por pessoa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registos</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {kpis.recordsCount}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
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
          {/* Yearly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Evolução do Consumo por Ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {yearlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'consumption' ? `${formatNumber(value)} ton` : 
                        name === 'population' ? `${value}M hab` : `${value} kg`,
                        name === 'consumption' ? 'Consumo' : 
                        name === 'population' ? 'População' : 'Per Capita'
                      ]}
                    />
                    <Legend formatter={(value) => value === 'consumption' ? 'Consumo (ton)' : value === 'population' ? 'População (M)' : 'Per Capita (kg)'} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="consumption" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="perCapita" 
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consumption by Province */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Consumo por Província
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
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'consumption' ? `${formatNumber(value)} ton` : `${value} kg`,
                        name === 'consumption' ? 'Consumo Total' : 'Per Capita'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="consumption" name="Consumo (ton)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Per Capita by Province */}
        <Card>
          <CardHeader>
            <CardTitle>Consumo Per Capita por Província</CardTitle>
          </CardHeader>
          <CardContent>
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={provinceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs" 
                    tickFormatter={(v) => v.length > 8 ? `${v.slice(0, 8)}...` : v}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => [`${value} kg/ano`, 'Per Capita']} />
                  <Bar dataKey="perCapita" name="Per Capita" radius={[4, 4, 0, 0]}>
                    {provinceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registos de Consumo ({filteredData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Província</TableHead>
                      <TableHead className="text-right">População</TableHead>
                      <TableHead className="text-right">Consumo (ton)</TableHead>
                      <TableHead className="text-right">Per Capita (kg)</TableHead>
                      <TableHead>Fonte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge variant="outline">{c.year}</Badge>
                        </TableCell>
                        <TableCell>{c.provinces?.name || 'Nacional'}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(c.population)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {c.total_consumption_tonnes ? formatNumber(c.total_consumption_tonnes) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-amber-600">
                          {c.per_capita_kg} kg
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.data_source || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
      </div>
    </MainLayout>
  );
}
