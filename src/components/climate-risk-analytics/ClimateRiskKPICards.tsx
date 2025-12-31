import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, 
  MapPin, 
  AlertTriangle, 
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClimateRiskKPIs } from '@/hooks/useClimateRiskAnalytics';

interface ClimateRiskKPICardsProps {
  data?: ClimateRiskKPIs;
  isLoading: boolean;
}

export function ClimateRiskKPICards({ data, isLoading }: ClimateRiskKPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      default: return 'Baixo';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  // Top 3 crops by risk
  const topRiskCrops = data?.riskIndexByCrop?.slice(0, 3) || [];

  const kpis = [
    {
      id: 'risk-index',
      label: 'Índice de Risco por Cultura',
      icon: Thermometer,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      content: (
        <div className="space-y-2">
          {topRiskCrops.map(crop => (
            <div key={crop.crop} className="flex items-center justify-between">
              <span className="text-sm">{crop.crop}</span>
              <div className="flex items-center gap-2">
                <Badge className={getRiskLevelColor(crop.riskLevel)} variant="secondary">
                  {crop.riskIndex}%
                </Badge>
              </div>
            </div>
          ))}
          {topRiskCrops.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>
      ),
      footer: `Média global: ${data?.avgRiskIndex || 0}%`
    },
    {
      id: 'area-at-risk',
      label: 'Área Produtiva em Risco',
      icon: MapPin,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      value: `${formatNumber(data?.productiveAreaAtRisk || 0)} ha`,
      footer: `${formatNumber(data?.totalFarmersAtRisk || 0)} agricultores afectados`,
      trend: data && data.productiveAreaAtRisk > 5000 ? 'up' : null
    },
    {
      id: 'extreme-events',
      label: 'Eventos Extremos Activos',
      icon: AlertTriangle,
      iconBg: data && data.activeExtremeEvents > 0 ? 'bg-red-100' : 'bg-green-100',
      iconColor: data && data.activeExtremeEvents > 0 ? 'text-red-600' : 'text-green-600',
      value: (data?.activeExtremeEvents || 0).toString(),
      renderExtra: () => (
        data && data.activeExtremeEvents > 0 ? (
          <Badge variant="destructive" className="text-xs animate-pulse">
            Activos
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800 text-xs">
            Controlado
          </Badge>
        )
      ),
      footer: data && data.activeExtremeEvents > 0 ? 'Requer atenção' : 'Situação estável'
    },
    {
      id: 'economic-loss',
      label: 'Perdas Económicas Estimadas',
      icon: DollarSign,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      value: formatCurrency(data?.estimatedEconomicLoss || 0),
      footer: 'Total acumulado',
      trend: data && data.estimatedEconomicLoss > 50000000 ? 'up' : null
    }
  ];

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
                <div className="flex items-center gap-1">
                  {kpi.renderExtra && kpi.renderExtra()}
                  {kpi.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">{kpi.label}</p>
              
              {kpi.content ? (
                kpi.content
              ) : (
                <p className="text-2xl font-bold">{kpi.value}</p>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">{kpi.footer}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
