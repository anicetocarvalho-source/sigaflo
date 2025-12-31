import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Layers,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';
import { ProvinceSubsidyDistribution } from '@/hooks/useIncentivesAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface SubsidyDistributionMapProps {
  data?: ProvinceSubsidyDistribution[];
  isLoading: boolean;
}

type MapLayer = 'subsidies' | 'impact';

export function SubsidyDistributionMap({ data, isLoading }: SubsidyDistributionMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('subsidies');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getIntensityColor = (value: number, max: number) => {
    const intensity = max > 0 ? value / max : 0;
    if (intensity > 0.8) return 'bg-primary';
    if (intensity > 0.6) return 'bg-primary/80';
    if (intensity > 0.4) return 'bg-primary/60';
    if (intensity > 0.2) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    );
  }

  const maxSubsidy = Math.max(...(data || []).map(d => d.totalDisbursed), 1);
  const maxImpact = Math.max(...(data || []).map(d => d.productionImpact), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa Territorial de Incentivos
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeLayer === 'subsidies' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('subsidies')}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Subsídios
            </Button>
            <Button
              variant={activeLayer === 'impact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('impact')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Impacto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Province Grid (Simulated Map) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data || []).map((province) => {
            const value = activeLayer === 'subsidies' 
              ? province.totalDisbursed 
              : province.productionImpact;
            const max = activeLayer === 'subsidies' ? maxSubsidy : maxImpact;
            
            return (
              <div
                key={province.provinceId}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${getIntensityColor(value, max)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm truncate text-primary-foreground">
                    {province.provinceName}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {province.programs} prog.
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-primary-foreground/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Desembolsado
                    </span>
                    <span className="font-medium">
                      {formatCurrency(province.totalDisbursed)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Beneficiários
                    </span>
                    <span className="font-medium">{province.beneficiaries}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Impacto
                    </span>
                    <span className="font-medium">
                      {province.productionImpact > 0 ? '+' : ''}{province.productionImpact}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Intensidade:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-primary/20" />
            <span className="text-xs text-muted-foreground">Baixa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-primary/50" />
            <span className="text-xs text-muted-foreground">Média</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-primary" />
            <span className="text-xs text-muted-foreground">Alta</span>
          </div>
        </div>

        {/* No data message */}
        {(!data || data.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sem dados de distribuição territorial</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
