import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScenarioProjection } from '@/hooks/useONAF';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface ScenarioChartProps {
  projections: ScenarioProjection[];
}

export function ScenarioChart({ projections }: ScenarioChartProps) {
  const formatValue = (value: number, unit: string): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const chartData = projections.map(p => ({
    name: p.name,
    'Actual': p.current,
    'Optimista': p.optimistic,
    'Crítico': p.critical,
    unit: p.unit,
  }));

  const getChangeIndicator = (current: number, optimistic: number, critical: number) => {
    const optimisticChange = ((optimistic - current) / current) * 100;
    const criticalChange = ((critical - current) / current) * 100;
    
    return { optimisticChange, criticalChange };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const unit = payload[0]?.payload?.unit || '';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
              <span className="font-medium">
                {formatValue(entry.value, unit)} {unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cenários de Projecção</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" tickFormatter={(val) => formatValue(val, '')} />
              <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Crítico" fill="#ef4444" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Actual" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Optimista" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h4 className="font-medium text-red-500">Cenário Crítico</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Sem intervenção: aumento de importações, perdas climáticas e degradação florestal acentuada.
            </p>
            <div className="mt-3 space-y-1">
              {projections.slice(0, 3).map(p => {
                const change = ((p.critical - p.current) / p.current) * 100;
                const isNegative = p.name.includes('Produção') || p.name.includes('Reflorest') 
                  ? change < 0 
                  : change > 0;
                return (
                  <div key={p.name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{p.name}</span>
                    <Badge variant={isNegative ? 'destructive' : 'secondary'} className="text-xs">
                      {change > 0 ? '+' : ''}{change.toFixed(0)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-indigo-500">Cenário Actual</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Baseline: continuação das tendências actuais sem mudanças significativas de política.
            </p>
            <div className="mt-3 space-y-1">
              {projections.slice(0, 3).map(p => (
                <div key={p.name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-medium">{formatValue(p.current, p.unit)} {p.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h4 className="font-medium text-emerald-500">Cenário Optimista</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Com investimento estratégico: aumento da produção, redução de importações e recuperação florestal.
            </p>
            <div className="mt-3 space-y-1">
              {projections.slice(0, 3).map(p => {
                const change = ((p.optimistic - p.current) / p.current) * 100;
                const isPositive = p.name.includes('Produção') || p.name.includes('Reflorest')
                  ? change > 0
                  : change < 0;
                return (
                  <div key={p.name} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{p.name}</span>
                    <Badge variant={isPositive ? 'default' : 'secondary'} className="text-xs bg-emerald-500">
                      {change > 0 ? '+' : ''}{change.toFixed(0)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
