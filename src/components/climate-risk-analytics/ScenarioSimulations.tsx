import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MapPin,
  Shield
} from 'lucide-react';
import { ClimateScenarioSimulation } from '@/hooks/useClimateRiskAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface ScenarioSimulationsProps {
  data?: ClimateScenarioSimulation[];
  isLoading: boolean;
}

export function ScenarioSimulations({ data, isLoading }: ScenarioSimulationsProps) {
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

  const getScenarioColor = (scenario: string) => {
    if (scenario.toLowerCase().includes('optimista')) return 'border-green-500 bg-green-50';
    if (scenario.toLowerCase().includes('severa') || scenario.toLowerCase().includes('combinado')) 
      return 'border-red-500 bg-red-50';
    return 'border-orange-500 bg-orange-50';
  };

  const getScenarioIcon = (scenario: string) => {
    if (scenario.toLowerCase().includes('optimista')) 
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (scenario.toLowerCase().includes('severa') || scenario.toLowerCase().includes('combinado')) 
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Calculator className="h-5 w-5 text-orange-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulação de Impacto por Cenário Climático
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sem cenários configurados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((scenario, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getScenarioColor(scenario.scenario)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(scenario.scenario)}
                    <h4 className="font-semibold">{scenario.scenario}</h4>
                  </div>
                  <Badge variant="outline">
                    {(scenario.probability * 100).toFixed(0)}% prob.
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {scenario.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Área afectada
                    </span>
                    <span className="font-medium">
                      {formatNumber(scenario.affectedAreaHa)} ha
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Agricultores
                    </span>
                    <span className="font-medium">
                      {formatNumber(scenario.farmersAffected)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      Perda económica
                    </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(scenario.economicLoss)}
                    </span>
                  </div>

                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Custo mitigação
                      </span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(scenario.mitigationCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Compensação
                      </span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(scenario.compensationNeeded)}
                      </span>
                    </div>
                  </div>

                  {/* Probability indicator */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Probabilidade</span>
                      <span>{(scenario.probability * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={scenario.probability * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {data && data.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Resumo Orçamental</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Perda Média Esperada</p>
                <p className="font-bold text-lg">
                  {formatCurrency(
                    data.reduce((sum, s) => sum + s.economicLoss * s.probability, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Mitigação Recomendada</p>
                <p className="font-bold text-lg text-blue-600">
                  {formatCurrency(
                    data.reduce((sum, s) => sum + s.mitigationCost * s.probability, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Reserva Compensação</p>
                <p className="font-bold text-lg text-purple-600">
                  {formatCurrency(
                    data.reduce((sum, s) => sum + s.compensationNeeded * s.probability, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Agricultores em Risco</p>
                <p className="font-bold text-lg">
                  {formatNumber(
                    Math.round(data.reduce((sum, s) => sum + s.farmersAffected * s.probability, 0))
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
