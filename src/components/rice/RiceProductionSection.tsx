import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Wheat, TrendingUp, MapPin } from 'lucide-react';
import { useRiceProduction } from '@/hooks/useRice';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const RiceProductionSection = () => {
  const { data: production, isLoading } = useRiceProduction();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5" />
            Produção Nacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Aggregate by year
  const byYear = production?.reduce((acc: Record<number, any>, p) => {
    if (!acc[p.year]) {
      acc[p.year] = { 
        year: p.year, 
        production: 0, 
        area: 0, 
        harvested: 0,
        provinces: 0 
      };
    }
    acc[p.year].production += Number(p.production_tonnes);
    acc[p.year].area += Number(p.cultivated_area_ha);
    acc[p.year].harvested += Number(p.harvested_area_ha);
    acc[p.year].provinces += 1;
    return acc;
  }, {});

  const yearlyData = Object.values(byYear || {})
    .sort((a: any, b: any) => a.year - b.year)
    .slice(-6);

  // Aggregate by province for current year
  const currentYear = new Date().getFullYear();
  const byProvince = production
    ?.filter(p => p.year === currentYear || p.year === currentYear - 1)
    ?.reduce((acc: Record<string, any>, p) => {
      const name = p.provinces?.name || 'Não especificado';
      if (!acc[name]) {
        acc[name] = { name, production: 0, area: 0 };
      }
      acc[name].production += Number(p.production_tonnes);
      acc[name].area += Number(p.cultivated_area_ha);
      return acc;
    }, {});

  const provinceData = Object.values(byProvince || {})
    .sort((a: any, b: any) => b.production - a.production)
    .slice(0, 8);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-AO').format(Math.round(num));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-600" />
            Produção Nacional de Arroz
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {production?.length || 0} registos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evolution">
          <TabsList className="mb-4">
            <TabsTrigger value="evolution" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="provinces" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Por Província
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
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Bar dataKey="production" name="Produção (t)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de produção disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="provinces">
            {provinceData.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={provinceData}
                      dataKey="production"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.slice(0, 8)}... ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {provinceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatNumber(value) + ' t'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {provinceData.map((p: any, i) => (
                    <div key={p.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                        />
                        <span className="text-sm">{p.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(p.production)} t</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados por província disponíveis
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Província</TableHead>
                    <TableHead className="text-right">Área (ha)</TableHead>
                    <TableHead className="text-right">Produção (t)</TableHead>
                    <TableHead className="text-right">Produtividade (kg/ha)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {production?.slice(0, 20).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.year}</TableCell>
                      <TableCell>{p.provinces?.name || '-'}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.cultivated_area_ha)}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.production_tonnes)}</TableCell>
                      <TableCell className="text-right">{formatNumber(p.productivity_kg_ha)}</TableCell>
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
