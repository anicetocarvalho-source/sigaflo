import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Users,
  Target
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface ProducerComparisonsProps {
  producerName: string;
  producerScores: {
    production: number;
    compliance: number;
    certification: number;
    overall: number;
  };
  provincialAverages?: {
    production: number;
    compliance: number;
    certification: number;
    overall: number;
  };
  historicalScores?: Array<{
    year: number;
    production: number;
    compliance: number;
    certification: number;
    overall: number;
  }>;
}

export function ProducerComparisons({ 
  producerName, 
  producerScores, 
  provincialAverages = { production: 55, compliance: 60, certification: 50, overall: 55 },
  historicalScores = []
}: ProducerComparisonsProps) {
  
  // Radar chart data for comparison
  const radarData = [
    {
      metric: 'Produção',
      produtor: producerScores.production,
      media: provincialAverages.production,
    },
    {
      metric: 'Conformidade',
      produtor: producerScores.compliance,
      media: provincialAverages.compliance,
    },
    {
      metric: 'Certificação',
      produtor: producerScores.certification,
      media: provincialAverages.certification,
    },
    {
      metric: 'Global',
      produtor: producerScores.overall,
      media: provincialAverages.overall,
    },
  ];

  // Historical evolution data
  const evolutionData = historicalScores.length > 0 
    ? historicalScores 
    : [
        { year: 2021, overall: Math.max(0, producerScores.overall - 15) },
        { year: 2022, overall: Math.max(0, producerScores.overall - 8) },
        { year: 2023, overall: Math.max(0, producerScores.overall - 3) },
        { year: 2024, overall: producerScores.overall },
      ];

  // Calculate comparison metrics
  const comparisonMetrics = [
    {
      label: 'Score Produtivo',
      producer: producerScores.production,
      average: provincialAverages.production,
      diff: producerScores.production - provincialAverages.production
    },
    {
      label: 'Conformidade',
      producer: producerScores.compliance,
      average: provincialAverages.compliance,
      diff: producerScores.compliance - provincialAverages.compliance
    },
    {
      label: 'Certificação',
      producer: producerScores.certification,
      average: provincialAverages.certification,
      diff: producerScores.certification - provincialAverages.certification
    },
    {
      label: 'Score Global',
      producer: producerScores.overall,
      average: provincialAverages.overall,
      diff: producerScores.overall - provincialAverages.overall
    },
  ];

  const getTrendIcon = (diff: number) => {
    if (diff > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (diff < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (diff: number) => {
    if (diff > 5) return 'text-green-600';
    if (diff < -5) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const radarConfig = {
    produtor: {
      label: producerName,
      color: 'hsl(var(--primary))',
    },
    media: {
      label: 'Média Provincial',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  const evolutionConfig = {
    overall: {
      label: 'Score Global',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      {/* Comparison Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {comparisonMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.producer}</p>
                </div>
                <div className="flex flex-col items-end">
                  {getTrendIcon(metric.diff)}
                  <span className={`text-xs font-medium ${getTrendColor(metric.diff)}`}>
                    {metric.diff > 0 ? '+' : ''}{metric.diff}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Média: {metric.average}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Produtor vs Média Provincial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="h-80">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Radar
                  name="Produtor"
                  dataKey="produtor"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Radar
                  name="Média Provincial"
                  dataKey="media"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.2}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Historical Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução Histórica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={evolutionConfig} className="h-80">
              <BarChart data={evolutionData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="overall" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Score Global"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={metric.diff >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {metric.diff >= 0 ? 'Acima' : 'Abaixo'} da média
                    </Badge>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  {/* Provincial average marker */}
                  <div 
                    className="absolute top-0 w-1 h-full bg-muted-foreground z-10"
                    style={{ left: `${metric.average}%` }}
                  />
                  {/* Producer bar */}
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                      metric.diff >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.producer}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Média: {metric.average}</span>
                  <span>100</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
