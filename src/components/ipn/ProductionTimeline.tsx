import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Wheat, 
  DollarSign,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';

interface TimelineEvent {
  id: string;
  type: 'production' | 'certification' | 'incentive' | 'sanction';
  year: number;
  month?: number;
  title: string;
  description: string;
  value?: number;
  unit?: string;
}

interface ProductionTimelineProps {
  productionHistory: Array<{
    year: number;
    quantity: number;
    product: string;
  }>;
  certificationHistory: Array<{
    id: string;
    type: string;
    issueDate?: string;
    status: string;
  }>;
  incentivesHistory: Array<{
    id: string;
    type: 'subsidy' | 'incentive' | 'sanction';
    description: string;
    amount?: number;
    date: string;
  }>;
}

export function ProductionTimeline({ 
  productionHistory, 
  certificationHistory, 
  incentivesHistory 
}: ProductionTimelineProps) {
  // Aggregate production by year
  const productionByYear = productionHistory.reduce((acc, p) => {
    if (!acc[p.year]) {
      acc[p.year] = { year: p.year, total: 0, count: 0 };
    }
    acc[p.year].total += p.quantity;
    acc[p.year].count += 1;
    return acc;
  }, {} as Record<number, { year: number; total: number; count: number }>);

  const chartData = Object.values(productionByYear)
    .sort((a, b) => a.year - b.year)
    .map(item => ({
      year: item.year.toString(),
      producao: Math.round(item.total / 1000), // Convert to tonnes
      registos: item.count
    }));

  // Calculate average for reference line
  const avgProduction = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.producao, 0) / chartData.length 
    : 0;

  // Create timeline events
  const events: TimelineEvent[] = [
    ...productionHistory.slice(0, 5).map(p => ({
      id: `prod-${p.year}-${Math.random()}`,
      type: 'production' as const,
      year: p.year,
      title: `Produção de ${p.product}`,
      description: `${(p.quantity / 1000).toFixed(1)} toneladas`,
      value: p.quantity,
      unit: 'kg'
    })),
    ...certificationHistory.slice(0, 5).map(c => ({
      id: c.id,
      type: 'certification' as const,
      year: c.issueDate ? new Date(c.issueDate).getFullYear() : new Date().getFullYear(),
      month: c.issueDate ? new Date(c.issueDate).getMonth() + 1 : undefined,
      title: `Certificado ${c.type}`,
      description: c.status === 'issued' ? 'Emitido' : c.status,
    })),
    ...incentivesHistory.slice(0, 5).map(i => ({
      id: i.id,
      type: i.type === 'sanction' ? 'sanction' as const : 'incentive' as const,
      year: new Date(i.date).getFullYear(),
      month: new Date(i.date).getMonth() + 1,
      title: i.description,
      description: i.amount ? `${i.amount.toLocaleString()} Kz` : '',
      value: i.amount
    }))
  ].sort((a, b) => b.year - a.year);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'production':
        return <Wheat className="h-4 w-4" />;
      case 'certification':
        return <Award className="h-4 w-4" />;
      case 'incentive':
        return <DollarSign className="h-4 w-4" />;
      case 'sanction':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'certification':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'incentive':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sanction':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const chartConfig = {
    producao: {
      label: 'Produção (ton)',
      color: 'hsl(var(--primary))',
    },
    registos: {
      label: 'Registos',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  return (
    <div className="space-y-6">
      {/* Production Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Produção Anual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Wheat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sem dados de produção</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Toneladas', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine 
                  y={avgProduction} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Média', fill: 'hsl(var(--destructive))' }}
                />
                <Bar 
                  dataKey="producao" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Line 
                  type="monotone" 
                  dataKey="producao" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Linha Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Sem eventos registados</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.type)} border z-10`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.year}{event.month ? `/${event.month.toString().padStart(2, '0')}` : ''}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
