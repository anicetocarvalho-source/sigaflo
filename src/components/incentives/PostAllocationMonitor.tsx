import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Users,
  Sprout,
  Briefcase
} from 'lucide-react';
import { useImpacts, useAllocations } from '@/hooks/useIncentives';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function PostAllocationMonitor() {
  const { data: impacts } = useImpacts();
  const { data: allocations } = useAllocations(undefined, 'disbursed');

  // Aggregate impact metrics
  const aggregatedImpacts = impacts?.reduce((acc, impact) => {
    return {
      productionIncrease: acc.productionIncrease + (impact.production_change_pct || 0),
      areaIncrease: acc.areaIncrease + (impact.area_change_pct || 0),
      incomeIncrease: acc.incomeIncrease + (impact.income_change_pct || 0),
      jobsCreated: acc.jobsCreated + (impact.jobs_created || 0),
      avgCompliance: acc.avgCompliance + (impact.compliance_score || 0),
      count: acc.count + 1,
    };
  }, {
    productionIncrease: 0,
    areaIncrease: 0,
    incomeIncrease: 0,
    jobsCreated: 0,
    avgCompliance: 0,
    count: 0,
  });

  const avgMetrics = aggregatedImpacts ? {
    productionIncrease: aggregatedImpacts.count > 0 ? aggregatedImpacts.productionIncrease / aggregatedImpacts.count : 0,
    areaIncrease: aggregatedImpacts.count > 0 ? aggregatedImpacts.areaIncrease / aggregatedImpacts.count : 0,
    incomeIncrease: aggregatedImpacts.count > 0 ? aggregatedImpacts.incomeIncrease / aggregatedImpacts.count : 0,
    jobsCreated: aggregatedImpacts.jobsCreated,
    avgCompliance: aggregatedImpacts.count > 0 ? aggregatedImpacts.avgCompliance / aggregatedImpacts.count : 0,
  } : null;

  // Mock trend data
  const trendData = [
    { month: 'Jan', production: 100, income: 100 },
    { month: 'Fev', production: 105, income: 102 },
    { month: 'Mar', production: 108, income: 106 },
    { month: 'Abr', production: 115, income: 112 },
    { month: 'Mai', production: 120, income: 118 },
    { month: 'Jun', production: 125, income: 122 },
  ];

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monitorização Pós-Atribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Produção</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {avgMetrics ? `${avgMetrics.productionIncrease >= 0 ? '+' : ''}${avgMetrics.productionIncrease.toFixed(1)}%` : 'N/A'}
                </span>
                {avgMetrics && getTrendIcon(avgMetrics.productionIncrease)}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Rendimento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {avgMetrics ? `${avgMetrics.incomeIncrease >= 0 ? '+' : ''}${avgMetrics.incomeIncrease.toFixed(1)}%` : 'N/A'}
                </span>
                {avgMetrics && getTrendIcon(avgMetrics.incomeIncrease)}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Empregos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {avgMetrics ? `+${avgMetrics.jobsCreated}` : 'N/A'}
                </span>
                {avgMetrics && getTrendIcon(avgMetrics.jobsCreated)}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Conformidade</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">
                  {avgMetrics ? `${avgMetrics.avgCompliance.toFixed(0)}%` : 'N/A'}
                </span>
                <Progress value={avgMetrics?.avgCompliance || 0} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.2}
                  name="Produção (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  name="Rendimento (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {impacts && impacts.length > 0 ? (
            <div className="space-y-3">
              {impacts.slice(0, 5).map((impact) => (
                <div 
                  key={impact.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {impact.evaluation_type === 'baseline' ? 'Linha Base' :
                       impact.evaluation_type === 'midterm' ? 'Meio-termo' : 'Final'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(impact.evaluation_date), "d 'de' MMMM yyyy", { locale: pt })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Produção:</span>
                      <Badge variant={impact.production_change_pct && impact.production_change_pct > 0 ? 'default' : 'secondary'}>
                        {impact.production_change_pct ? `${impact.production_change_pct > 0 ? '+' : ''}${impact.production_change_pct.toFixed(1)}%` : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Conformidade:</span>
                      <Badge variant="outline">
                        {impact.compliance_score?.toFixed(0) || 'N/A'}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma avaliação de impacto registada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
