import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  MapPin, 
  Scale, 
  Download,
  ArrowUpDown,
  Grid3X3
} from 'lucide-react';
import { useProvinces } from '@/hooks/useFarmers';

// Mock regional data
const regionalData = [
  { province: 'Luanda', producao: 25000, agricultores: 12500, area: 45000, incentivos: 850000000, score: 85 },
  { province: 'Huambo', producao: 42000, agricultores: 28000, area: 120000, incentivos: 620000000, score: 92 },
  { province: 'Benguela', producao: 35000, agricultores: 18500, area: 85000, incentivos: 480000000, score: 78 },
  { province: 'Malanje', producao: 28000, agricultores: 15200, area: 95000, incentivos: 320000000, score: 72 },
  { province: 'Huíla', producao: 38000, agricultores: 22000, area: 110000, incentivos: 550000000, score: 88 },
  { province: 'Uíge', producao: 22000, agricultores: 14800, area: 72000, incentivos: 280000000, score: 68 },
  { province: 'Bié', producao: 31000, agricultores: 19500, area: 98000, incentivos: 410000000, score: 75 },
  { province: 'Cuanza Sul', producao: 27000, agricultores: 16200, area: 78000, incentivos: 350000000, score: 70 },
];

const radarData = [
  { indicator: 'Produção', Huambo: 92, Huíla: 88, Benguela: 78 },
  { indicator: 'Agricultores', Huambo: 85, Huíla: 82, Benguela: 75 },
  { indicator: 'Área Cultivada', Huambo: 90, Huíla: 85, Benguela: 72 },
  { indicator: 'Incentivos', Huambo: 78, Huíla: 80, Benguela: 70 },
  { indicator: 'Eficiência', Huambo: 88, Huíla: 86, Benguela: 82 },
  { indicator: 'Crescimento', Huambo: 75, Huíla: 78, Benguela: 68 },
];

type MetricKey = 'producao' | 'agricultores' | 'area' | 'incentivos' | 'score';

interface Metric {
  key: MetricKey;
  name: string;
  unit: string;
  format: (value: number) => string;
}

const metrics: Metric[] = [
  { key: 'producao', name: 'Produção (ton)', unit: 'ton', format: (v) => v.toLocaleString('pt-AO') },
  { key: 'agricultores', name: 'Agricultores', unit: '', format: (v) => v.toLocaleString('pt-AO') },
  { key: 'area', name: 'Área (ha)', unit: 'ha', format: (v) => v.toLocaleString('pt-AO') },
  { key: 'incentivos', name: 'Incentivos (AOA)', unit: 'AOA', format: (v) => `${(v / 1000000).toFixed(0)}M` },
  { key: 'score', name: 'Score Produtivo', unit: '%', format: (v) => `${v}%` },
];

export function RegionalComparisons() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('producao');
  const [viewType, setViewType] = useState<'bar' | 'radar'>('bar');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const sortedData = [...regionalData].sort((a, b) => 
    sortOrder === 'desc' ? b[selectedMetric] - a[selectedMetric] : a[selectedMetric] - b[selectedMetric]
  );

  const metric = metrics.find(m => m.key === selectedMetric);
  const topProvince = sortedData[0];
  const bottomProvince = sortedData[sortedData.length - 1];
  const avgValue = Math.round(sortedData.reduce((sum, d) => sum + d[selectedMetric], 0) / sortedData.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Comparações Inter-Regionais
            </CardTitle>
            <CardDescription>
              Análise comparativa entre províncias
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('bar')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('radar')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Indicador</Label>
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricKey)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {viewType === 'bar' && (
            <div className="space-y-2">
              <Label>Ordenação</Label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Maior → Menor</SelectItem>
                  <SelectItem value="asc">Menor → Maior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Melhor Desempenho</span>
            </div>
            <p className="text-lg font-bold mt-1">{topProvince.province}</p>
            <p className="text-sm text-muted-foreground">
              {metric?.format(topProvince[selectedMetric])} {metric?.unit}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">Média Nacional</span>
            </div>
            <p className="text-lg font-bold mt-1">{metric?.format(avgValue)}</p>
            <p className="text-sm text-muted-foreground">{metric?.unit}</p>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Menor Desempenho</span>
            </div>
            <p className="text-lg font-bold mt-1">{bottomProvince.province}</p>
            <p className="text-sm text-muted-foreground">
              {metric?.format(bottomProvince[selectedMetric])} {metric?.unit}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'bar' ? (
              <BarChart data={sortedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis 
                  type="category" 
                  dataKey="province" 
                  className="text-xs"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [metric?.format(value), metric?.name]}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            ) : (
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="indicator" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                <Radar name="Huambo" dataKey="Huambo" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                <Radar name="Huíla" dataKey="Huíla" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Benguela" dataKey="Benguela" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Província</th>
                {metrics.map(m => (
                  <th key={m.key} className="text-right p-3 font-medium">{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.slice(0, 5).map((row, idx) => (
                <tr key={row.province} className="border-t">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <Badge variant={idx === 0 ? 'default' : 'outline'} className="w-6 h-6 p-0 justify-center">
                      {idx + 1}
                    </Badge>
                    {row.province}
                  </td>
                  {metrics.map(m => (
                    <td key={m.key} className="text-right p-3 tabular-nums">
                      {m.format(row[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
