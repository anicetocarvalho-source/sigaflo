import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Calculator, 
  CloudRain, 
  Bug, 
  Leaf, 
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useInsuranceRiskScores, useCalculateInsuranceRisk } from '@/hooks/useCreditInsurance';
import { toast } from 'sonner';

export function InsuranceRiskScores() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [selectedScore, setSelectedScore] = useState<any>(null);

  const { data: farmers } = useFarmers();
  const { data: scores, isLoading, refetch } = useInsuranceRiskScores();
  const calculateRisk = useCalculateInsuranceRisk();

  const handleCalculate = async () => {
    if (!selectedFarmerId) {
      toast.error('Seleccione um agricultor');
      return;
    }

    try {
      const result = await calculateRisk.mutateAsync(selectedFarmerId);
      setSelectedScore(result);
      toast.success('Score de risco calculado');
      refetch();
    } catch (e) {
      toast.error('Erro ao calcular score');
    }
  };

  const getRiskClassBadge = (riskClass: string) => {
    const classes: Record<string, { color: string; label: string }> = {
      'A': { color: 'bg-green-100 text-green-800', label: 'Classe A - Excelente' },
      'B': { color: 'bg-blue-100 text-blue-800', label: 'Classe B - Bom' },
      'C': { color: 'bg-yellow-100 text-yellow-800', label: 'Classe C - Médio' },
      'D': { color: 'bg-orange-100 text-orange-800', label: 'Classe D - Elevado' },
      'E': { color: 'bg-red-100 text-red-800', label: 'Classe E - Muito Elevado' },
    };
    const config = classes[riskClass] || { color: 'bg-gray-100 text-gray-800', label: riskClass };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Calcular Score de Risco para Seguro</CardTitle>
          <CardDescription>
            Avalie o risco agrícola baseado em factores climáticos, pragas e práticas agrícolas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
              <SelectTrigger className="md:w-[400px]">
                <SelectValue placeholder="Seleccione um agricultor" />
              </SelectTrigger>
              <SelectContent>
                {farmers?.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCalculate} disabled={calculateRisk.isPending}>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Score Detail */}
      {selectedScore && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle>Análise de Risco para Seguro</CardTitle>
              {getRiskClassBadge(selectedScore.insurable_risk_class)}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Score Components */}
              <div className="space-y-4">
                <h4 className="font-medium">Componentes do Score</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" />
                        Histórico Climático
                      </span>
                      <span className={getScoreColor(selectedScore.climate_history_score)}>
                        {selectedScore.climate_history_score}/100
                      </span>
                    </div>
                    <Progress value={selectedScore.climate_history_score} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Frequência de Pragas
                      </span>
                      <span className={getScoreColor(selectedScore.pest_frequency_score)}>
                        {selectedScore.pest_frequency_score}/100
                      </span>
                    </div>
                    <Progress value={selectedScore.pest_frequency_score} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        Risco da Cultura
                      </span>
                      <span className={getScoreColor(selectedScore.crop_risk_score)}>
                        {selectedScore.crop_risk_score}/100
                      </span>
                    </div>
                    <Progress value={selectedScore.crop_risk_score} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Práticas Agrícolas
                      </span>
                      <span className={getScoreColor(selectedScore.practices_score)}>
                        {selectedScore.practices_score}/100
                      </span>
                    </div>
                    <Progress value={selectedScore.practices_score} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Eventos Extremos
                      </span>
                      <span className={getScoreColor(selectedScore.extreme_events_score)}>
                        {selectedScore.extreme_events_score}/100
                      </span>
                    </div>
                    <Progress value={selectedScore.extreme_events_score} className="h-2" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Score Global</span>
                    <span className={`text-2xl font-bold ${getScoreColor(selectedScore.overall_risk_score)}`}>
                      {selectedScore.overall_risk_score}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium">Recomendações de Seguro</h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Multiplicador de Prémio</p>
                    <p className="text-xl font-bold">{formatCurrency(selectedScore.suggested_premium_multiplier)}x</p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Franquia Sugerida</p>
                    <p className="text-xl font-bold">{selectedScore.suggested_deductible_pct}%</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Coberturas Sugeridas</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedScore.suggested_coverage_types?.map((type: string) => (
                      <Badge key={type} variant="secondary" className="capitalize">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Sugestões de Mitigação</h5>
                  <ul className="space-y-1">
                    {selectedScore.risk_mitigation_suggestions?.map((suggestion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scores List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scores Calculados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : scores?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum score calculado ainda</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scores?.map((score) => (
                <Card 
                  key={score.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedScore(score)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`text-3xl font-bold ${getScoreColor(score.overall_risk_score)}`}>
                        {score.overall_risk_score}
                      </div>
                      {getRiskClassBadge(score.insurable_risk_class)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Calculado em {new Date(score.calculated_at).toLocaleDateString('pt-AO')}
                    </div>
                    {score.valid_until && (
                      <div className="text-xs text-muted-foreground">
                        Válido até {new Date(score.valid_until).toLocaleDateString('pt-AO')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
