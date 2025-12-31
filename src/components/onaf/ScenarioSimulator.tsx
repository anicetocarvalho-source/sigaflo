import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNationalStats, calculateScenario, type ScenarioResult } from '@/hooks/useONAF';
import {
  TrendingDown,
  CloudRain,
  Coins,
  Play,
  ArrowRight,
  TrendingUp,
  Minus,
  RefreshCw,
} from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

interface ResultCardProps {
  result: ScenarioResult;
}

function ResultCard({ result }: ResultCardProps) {
  return (
    <Card className={`border-l-4 ${
      result.impactType === 'positive' ? 'border-l-emerald-500' :
      result.impactType === 'negative' ? 'border-l-red-500' : 'border-l-blue-500'
    }`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{result.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
          </div>
          <Badge variant={
            result.impactType === 'positive' ? 'default' :
            result.impactType === 'negative' ? 'destructive' : 'secondary'
          }>
            {result.impactType === 'positive' ? <TrendingUp className="h-3 w-3 mr-1" /> :
             result.impactType === 'negative' ? <TrendingDown className="h-3 w-3 mr-1" /> :
             <Minus className="h-3 w-3 mr-1" />}
            {result.impact > 0 ? '+' : ''}{typeof result.impact === 'number' && result.impact < 1000 
              ? result.impact.toFixed(1) 
              : formatNumber(result.impact)}
            {result.name.includes('%') || result.name.includes('Retorno') ? '%' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Actual</p>
            <p className="font-semibold">{formatNumber(result.currentValue)}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-center p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground">Projectado</p>
            <p className="font-semibold">{formatNumber(result.projectedValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScenarioSimulator() {
  const { data: stats } = useNationalStats();
  const [activeScenario, setActiveScenario] = useState<'import_reduction' | 'climate_impact' | 'investment'>('import_reduction');
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Import reduction params
  const [importReduction, setImportReduction] = useState(20);
  const [importYears, setImportYears] = useState(5);

  // Climate impact params
  const [climateSeverity, setClimateSeverity] = useState(30);
  const [climateArea, setClimateArea] = useState(25);

  // Investment params
  const [investmentAmount, setInvestmentAmount] = useState(1000000000);
  const [investmentFocus, setInvestmentFocus] = useState(1);

  const runSimulation = () => {
    if (!stats) return;

    setIsSimulating(true);
    
    setTimeout(() => {
      let params: Record<string, number> = {};
      
      switch (activeScenario) {
        case 'import_reduction':
          params = { reduction: importReduction, years: importYears };
          break;
        case 'climate_impact':
          params = { severity: climateSeverity, area: climateArea };
          break;
        case 'investment':
          params = { investment: investmentAmount, focus: investmentFocus };
          break;
      }

      const scenarioResults = calculateScenario(activeScenario, params, stats);
      setResults(scenarioResults);
      setIsSimulating(false);
    }, 1000);
  };

  const resetSimulation = () => {
    setResults([]);
    setImportReduction(20);
    setImportYears(5);
    setClimateSeverity(30);
    setClimateArea(25);
    setInvestmentAmount(1000000000);
    setInvestmentFocus(1);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeScenario} onValueChange={(v) => {
        setActiveScenario(v as typeof activeScenario);
        setResults([]);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import_reduction" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Redução Importações</span>
          </TabsTrigger>
          <TabsTrigger value="climate_impact" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            <span className="hidden sm:inline">Impacto Climático</span>
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Investimento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import_reduction">
          <Card>
            <CardHeader>
              <CardTitle>Cenário: Redução de Importações de Arroz</CardTitle>
              <CardDescription>
                Simule o impacto da substituição gradual de importações por produção nacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Meta de Redução</Label>
                    <span className="text-sm font-medium">{importReduction}%</span>
                  </div>
                  <Slider
                    value={[importReduction]}
                    onValueChange={([v]) => setImportReduction(v)}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Prazo (anos)</Label>
                    <span className="text-sm font-medium">{importYears} anos</span>
                  </div>
                  <Slider
                    value={[importYears]}
                    onValueChange={([v]) => setImportYears(v)}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="climate_impact">
          <Card>
            <CardHeader>
              <CardTitle>Cenário: Impacto de Alterações Climáticas</CardTitle>
              <CardDescription>
                Simule o efeito do agravamento de eventos climáticos extremos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Aumento da Severidade</Label>
                    <span className="text-sm font-medium">+{climateSeverity}%</span>
                  </div>
                  <Slider
                    value={[climateSeverity]}
                    onValueChange={([v]) => setClimateSeverity(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Aumento da Área Afectada</Label>
                    <span className="text-sm font-medium">+{climateArea}%</span>
                  </div>
                  <Slider
                    value={[climateArea]}
                    onValueChange={([v]) => setClimateArea(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>Cenário: Investimento Estratégico</CardTitle>
              <CardDescription>
                Simule o retorno de diferentes níveis e áreas de investimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Valor do Investimento (AOA)</Label>
                  <Input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Área de Foco</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 1, label: 'Agricultura', icon: '🌾' },
                      { value: 2, label: 'Florestas', icon: '🌲' },
                      { value: 3, label: 'Infraestrutura', icon: '🏗️' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={investmentFocus === option.value ? 'default' : 'outline'}
                        className="h-auto py-3 flex flex-col gap-1"
                        onClick={() => setInvestmentFocus(option.value)}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={runSimulation} disabled={isSimulating || !stats} className="flex-1">
          {isSimulating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              A simular...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Executar Simulação
            </>
          )}
        </Button>
        {results.length > 0 && (
          <Button variant="outline" onClick={resetSimulation}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Resultados da Simulação</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {results.map((result, index) => (
              <ResultCard key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
