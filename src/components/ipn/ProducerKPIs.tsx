import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Wheat, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { ReputationScore } from './ReputationScore';

interface ProducerKPIsProps {
  overallScore: number;
  averageAnnualProduction: number; // in tonnes
  institutionalCompliance: number; // percentage
  subsidiesReceived: number; // in Kz
  sanctionsCount: number;
  productionTrend?: number; // percentage change
}

export function ProducerKPIs({
  overallScore,
  averageAnnualProduction,
  institutionalCompliance,
  subsidiesReceived,
  sanctionsCount,
  productionTrend = 0
}: ProducerKPIsProps) {
  
  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 80) return 'text-green-600';
    if (compliance >= 60) return 'text-blue-600';
    if (compliance >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const kpis = [
    {
      id: 'score',
      label: 'Score Produtivo Global',
      icon: Award,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      renderValue: () => (
        <ReputationScore score={overallScore} size="lg" showLabel={false} />
      ),
      footer: overallScore >= 60 ? 'Bom desempenho' : 'Precisa de melhoria'
    },
    {
      id: 'production',
      label: 'Produção Média Anual',
      icon: Wheat,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      value: `${averageAnnualProduction.toFixed(1)} ton`,
      renderExtra: () => (
        <div className="flex items-center gap-1 text-xs">
          {getTrendIcon(productionTrend)}
          <span className={productionTrend > 0 ? 'text-green-600' : productionTrend < 0 ? 'text-red-600' : 'text-muted-foreground'}>
            {productionTrend > 0 ? '+' : ''}{productionTrend}%
          </span>
        </div>
      ),
      footer: 'vs período anterior'
    },
    {
      id: 'compliance',
      label: 'Cumprimento Institucional',
      icon: CheckCircle,
      iconBg: institutionalCompliance >= 60 ? 'bg-green-100' : 'bg-red-100',
      iconColor: institutionalCompliance >= 60 ? 'text-green-600' : 'text-red-600',
      value: `${institutionalCompliance}%`,
      valueColor: getComplianceColor(institutionalCompliance),
      footer: institutionalCompliance >= 80 ? 'Excelente' : institutionalCompliance >= 60 ? 'Satisfatório' : 'Atenção necessária'
    },
    {
      id: 'subsidies',
      label: 'Subsídios Recebidos',
      icon: DollarSign,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      value: subsidiesReceived > 0 
        ? `${(subsidiesReceived / 1000000).toFixed(1)}M Kz` 
        : '0 Kz',
      footer: subsidiesReceived > 0 ? 'Total acumulado' : 'Nenhum subsídio'
    },
    {
      id: 'sanctions',
      label: 'Sanções / Inconformidades',
      icon: AlertTriangle,
      iconBg: sanctionsCount > 0 ? 'bg-red-100' : 'bg-green-100',
      iconColor: sanctionsCount > 0 ? 'text-red-600' : 'text-green-600',
      value: sanctionsCount.toString(),
      valueColor: sanctionsCount > 0 ? 'text-red-600' : 'text-green-600',
      renderExtra: () => (
        sanctionsCount > 0 ? (
          <Badge variant="destructive" className="text-xs">
            {sanctionsCount} activa{sanctionsCount !== 1 ? 's' : ''}
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800 text-xs">
            Sem ocorrências
          </Badge>
        )
      ),
      footer: sanctionsCount > 0 ? 'Requer atenção' : 'Bom historial'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={kpi.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <IconComponent className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                  {kpi.renderExtra && kpi.renderExtra()}
                </div>
                
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                
                {kpi.renderValue ? (
                  kpi.renderValue()
                ) : (
                  <p className={`text-2xl font-bold ${kpi.valueColor || ''}`}>
                    {kpi.value}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  {kpi.footer}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
