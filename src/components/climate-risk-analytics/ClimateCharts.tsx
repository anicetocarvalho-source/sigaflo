import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingDown
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area
} from 'recharts';
import { EventFrequencyData, ClimateProductionImpact } from '@/hooks/useClimateRiskAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface ClimateChartsProps {
  frequencyData?: EventFrequencyData[];
  correlationData?: ClimateProductionImpact[];
  isLoading: boolean;
}

export function ClimateCharts({ frequencyData, correlationData, isLoading }: ClimateChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const frequencyConfig = {
    drought: {
      label: 'Secas',
      color: 'hsl(25, 95%, 53%)',
    },
    flood: {
      label: 'Cheias',
      color: 'hsl(210, 100%, 50%)',
    },
    fire: {
      label: 'Incêndios',
      color: 'hsl(0, 84%, 60%)',
    },
    pest: {
      label: 'Pragas',
      color: 'hsl(142, 71%, 45%)',
    },
  };

  const correlationConfig = {
    eventsCount: {
      label: 'Eventos Climáticos',
      color: 'hsl(0, 84%, 60%)',
    },
    productionKg: {
      label: 'Produção (kg)',
      color: 'hsl(142, 71%, 45%)',
    },
  };

  // Format correlation data for chart
  const formattedCorrelationData = (correlationData || []).map(d => ({
    ...d,
    productionTon: Math.round(d.productionKg / 1000)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Event Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Frequência Histórica de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!frequencyData?.length ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem dados históricos</p>
            </div>
          ) : (
            <ChartContainer config={frequencyConfig} className="h-64">
              <BarChart 
                data={frequencyData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="drought" 
                  stackId="a" 
                  fill="hsl(25, 95%, 53%)" 
                  name="Secas"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="flood" 
                  stackId="a" 
                  fill="hsl(210, 100%, 50%)" 
                  name="Cheias"
                />
                <Bar 
                  dataKey="fire" 
                  stackId="a" 
                  fill="hsl(0, 84%, 60%)" 
                  name="Incêndios"
                />
                <Bar 
                  dataKey="pest" 
                  stackId="a" 
                  fill="hsl(142, 71%, 45%)" 
                  name="Pragas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Correlation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Correlação Clima vs Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!formattedCorrelationData?.length ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem dados de correlação</p>
            </div>
          ) : (
            <ChartContainer config={correlationConfig} className="h-64">
              <ComposedChart 
                data={formattedCorrelationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Eventos', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Produção (ton)', angle: 90, position: 'insideRight' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="eventsCount" 
                  fill="hsl(0, 84%, 60%)" 
                  name="Eventos"
                  opacity={0.7}
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="productionTon" 
                  stroke="hsl(142, 71%, 45%)" 
                  strokeWidth={2}
                  name="Produção (ton)"
                  dot={{ fill: 'hsl(142, 71%, 45%)' }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
          
          {/* Correlation insight */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Insight:</strong> Observa-se correlação negativa entre eventos climáticos e produção. 
              Períodos com mais eventos tendem a apresentar menor produtividade agrícola.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
