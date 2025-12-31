import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  Target, 
  Users, 
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { IncentivesFinancialKPIs } from '@/hooks/useIncentivesAnalytics';

interface IncentivesKPICardsProps {
  data?: IncentivesFinancialKPIs;
  isLoading: boolean;
}

export function IncentivesKPICards({ data, isLoading }: IncentivesKPICardsProps) {
  const formatCurrency = (value: number, compact = true) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  };

  const kpis = [
    {
      id: 'total-invested',
      label: 'Total Investido em Incentivos',
      value: data ? formatCurrency(data.totalInvested) : '-',
      icon: Coins,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      footer: `${data?.totalPrograms || 0} programas executados`,
      trend: null
    },
    {
      id: 'return-per-kz',
      label: 'Retorno Produtivo por Kz',
      value: data ? `${data.productiveReturnPerKz.toFixed(2)}x` : '-',
      icon: TrendingUp,
      iconBg: data && data.productiveReturnPerKz >= 1 ? 'bg-green-100' : 'bg-red-100',
      iconColor: data && data.productiveReturnPerKz >= 1 ? 'text-green-600' : 'text-red-600',
      footer: 'Valor produtivo / investimento',
      trend: data && data.productiveReturnPerKz >= 1 ? 'up' : 'down'
    },
    {
      id: 'positive-impact',
      label: '% Programas com Impacto Positivo',
      value: data ? `${data.positiveImpactPercentage}%` : '-',
      icon: Target,
      iconBg: data && data.positiveImpactPercentage >= 70 ? 'bg-green-100' : 'bg-amber-100',
      iconColor: data && data.positiveImpactPercentage >= 70 ? 'text-green-600' : 'text-amber-600',
      footer: `${data?.programsWithPositiveImpact || 0} de ${data?.totalPrograms || 0} programas`,
      trend: data && data.positiveImpactPercentage >= 70 ? 'up' : null
    },
    {
      id: 'cost-per-beneficiary',
      label: 'Custo por Produtor Beneficiado',
      value: data ? formatCurrency(data.costPerBeneficiary, false) : '-',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      footer: `${data?.totalBeneficiaries?.toLocaleString() || 0} beneficiários totais`,
      trend: null
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={kpi.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <IconComponent className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                {kpi.trend && (
                  <div className={`flex items-center gap-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{kpi.footer}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
