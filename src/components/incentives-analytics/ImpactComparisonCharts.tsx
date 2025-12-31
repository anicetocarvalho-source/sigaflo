import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  BarChart3
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
  Cell
} from 'recharts';
import { ProgramImpactComparison } from '@/hooks/useIncentivesAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface ImpactComparisonChartsProps {
  data?: ProgramImpactComparison[];
  isLoading: boolean;
}

export function ImpactComparisonCharts({ data, isLoading }: ImpactComparisonChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const productionData = (data || [])
    .filter(d => d.productionBefore > 0 || d.productionAfter > 0)
    .slice(0, 8)
    .map(d => ({
      name: d.programName.length > 20 ? d.programName.slice(0, 17) + '...' : d.programName,
      antes: Math.round(d.productionBefore / 1000),
      depois: Math.round(d.productionAfter / 1000),
      variacao: d.productionChange
    }));

  const priceData = (data || [])
    .filter(d => d.priceBefore > 0 || d.priceAfter > 0)
    .slice(0, 8)
    .map(d => ({
      name: d.programName.length > 20 ? d.programName.slice(0, 17) + '...' : d.programName,
      antes: Math.round(d.priceBefore / 1000000),
      depois: Math.round(d.priceAfter / 1000000),
      variacao: d.priceChange
    }));

  const productionConfig = {
    antes: {
      label: 'Antes (ton)',
      color: 'hsl(var(--muted-foreground))',
    },
    depois: {
      label: 'Depois (ton)',
      color: 'hsl(var(--primary))',
    },
  };

  const priceConfig = {
    antes: {
      label: 'Antes (M Kz)',
      color: 'hsl(var(--muted-foreground))',
    },
    depois: {
      label: 'Depois (M Kz)',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Production Before vs After */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Produção Antes vs Depois do Incentivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem dados de comparação de produção</p>
            </div>
          ) : (
            <ChartContainer config={productionConfig} className="h-64">
              <BarChart 
                data={productionData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="antes" 
                  fill="hsl(var(--muted-foreground))" 
                  name="Antes (ton)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="depois" 
                  fill="hsl(var(--primary))" 
                  name="Depois (ton)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Price Before vs After */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rendimento Antes vs Depois do Incentivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Sem dados de comparação de rendimento</p>
            </div>
          ) : (
            <ChartContainer config={priceConfig} className="h-64">
              <BarChart 
                data={priceData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="antes" 
                  fill="hsl(var(--muted-foreground))" 
                  name="Antes (M Kz)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="depois" 
                  fill="hsl(var(--primary))" 
                  name="Depois (M Kz)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
