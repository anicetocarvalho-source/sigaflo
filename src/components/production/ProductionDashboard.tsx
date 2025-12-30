import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductionStats } from '@/hooks/useProductionHistory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Wheat, MapPin, Scale, TrendingUp, Loader2 } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const CROP_LABELS: Record<string, string> = {
  arroz: 'Arroz',
  milho: 'Milho',
  feijao: 'Feijão',
  mandioca: 'Mandioca',
  batata_doce: 'Batata Doce',
  amendoim: 'Amendoim',
  soja: 'Soja',
  cafe: 'Café',
  horticolas: 'Hortícolas',
  outros: 'Outros',
};

const SEASON_LABELS: Record<string, string> = {
  principal: 'Campanha Principal',
  intermediaria: 'Campanha Intermédia',
  seca: 'Campanha de Seca',
};

export const ProductionDashboard = () => {
  const { data: stats, isLoading } = useProductionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado de produção disponível
      </div>
    );
  }

  // Prepare chart data
  const yearData = Object.entries(stats.byYear)
    .map(([year, data]) => ({
      year: parseInt(year),
      area: data.area,
      producao: data.production / 1000, // Convert to tons
      registos: data.count,
    }))
    .sort((a, b) => a.year - b.year);

  const cropData = Object.entries(stats.byCrop)
    .map(([crop, data]) => ({
      name: CROP_LABELS[crop] || crop,
      value: data.production,
      area: data.area,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  const seasonData = Object.entries(stats.bySeason)
    .map(([season, data]) => ({
      name: SEASON_LABELS[season] || season,
      area: data.area,
      producao: data.production / 1000,
      registos: data.count,
    }));

  const qualityData = Object.entries(stats.byQuality).map(([grade, count]) => ({
    name: grade,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registos</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString('pt-AO')}</div>
            <p className="text-xs text-muted-foreground">Registos de produção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAreaHa.toLocaleString('pt-AO', { maximumFractionDigits: 1 })} ha</div>
            <p className="text-xs text-muted-foreground">Hectares plantados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produção Total</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalProductionKg / 1000).toLocaleString('pt-AO', { maximumFractionDigits: 1 })} t</div>
            <p className="text-xs text-muted-foreground">Toneladas colhidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgYieldPerHa.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} kg/ha</div>
            <p className="text-xs text-muted-foreground">Produtividade média</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Anual da Produção</CardTitle>
          </CardHeader>
          <CardContent>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'producao' ? `${value.toFixed(1)} t` : `${value.toFixed(1)} ha`,
                      name === 'producao' ? 'Produção' : 'Área'
                    ]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="producao" stroke="#22c55e" name="Produção (t)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="area" stroke="#3b82f6" name="Área (ha)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produção por Cultura</CardTitle>
          </CardHeader>
          <CardContent>
            {cropData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cropData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cropData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${(value / 1000).toFixed(1)} t`, 'Produção']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produção por Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            {seasonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'producao' ? `${value.toFixed(1)} t` : `${value.toFixed(1)} ha`,
                      name === 'producao' ? 'Produção' : 'Área'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="producao" fill="#22c55e" name="Produção (t)" />
                  <Bar dataKey="area" fill="#3b82f6" name="Área (ha)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            {qualityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Registos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados de qualidade
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Crops Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Cultura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Cultura</th>
                  <th className="text-right py-3 px-2 font-medium">Registos</th>
                  <th className="text-right py-3 px-2 font-medium">Área (ha)</th>
                  <th className="text-right py-3 px-2 font-medium">Produção (t)</th>
                  <th className="text-right py-3 px-2 font-medium">Rend. Médio (kg/ha)</th>
                </tr>
              </thead>
              <tbody>
                {cropData.map((crop, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{crop.name}</td>
                    <td className="text-right py-3 px-2">{crop.count}</td>
                    <td className="text-right py-3 px-2">{crop.area.toLocaleString('pt-AO', { maximumFractionDigits: 1 })}</td>
                    <td className="text-right py-3 px-2">{(crop.value / 1000).toLocaleString('pt-AO', { maximumFractionDigits: 1 })}</td>
                    <td className="text-right py-3 px-2">
                      {crop.area > 0 ? (crop.value / crop.area).toLocaleString('pt-AO', { maximumFractionDigits: 0 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
