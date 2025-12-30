import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingDown, Wheat, DollarSign, Users } from 'lucide-react';

interface SimulationParams {
  productivityIncrease: number;
  areaExpansion: number;
  consumptionReduction: number;
}

interface SimulationResult {
  newProduction: number;
  newImports: number;
  importReduction: number;
  selfSufficiency: number;
  savingsUSD: number;
}

interface RiceSimulatorProps {
  currentProduction: number; // tonnes
  currentImports: number; // tonnes
  currentConsumption: number; // tonnes
  avgImportPrice: number; // USD per tonne
  currentArea: number; // hectares
  currentProductivity: number; // kg/ha
}

export const RiceSimulator = ({
  currentProduction = 50000,
  currentImports = 500000,
  currentConsumption = 550000,
  avgImportPrice = 450,
  currentArea = 15000,
  currentProductivity = 3333,
}: RiceSimulatorProps) => {
  const [params, setParams] = useState<SimulationParams>({
    productivityIncrease: 20,
    areaExpansion: 30,
    consumptionReduction: 5,
  });

  const calculateSimulation = (): SimulationResult => {
    const newProductivity = currentProductivity * (1 + params.productivityIncrease / 100);
    const newArea = currentArea * (1 + params.areaExpansion / 100);
    const newProduction = (newArea * newProductivity) / 1000; // tonnes
    
    const adjustedConsumption = currentConsumption * (1 - params.consumptionReduction / 100);
    const newImports = Math.max(0, adjustedConsumption - newProduction);
    const importReduction = ((currentImports - newImports) / currentImports) * 100;
    const selfSufficiency = (newProduction / adjustedConsumption) * 100;
    const savingsUSD = (currentImports - newImports) * avgImportPrice;

    return {
      newProduction: Math.round(newProduction),
      newImports: Math.round(newImports),
      importReduction: Math.round(importReduction * 10) / 10,
      selfSufficiency: Math.round(selfSufficiency * 10) / 10,
      savingsUSD: Math.round(savingsUSD),
    };
  };

  const result = calculateSimulation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-AO').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Simulador de Redução de Importações</CardTitle>
        </div>
        <CardDescription>
          Ajuste os parâmetros para simular cenários de aumento da produção nacional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Wheat className="h-4 w-4" />
                  Aumento de Produtividade
                </label>
                <Badge variant="secondary">{params.productivityIncrease}%</Badge>
              </div>
              <Slider
                value={[params.productivityIncrease]}
                onValueChange={([v]) => setParams(p => ({ ...p, productivityIncrease: v }))}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                De {formatNumber(currentProductivity)} para {formatNumber(Math.round(currentProductivity * (1 + params.productivityIncrease / 100)))} kg/ha
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 rotate-180" />
                  Expansão de Área Cultivada
                </label>
                <Badge variant="secondary">{params.areaExpansion}%</Badge>
              </div>
              <Slider
                value={[params.areaExpansion]}
                onValueChange={([v]) => setParams(p => ({ ...p, areaExpansion: v }))}
                max={200}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                De {formatNumber(currentArea)} para {formatNumber(Math.round(currentArea * (1 + params.areaExpansion / 100)))} hectares
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Redução do Consumo Per Capita
                </label>
                <Badge variant="secondary">{params.consumptionReduction}%</Badge>
              </div>
              <Slider
                value={[params.consumptionReduction]}
                onValueChange={([v]) => setParams(p => ({ ...p, consumptionReduction: v }))}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Consumo ajustado: {formatNumber(Math.round(currentConsumption * (1 - params.consumptionReduction / 100)))} toneladas
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setParams({ productivityIncrease: 20, areaExpansion: 30, consumptionReduction: 5 })}
              className="w-full"
            >
              Restaurar Valores Padrão
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Resultados da Simulação</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm text-muted-foreground">Nova Produção</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatNumber(result.newProduction)}
                </p>
                <p className="text-xs text-muted-foreground">toneladas/ano</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground">Novas Importações</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatNumber(result.newImports)}
                </p>
                <p className="text-xs text-muted-foreground">toneladas/ano</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-muted-foreground">Redução de Importações</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {result.importReduction}%
                </p>
                <p className="text-xs text-muted-foreground">vs. atual</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-muted-foreground">Autossuficiência</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {result.selfSufficiency}%
                </p>
                <p className="text-xs text-muted-foreground">produção/consumo</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="font-medium">Poupança Estimada em Divisas</p>
              </div>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(result.savingsUSD)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                por ano, com base no preço médio de {formatCurrency(avgImportPrice)}/tonelada
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
