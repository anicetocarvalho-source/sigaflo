import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Store } from 'lucide-react';
import { useRicePrices } from '@/hooks/useRice';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export const RicePricesSection = () => {
  const { data: prices, isLoading } = useRicePrices(100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços Internos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group by date for chart
  const byDate = prices?.reduce((acc: Record<string, any>, p) => {
    const date = p.recorded_date;
    if (!acc[date]) {
      acc[date] = { date, retail: 0, wholesale: 0, count: 0, wholesaleCount: 0 };
    }
    acc[date].retail += Number(p.retail_price_aoa);
    acc[date].count += 1;
    if (p.wholesale_price_aoa) {
      acc[date].wholesale += Number(p.wholesale_price_aoa);
      acc[date].wholesaleCount += 1;
    }
    return acc;
  }, {});

  const chartData = Object.values(byDate || {})
    .map((d: any) => ({
      date: d.date,
      retail: d.retail / d.count,
      wholesale: d.wholesaleCount > 0 ? d.wholesale / d.wholesaleCount : null,
    }))
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(-30);

  // Calculate statistics
  const latestPrices = prices?.slice(0, 10) || [];
  const avgRetail = latestPrices.length 
    ? latestPrices.reduce((sum, p) => sum + Number(p.retail_price_aoa), 0) / latestPrices.length 
    : 0;
  const avgWholesale = latestPrices.filter(p => p.wholesale_price_aoa).length
    ? latestPrices.filter(p => p.wholesale_price_aoa).reduce((sum, p) => sum + Number(p.wholesale_price_aoa!), 0) / latestPrices.filter(p => p.wholesale_price_aoa).length
    : 0;

  // Price by province
  const byProvince = prices?.reduce((acc: Record<string, any>, p) => {
    const name = p.provinces?.name || 'Nacional';
    if (!acc[name]) {
      acc[name] = { name, retail: 0, wholesale: 0, count: 0, wholesaleCount: 0 };
    }
    acc[name].retail += Number(p.retail_price_aoa);
    acc[name].count += 1;
    if (p.wholesale_price_aoa) {
      acc[name].wholesale += Number(p.wholesale_price_aoa);
      acc[name].wholesaleCount += 1;
    }
    return acc;
  }, {});

  const provinceData = Object.values(byProvince || {})
    .map((p: any) => ({
      name: p.name,
      retail: Math.round(p.retail / p.count),
      wholesale: p.wholesaleCount > 0 ? Math.round(p.wholesale / p.wholesaleCount) : null,
    }))
    .sort((a: any, b: any) => b.retail - a.retail);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-600" />
            Preços no Mercado Interno
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-amber-500">
              Retalho: {formatCurrency(avgRetail)}/kg
            </Badge>
            {avgWholesale > 0 && (
              <Badge variant="outline">
                Atacado: {formatCurrency(avgWholesale)}/kg
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Price Evolution Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Evolução de Preços (últimos 30 dias)</h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs" 
                    tickFormatter={(v) => format(new Date(v), 'dd/MM', { locale: pt })}
                  />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: pt })}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="retail" 
                    name="Retalho" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wholesale" 
                    name="Atacado" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Sem dados de preços disponíveis
              </div>
            )}
          </div>

          {/* Price by Province */}
          <div>
            <h4 className="text-sm font-medium mb-3">Preço Médio por Província</h4>
            <div className="max-h-[200px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Província</TableHead>
                    <TableHead className="text-right">Retalho</TableHead>
                    <TableHead className="text-right">Atacado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinceData.slice(0, 10).map((p: any) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.retail)}</TableCell>
                      <TableCell className="text-right">
                        {p.wholesale ? formatCurrency(p.wholesale) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
