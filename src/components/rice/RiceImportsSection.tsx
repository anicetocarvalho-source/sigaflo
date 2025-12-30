import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Ship, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { useRiceImports } from '@/hooks/useRice';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const RiceImportsSection = () => {
  const { data: imports, isLoading } = useRiceImports();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Importações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Aggregate by year
  const byYear = imports?.reduce((acc: Record<number, any>, i) => {
    if (!acc[i.year]) {
      acc[i.year] = { year: i.year, volume: 0, value: 0, avgCIF: 0, count: 0 };
    }
    acc[i.year].volume += Number(i.volume_tonnes);
    acc[i.year].value += Number(i.total_value_usd || 0);
    if (i.price_cif_usd) {
      acc[i.year].avgCIF += Number(i.price_cif_usd);
      acc[i.year].count += 1;
    }
    return acc;
  }, {});

  const yearlyData = Object.values(byYear || {})
    .map((y: any) => ({
      ...y,
      avgCIF: y.count > 0 ? y.avgCIF / y.count : 0,
    }))
    .sort((a: any, b: any) => a.year - b.year)
    .slice(-6);

  // Aggregate by country
  const byCountry = imports?.reduce((acc: Record<string, any>, i) => {
    const country = i.origin_country || 'Não especificado';
    if (!acc[country]) {
      acc[country] = { name: country, volume: 0, value: 0 };
    }
    acc[country].volume += Number(i.volume_tonnes);
    acc[country].value += Number(i.total_value_usd || 0);
    return acc;
  }, {});

  const countryData = Object.values(byCountry || {})
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 7);

  // Monthly trend for current year
  const currentYear = new Date().getFullYear();
  const monthlyData = imports
    ?.filter(i => i.year === currentYear || i.year === currentYear - 1)
    ?.reduce((acc: Record<string, any>, i) => {
      const key = `${i.year}-${String(i.month).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = { month: key, volume: 0, avgCIF: 0, count: 0 };
      }
      acc[key].volume += Number(i.volume_tonnes);
      if (i.price_cif_usd) {
        acc[key].avgCIF += Number(i.price_cif_usd);
        acc[key].count += 1;
      }
      return acc;
    }, {});

  const monthlyTrend = Object.values(monthlyData || {})
    .map((m: any) => ({
      ...m,
      avgCIF: m.count > 0 ? m.avgCIF / m.count : 0,
    }))
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-12);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-AO').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalVolume = imports?.reduce((sum, i) => sum + Number(i.volume_tonnes), 0) || 0;
  const totalValue = imports?.reduce((sum, i) => sum + Number(i.total_value_usd || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-blue-600" />
            Importações de Arroz
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {formatNumber(totalVolume)} toneladas
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formatCurrency(totalValue)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolution">
          <TabsList className="mb-4">
            <TabsTrigger value="evolution" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Por País
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Preços
            </TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution">
            {yearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'volume' ? formatNumber(value) + ' t' : formatCurrency(value),
                      name === 'volume' ? 'Volume' : 'Valor'
                    ]}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="volume" name="Volume (t)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de importação disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="countries">
            {countryData.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={countryData}
                      dataKey="volume"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {countryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatNumber(value) + ' t'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {countryData.map((c: any, i) => (
                    <div key={c.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                        />
                        <span className="text-sm">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatNumber(c.volume)} t</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(c.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados por país disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}/t`, 'Preço CIF Médio']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgCIF" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de preços disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano/Mês</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">Volume (t)</TableHead>
                    <TableHead className="text-right">CIF ($/t)</TableHead>
                    <TableHead className="text-right">Total (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports?.slice(0, 20).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.year}/{String(i.month).padStart(2, '0')}</TableCell>
                      <TableCell>{i.origin_country}</TableCell>
                      <TableCell className="text-right">{formatNumber(i.volume_tonnes)}</TableCell>
                      <TableCell className="text-right">{i.price_cif_usd ? `$${i.price_cif_usd}` : '-'}</TableCell>
                      <TableCell className="text-right">{i.total_value_usd ? formatCurrency(i.total_value_usd) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
