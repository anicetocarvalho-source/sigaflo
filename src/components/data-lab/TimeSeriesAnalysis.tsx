import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  Layers,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { useProvinces } from '@/hooks/useFarmers';

// Mock time series data
const generateTimeSeriesData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month, i) => ({
    month,
    producao_agricola: Math.round(15000 + Math.random() * 10000 + (i < 6 ? i * 1000 : (12 - i) * 1000)),
    producao_florestal: Math.round(5000 + Math.random() * 3000),
    cafe: Math.round(2000 + Math.random() * 1500),
    eventos_climaticos: Math.round(Math.random() * 20),
  }));
};

const historicalData = {
  '2024': generateTimeSeriesData(),
  '2023': generateTimeSeriesData().map(d => ({ ...d, producao_agricola: d.producao_agricola * 0.9 })),
  '2022': generateTimeSeriesData().map(d => ({ ...d, producao_agricola: d.producao_agricola * 0.8 })),
};

type DatasetKey = 'producao_agricola' | 'producao_florestal' | 'cafe' | 'eventos_climaticos';

interface Dataset {
  key: DatasetKey;
  name: string;
  color: string;
  unit: string;
}

const datasets: Dataset[] = [
  { key: 'producao_agricola', name: 'Produção Agrícola', color: '#22c55e', unit: 'ton' },
  { key: 'producao_florestal', name: 'Produção Florestal', color: '#84cc16', unit: 'm³' },
  { key: 'cafe', name: 'Café', color: '#a16207', unit: 'ton' },
  { key: 'eventos_climaticos', name: 'Eventos Climáticos', color: '#ef4444', unit: 'eventos' },
];

export function TimeSeriesAnalysis() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDatasets, setSelectedDatasets] = useState<DatasetKey[]>(['producao_agricola', 'producao_florestal']);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [compareYears, setCompareYears] = useState(false);
  const { data: provinces } = useProvinces();

  const currentData = historicalData[selectedYear as keyof typeof historicalData] || historicalData['2024'];

  const toggleDataset = (key: DatasetKey) => {
    setSelectedDatasets(prev =>
      prev.includes(key)
        ? prev.filter(d => d !== key)
        : [...prev, key]
    );
  };

  const handleExport = (format: string) => {
    // Export functionality
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Séries Temporais
            </CardTitle>
            <CardDescription>
              Evolução histórica dos dados agro-florestais
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
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
            <Label>Período</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Datasets</Label>
            <div className="flex flex-wrap gap-2">
              {datasets.map((ds) => (
                <Badge
                  key={ds.key}
                  variant={selectedDatasets.includes(ds.key) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedDatasets.includes(ds.key) ? ds.color : undefined,
                    borderColor: ds.color
                  }}
                  onClick={() => toggleDataset(ds.key)}
                >
                  {ds.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="compare"
              checked={compareYears}
              onCheckedChange={(checked) => setCompareYears(!!checked)}
            />
            <Label htmlFor="compare" className="cursor-pointer">
              Comparar anos
            </Label>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {selectedDatasets.map((key) => {
                  const ds = datasets.find(d => d.key === key);
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={ds?.name}
                      stroke={ds?.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {selectedDatasets.map((key) => {
                  const ds = datasets.find(d => d.key === key);
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={ds?.name}
                      stroke={ds?.color}
                      fill={ds?.color}
                      fillOpacity={0.3}
                    />
                  );
                })}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedDatasets.map((key) => {
            const ds = datasets.find(d => d.key === key);
            const values = currentData.map(d => d[key]);
            const total = values.reduce((a, b) => a + b, 0);
            const avg = Math.round(total / values.length);
            const max = Math.max(...values);
            
            return (
              <div 
                key={key} 
                className="p-3 rounded-lg border"
                style={{ borderLeftColor: ds?.color, borderLeftWidth: 3 }}
              >
                <p className="text-sm text-muted-foreground">{ds?.name}</p>
                <p className="text-xl font-bold">{total.toLocaleString('pt-AO')}</p>
                <p className="text-xs text-muted-foreground">
                  Média: {avg.toLocaleString('pt-AO')} {ds?.unit}/mês
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
