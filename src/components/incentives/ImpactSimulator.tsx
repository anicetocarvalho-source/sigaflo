import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Users, 
  Coins, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { 
  IncentiveProgram, 
  useEligibilityRules,
  simulateEligibility,
  SimulationResult
} from '@/hooks/useIncentives';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ImpactSimulatorProps {
  programs: IncentiveProgram[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ImpactSimulator({ programs }: ImpactSimulatorProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [budgetMultiplier, setBudgetMultiplier] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  const { data: rules } = useEligibilityRules(selectedProgram);

  const activePrograms = programs.filter(p => ['active', 'draft'].includes(p.status));
  const selectedProgramData = programs.find(p => p.id === selectedProgram);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const runSimulation = async () => {
    if (!selectedProgram || !rules) return;

    setIsSimulating(true);
    try {
      const result = await simulateEligibility(selectedProgram, rules);
      // Apply budget multiplier
      result.totalBudgetNeeded *= budgetMultiplier;
      result.averagePerFarmer *= budgetMultiplier;
      result.provinceDistribution = result.provinceDistribution.map(p => ({
        ...p,
        amount: p.amount * budgetMultiplier,
      }));
      setResults(result);
    } finally {
      setIsSimulating(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Simulador de Impacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Programa</label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um programa" />
                </SelectTrigger>
                <SelectContent>
                  {activePrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProgramData && (
                <p className="text-xs text-muted-foreground">
                  Orçamento base: {formatCurrency(selectedProgramData.budget_aoa || 0)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Multiplicador de Orçamento: {budgetMultiplier.toFixed(1)}x
              </label>
              <Slider
                value={[budgetMultiplier]}
                onValueChange={([value]) => setBudgetMultiplier(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Orçamento simulado: {formatCurrency((selectedProgramData?.budget_aoa || 0) * budgetMultiplier)}
              </p>
            </div>
          </div>

          {selectedProgram && rules && (
            <div>
              <label className="text-sm font-medium">Regras de Elegibilidade ({rules.length})</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {rules.map((rule) => (
                  <Badge key={rule.id} variant={rule.is_mandatory ? 'default' : 'outline'}>
                    {rule.rule_name}
                  </Badge>
                ))}
                {rules.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma regra definida - todos os agricultores serão elegíveis
                  </p>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={runSimulation} 
            disabled={!selectedProgram || isSimulating}
            className="w-full"
          >
            {isSimulating ? 'A Simular...' : 'Executar Simulação'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agricultores Elegíveis</p>
                  <p className="text-2xl font-bold">{results.eligibleFarmers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Coins className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento Necessário</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalBudgetNeeded)}</p>
                  <p className="text-xs text-muted-foreground">
                    Média: {formatCurrency(results.averagePerFarmer)}/beneficiário
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impacto Estimado</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {results.sectorImpact.map((impact) => (
                      <Badge key={impact.sector} variant="outline" className="text-xs">
                        {impact.sector}: +{impact.estimatedIncrease}%
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Province Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Distribuição por Província
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.provinceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={results.provinceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="province" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'count' ? `${value} beneficiários` : formatCurrency(value),
                        name === 'count' ? 'Beneficiários' : 'Valor'
                      ]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Beneficiários" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Sem dados de distribuição
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Fatores de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.riskFactors.map((factor) => (
                <div key={factor.factor} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {factor.level === 'low' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${getRiskColor(factor.level)}`} />
                    )}
                    <span className="text-sm">{factor.factor}</span>
                  </div>
                  <Badge 
                    variant={factor.level === 'low' ? 'outline' : factor.level === 'high' ? 'destructive' : 'secondary'}
                  >
                    {factor.level === 'low' ? 'Baixo' : factor.level === 'medium' ? 'Médio' : 'Alto'}
                  </Badge>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Viabilidade Geral</span>
                  <span className="font-medium">
                    {results.riskFactors.filter(f => f.level === 'high').length === 0 
                      ? 'Alta' 
                      : results.riskFactors.filter(f => f.level === 'high').length > 1 
                        ? 'Baixa' 
                        : 'Média'}
                  </span>
                </div>
                <Progress 
                  value={100 - (results.riskFactors.filter(f => f.level === 'high').length * 33)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!results && !selectedProgram && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um programa e execute a simulação</p>
            <p className="text-sm">para ver o impacto estimado antes da atribuição</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
