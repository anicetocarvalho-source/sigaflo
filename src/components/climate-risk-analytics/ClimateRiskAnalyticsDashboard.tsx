import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter,
  FileDown,
} from 'lucide-react';
import { 
  useClimateRiskKPIs,
  useClimateRiskMapData,
  useEventFrequencyData,
  useClimateProductionImpact,
  useClimateScenarioSimulations,
  useClimateSmartAlerts
} from '@/hooks/useClimateRiskAnalytics';
import { useProvinces } from '@/hooks/useFarmers';
import { ClimateRiskKPICards } from './ClimateRiskKPICards';
import { RiskLayerMap } from './RiskLayerMap';
import { ClimateCharts } from './ClimateCharts';
import { ScenarioSimulations } from './ScenarioSimulations';
import { ClimateSmartAlerts } from './ClimateSmartAlerts';
import { toast } from 'sonner';

export function ClimateRiskAnalyticsDashboard() {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const { data: provinces } = useProvinces();
  const { data: kpiData, isLoading: kpiLoading } = useClimateRiskKPIs({
    cropType: cropFilter !== 'all' ? cropFilter : undefined,
    provinceId: provinceFilter !== 'all' ? provinceFilter : undefined
  });
  const { data: mapData, isLoading: mapLoading } = useClimateRiskMapData();
  const { data: frequencyData, isLoading: frequencyLoading } = useEventFrequencyData();
  const { data: correlationData, isLoading: correlationLoading } = useClimateProductionImpact();
  const { data: scenarioData, isLoading: scenarioLoading } = useClimateScenarioSimulations();
  const { data: alertsData, isLoading: alertsLoading } = useClimateSmartAlerts();

  const crops = ['Milho', 'Arroz', 'Feijão', 'Mandioca', 'Banana', 'Café', 'Soja', 'Batata'];

  const handleExportReport = () => {
    toast.info('A gerar relatório de risco climático...', {
      description: 'Esta funcionalidade será implementada com exportação PDF'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  <Filter className="h-3 w-3 inline mr-1" />
                  Período
                </label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo o período</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="last-12">Últimos 12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Cultura
                </label>
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as culturas</SelectItem>
                    {crops.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Província
                </label>
                <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Província" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as províncias</SelectItem>
                    {provinces?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleExportReport} className="shrink-0">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <ClimateRiskKPICards data={kpiData} isLoading={kpiLoading} />

      {/* Map and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskLayerMap data={mapData} isLoading={mapLoading} />
        </div>
        <div>
          <ClimateSmartAlerts data={alertsData} isLoading={alertsLoading} />
        </div>
      </div>

      {/* Charts */}
      <ClimateCharts 
        frequencyData={frequencyData} 
        correlationData={correlationData}
        isLoading={frequencyLoading || correlationLoading} 
      />

      {/* Scenario Simulations */}
      <ScenarioSimulations data={scenarioData} isLoading={scenarioLoading} />
    </div>
  );
}
