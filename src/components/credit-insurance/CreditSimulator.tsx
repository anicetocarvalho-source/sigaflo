import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  CloudRain,
  Sun,
  Download,
  QrCode
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useCreateCreditSimulation, useCreditSimulations } from '@/hooks/useCreditInsurance';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export function CreditSimulator() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [expectedRevenue, setExpectedRevenue] = useState<string>('');
  const [productionCosts, setProductionCosts] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const { data: farmers } = useFarmers();
  const { data: allSimulations } = useCreditSimulations();
  const createSimulation = useCreateCreditSimulation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSimulate = async (scenario: 'normal' | 'adverse' | 'optimistic') => {
    if (!selectedFarmerId || !expectedRevenue || !productionCosts) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const result = await createSimulation.mutateAsync({
        farmerId: selectedFarmerId,
        scenarioType: scenario,
        expectedRevenue: parseFloat(expectedRevenue),
        productionCosts: parseFloat(productionCosts)
      });
      setSimulationResult(result);
      toast.success('Simulação calculada com sucesso');
    } catch (e) {
      toast.error('Erro ao calcular simulação');
    }
  };

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'optimistic':
        return <Sun className="h-5 w-5 text-green-500" />;
      case 'adverse':
        return <CloudRain className="h-5 w-5 text-red-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
    }
  };

  const getScenarioLabel = (scenario: string) => {
    switch (scenario) {
      case 'optimistic':
        return 'Optimista (+20%)';
      case 'adverse':
        return 'Adverso (-30%)';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Capacidade de Crédito</CardTitle>
          <CardDescription>
            Calcule a capacidade de crédito com base na receita esperada e custos de produção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Agricultor</Label>
                <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label>Receita Anual Esperada (AOA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custos Médios de Produção (AOA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={productionCosts}
                  onChange={(e) => setProductionCosts(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Cenários de Simulação</Label>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={() => handleSimulate('normal')}
                  disabled={createSimulation.isPending}
                >
                  <TrendingUp className="h-5 w-5 mr-3 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Cenário Normal</p>
                    <p className="text-xs text-muted-foreground">Condições típicas de produção</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={() => handleSimulate('adverse')}
                  disabled={createSimulation.isPending}
                >
                  <CloudRain className="h-5 w-5 mr-3 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium">Cenário Adverso</p>
                    <p className="text-xs text-muted-foreground">Receita reduzida em 30%</p>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={() => handleSimulate('optimistic')}
                  disabled={createSimulation.isPending}
                >
                  <Sun className="h-5 w-5 mr-3 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Cenário Optimista</p>
                    <p className="text-xs text-muted-foreground">Receita aumentada em 20%</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Result */}
      {simulationResult && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getScenarioIcon(simulationResult.scenario_type)}
                <div>
                  <CardTitle>Resultado da Simulação</CardTitle>
                  <CardDescription>{getScenarioLabel(simulationResult.scenario_type)}</CardDescription>
                </div>
              </div>
              <Badge variant="outline">{simulationResult.simulation_date}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Análise Financeira</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Receita Anual</span>
                    <span className="font-medium">{formatCurrency(simulationResult.expected_annual_revenue_aoa)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custos Produção</span>
                    <span className="font-medium text-red-600">-{formatCurrency(simulationResult.average_production_costs_aoa)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Margem Líquida</span>
                    <span className={`font-bold ${simulationResult.estimated_net_margin_aoa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(simulationResult.estimated_net_margin_aoa)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    ({simulationResult.margin_percentage.toFixed(1)}% margem)
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Capacidade de Crédito</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Prestação Máxima/Mês</span>
                    <span className="font-medium">{formatCurrency(simulationResult.max_monthly_payment_aoa)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Crédito Máximo</span>
                    <span className="font-medium">{formatCurrency(simulationResult.max_credit_amount_aoa)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Crédito Recomendado</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(simulationResult.recommended_credit_amount_aoa)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Condições</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Prazo Recomendado</span>
                    <span className="font-medium">{simulationResult.recommended_term_months} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa Estimada</span>
                    <span className="font-medium">{simulationResult.estimated_interest_rate}% a.a.</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <QRCodeSVG 
                    value={simulationResult.verification_url || simulationResult.qr_code_data} 
                    size={80}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Simulations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Simulações</CardTitle>
        </CardHeader>
        <CardContent>
          {allSimulations && allSimulations.length > 0 ? (
            <div className="space-y-3">
              {allSimulations.slice(0, 10).map((sim) => (
                <div key={sim.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getScenarioIcon(sim.scenario_type)}
                    <div>
                      <p className="text-sm font-medium">{getScenarioLabel(sim.scenario_type)}</p>
                      <p className="text-xs text-muted-foreground">{sim.simulation_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(sim.recommended_credit_amount_aoa)}</p>
                    <p className="text-xs text-muted-foreground">Recomendado</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma simulação realizada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
