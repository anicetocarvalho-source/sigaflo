import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useProvinceStats, type ProvinceStats } from '@/hooks/useONAF';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  ArrowUpDown,
  BarChart3,
  Map,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

type MetricKey = 'farmers' | 'cultivatedArea' | 'productionKg' | 'occurrences' | 'riskScore' | 'forestLicenses' | 'reforestedArea';

const metricLabels: Record<MetricKey, string> = {
  farmers: 'Agricultores',
  cultivatedArea: 'Área Cultivada (ha)',
  productionKg: 'Produção (kg)',
  occurrences: 'Ocorrências',
  riskScore: 'Score de Risco',
  forestLicenses: 'Licenças Florestais',
  reforestedArea: 'Área Reflorestada (ha)',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export function ProvinceComparison() {
  const { data: provinces = [], isLoading } = useProvinceStats();
  const [sortMetric, setSortMetric] = useState<MetricKey>('farmers');
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'radar'>('table');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  const sortedProvinces = [...provinces].sort((a, b) => {
    const aVal = a[sortMetric];
    const bVal = b[sortMetric];
    return bVal - aVal;
  });

  const chartData = sortedProvinces.slice(0, 10).map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
    value: p[sortMetric],
    fullName: p.name,
  }));

  const radarData = provinces
    .filter(p => selectedProvinces.length === 0 || selectedProvinces.includes(p.id))
    .slice(0, 5)
    .map(p => {
      // Normalize values to 0-100 scale
      const maxFarmers = Math.max(...provinces.map(pr => pr.farmers));
      const maxArea = Math.max(...provinces.map(pr => pr.cultivatedArea));
      const maxProduction = Math.max(...provinces.map(pr => pr.productionKg));
      const maxForest = Math.max(...provinces.map(pr => pr.forestLicenses));
      const maxReforest = Math.max(...provinces.map(pr => pr.reforestedArea));
      
      return {
        province: p.name,
        'Agricultores': (p.farmers / maxFarmers) * 100 || 0,
        'Área Cultivada': (p.cultivatedArea / maxArea) * 100 || 0,
        'Produção': (p.productionKg / maxProduction) * 100 || 0,
        'Licenças Florestais': (p.forestLicenses / maxForest) * 100 || 0,
        'Reflorestamento': (p.reforestedArea / maxReforest) * 100 || 0,
      };
    });

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Tabela
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Gráfico
          </Button>
          <Button
            variant={viewMode === 'radar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('radar')}
          >
            <Map className="h-4 w-4 mr-1" />
            Radar
          </Button>
        </div>

        <Select value={sortMetric} onValueChange={(v) => setSortMetric(v as MetricKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Província</TableHead>
                    <TableHead className="text-right">Agricultores</TableHead>
                    <TableHead className="text-right">Área (ha)</TableHead>
                    <TableHead className="text-right">Produção (t)</TableHead>
                    <TableHead className="text-right">Ocorrências</TableHead>
                    <TableHead className="text-right">Risco</TableHead>
                    <TableHead className="text-right">Lic. Florestais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProvinces.map((province, index) => (
                    <TableRow key={province.id}>
                      <TableCell>
                        {index < 3 ? (
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            {index + 1}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{province.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(province.farmers)}</TableCell>
                      <TableCell className="text-right">{formatNumber(province.cultivatedArea)}</TableCell>
                      <TableCell className="text-right">{formatNumber(province.productionKg / 1000)}</TableCell>
                      <TableCell className="text-right">
                        <span className={province.occurrences > 10 ? 'text-red-500' : ''}>
                          {province.occurrences}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {province.riskScore > 50 ? (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-emerald-500" />
                          )}
                          {province.riskScore.toFixed(0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{province.forestLicenses}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bar Chart View */}
      {viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top 10 Províncias por {metricLabels[sortMetric]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), metricLabels[sortMetric]]}
                    labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radar Chart View */}
      {viewMode === 'radar' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparação Multi-dimensional (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Agricultores', ...Object.fromEntries(radarData.map(p => [p.province, p['Agricultores']])) },
                  { subject: 'Área Cultivada', ...Object.fromEntries(radarData.map(p => [p.province, p['Área Cultivada']])) },
                  { subject: 'Produção', ...Object.fromEntries(radarData.map(p => [p.province, p['Produção']])) },
                  { subject: 'Lic. Florestais', ...Object.fromEntries(radarData.map(p => [p.province, p['Licenças Florestais']])) },
                  { subject: 'Reflorestamento', ...Object.fromEntries(radarData.map(p => [p.province, p['Reflorestamento']])) },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {radarData.map((_, index) => (
                    <Radar
                      key={index}
                      name={radarData[index]?.province}
                      dataKey={radarData[index]?.province}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Província Líder</p>
              <p className="text-xl font-bold mt-1">
                {sortedProvinces[0]?.name || 'N/A'}
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatNumber(sortedProvinces[0]?.[sortMetric] || 0)}
              </p>
              <p className="text-xs text-muted-foreground">{metricLabels[sortMetric]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Média Nacional</p>
              <p className="text-2xl font-bold text-primary mt-3">
                {formatNumber(
                  provinces.reduce((sum, p) => sum + p[sortMetric], 0) / provinces.length || 0
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metricLabels[sortMetric]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Disparidade</p>
              <p className="text-2xl font-bold text-amber-500 mt-3">
                {sortedProvinces.length > 1 ? (
                  (sortedProvinces[0][sortMetric] / 
                   (sortedProvinces[sortedProvinces.length - 1][sortMetric] || 1)).toFixed(1)
                ) : 'N/A'}x
              </p>
              <p className="text-xs text-muted-foreground mt-1">Líder vs Último</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
