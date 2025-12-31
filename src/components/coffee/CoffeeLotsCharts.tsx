import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Coffee, TrendingUp, MapPin, Package } from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';

interface Props {
  lots: CoffeeLot[];
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export function CoffeeLotsCharts({ lots }: Props) {
  // Volume by province
  const volumeByProvince = lots.reduce((acc, lot) => {
    const province = lot.origin_province?.name || 'Desconhecido';
    acc[province] = (acc[province] || 0) + lot.volume_kg;
    return acc;
  }, {} as Record<string, number>);

  const provinceData = Object.entries(volumeByProvince)
    .map(([name, volume]) => ({ name, volume: volume / 1000 }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  // Status distribution
  const statusDistribution = lots.reduce((acc, lot) => {
    acc[lot.status] = (acc[lot.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusLabels: Record<string, string> = {
    registered: 'Registado',
    in_processing: 'Em Processamento',
    in_transit: 'Em Trânsito',
    exported: 'Exportado',
    rejected: 'Rejeitado',
  };

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
  }));

  // Volume by variety
  const volumeByVariety = lots.reduce((acc, lot) => {
    const variety = lot.variety || 'Não especificado';
    acc[variety] = (acc[variety] || 0) + lot.volume_kg;
    return acc;
  }, {} as Record<string, number>);

  const varietyData = Object.entries(volumeByVariety)
    .map(([name, volume]) => ({ name, volume: volume / 1000 }))
    .sort((a, b) => b.volume - a.volume);

  // Monthly evolution (mock data based on created_at)
  const monthlyData = lots.reduce((acc, lot) => {
    const month = new Date(lot.created_at).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, volume: 0, count: 0 };
    }
    acc[month].volume += lot.volume_kg / 1000;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { month: string; volume: number; count: number }>);

  const evolutionData = Object.values(monthlyData).slice(-6);

  // Destination countries
  const volumeByDestination = lots.reduce((acc, lot) => {
    const country = lot.destination_country || 'Não definido';
    acc[country] = (acc[country] || 0) + lot.volume_kg;
    return acc;
  }, {} as Record<string, number>);

  const destinationData = Object.entries(volumeByDestination)
    .map(([name, volume]) => ({ name, volume: volume / 1000 }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Volume by Province */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            Volume por Província
          </CardTitle>
          <CardDescription>Distribuição de produção por região (toneladas)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}t`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}t`, 'Volume']}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="volume" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            Distribuição por Estado
          </CardTitle>
          <CardDescription>Estado actual dos lotes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Evolution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Evolução Mensal
          </CardTitle>
          <CardDescription>Volume e número de lotes por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}t`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'volume' ? `${value.toFixed(1)}t` : value,
                    name === 'volume' ? 'Volume' : 'Lotes'
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="Volume (t)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Nº Lotes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Volume by Variety */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coffee className="h-4 w-4 text-amber-600" />
            Volume por Variedade
          </CardTitle>
          <CardDescription>Distribuição por tipo de café</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varietyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}t`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}t`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Destinations */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            🌍 Principais Destinos de Exportação
          </CardTitle>
          <CardDescription>Volume exportado por país de destino (toneladas)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}t`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}t`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
