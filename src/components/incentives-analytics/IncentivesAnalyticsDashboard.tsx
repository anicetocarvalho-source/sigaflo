import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Filter,
  FileDown,
  Calendar,
  Building2
} from 'lucide-react';
import { 
  useIncentivesFinancialKPIs,
  useImpactComparisonData,
  useProvinceSubsidyDistribution,
  useProgramRankings,
  useIncentivesSmartAlerts
} from '@/hooks/useIncentivesAnalytics';
import { useProvinces } from '@/hooks/useFarmers';
import { IncentivesKPICards } from './IncentivesKPICards';
import { ImpactComparisonCharts } from './ImpactComparisonCharts';
import { SubsidyDistributionMap } from './SubsidyDistributionMap';
import { ProgramRankings } from './ProgramRankings';
import { IncentivesSmartAlerts } from './IncentivesSmartAlerts';
import { toast } from 'sonner';

export function IncentivesAnalyticsDashboard() {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const { data: provinces } = useProvinces();
  const { data: kpiData, isLoading: kpiLoading } = useIncentivesFinancialKPIs();
  const { data: comparisonData, isLoading: comparisonLoading } = useImpactComparisonData();
  const { data: distributionData, isLoading: distributionLoading } = useProvinceSubsidyDistribution();
  const { data: rankingsData, isLoading: rankingsLoading } = useProgramRankings();
  const { data: alertsData, isLoading: alertsLoading } = useIncentivesSmartAlerts();

  const handleExportReport = () => {
    toast.info('A gerar relatório para Banco Mundial...', {
      description: 'Esta funcionalidade será implementada com exportação PDF'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gestão Inteligente de Incentivos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Avaliação de impacto e orientação orçamental
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Building2 className="h-3 w-3" />
                MINAGRIP / Finanças / UIP
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Sector
                </label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os sectores</SelectItem>
                    <SelectItem value="agriculture">Agricultura</SelectItem>
                    <SelectItem value="forestry">Florestal</SelectItem>
                    <SelectItem value="coffee">Café</SelectItem>
                    <SelectItem value="rice">Arroz</SelectItem>
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
              Exportar Relatório BM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial KPIs */}
      <IncentivesKPICards data={kpiData} isLoading={kpiLoading} />

      {/* Impact Comparison Charts */}
      <ImpactComparisonCharts data={comparisonData} isLoading={comparisonLoading} />

      {/* Map and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubsidyDistributionMap data={distributionData} isLoading={distributionLoading} />
        </div>
        <div>
          <IncentivesSmartAlerts data={alertsData} isLoading={alertsLoading} />
        </div>
      </div>

      {/* Program Rankings */}
      <ProgramRankings data={rankingsData} isLoading={rankingsLoading} />
    </div>
  );
}
