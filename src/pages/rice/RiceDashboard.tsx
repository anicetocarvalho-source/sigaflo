import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RiceProductionForm,
  RiceImportForm,
  RicePriceForm,
} from '@/components/rice/forms';
import {
  useRiceProduction,
  useRiceImports,
  useRicePrices,
  useRiceConsumption,
} from '@/hooks/useRice';
import {
  Package,
  ShoppingCart,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Leaf,
  Plus,
  Loader2,
} from 'lucide-react';

export default function RiceDashboard() {
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);

  const { data: production, isLoading: loadingProduction } = useRiceProduction();
  const { data: imports, isLoading: loadingImports } = useRiceImports();
  const { data: prices, isLoading: loadingPrices } = useRicePrices();
  const { data: consumption } = useRiceConsumption();

  const isLoading = loadingProduction || loadingImports || loadingPrices;

  // Calculate totals from real data
  const totalProduction = production?.reduce((sum, p) => sum + Number(p.production_tonnes), 0) || 0;
  const totalImports = imports?.reduce((sum, i) => sum + Number(i.volume_tonnes), 0) || 0;
  const latestConsumption = consumption?.[0];
  const perCapita = latestConsumption?.per_capita_kg || 38.5;
  const totalConsumptionTonnes = latestConsumption?.total_consumption_tonnes || 0;
  const gap = totalConsumptionTonnes > 0 ? Math.max(0, totalConsumptionTonnes - totalProduction) : 0;

  // Aggregate production by province
  const productionByProvince = production?.reduce((acc: Record<string, any>, p) => {
    const provinceName = p.provinces?.name || 'Não definida';
    if (!acc[provinceName]) {
      acc[provinceName] = { area: 0, production: 0, productivity: 0, count: 0 };
    }
    acc[provinceName].area += Number(p.cultivated_area_ha);
    acc[provinceName].production += Number(p.production_tonnes);
    acc[provinceName].count++;
    return acc;
  }, {});

  const productionData = Object.entries(productionByProvince || {})
    .map(([province, data]: [string, any]) => ({
      province,
      area: data.area,
      production: data.production,
      productivity: data.area > 0 ? (data.production / data.area).toFixed(2) : 0,
    }))
    .sort((a, b) => b.production - a.production)
    .slice(0, 6);

  // Aggregate imports by country
  const importsByCountry = imports?.reduce((acc: Record<string, any>, i) => {
    if (!acc[i.origin_country]) {
      acc[i.origin_country] = { volume: 0, totalCIF: 0, count: 0 };
    }
    acc[i.origin_country].volume += Number(i.volume_tonnes);
    if (i.price_cif_usd) {
      acc[i.origin_country].totalCIF += Number(i.price_cif_usd) * Number(i.volume_tonnes);
    }
    acc[i.origin_country].count++;
    return acc;
  }, {});

  const totalImportVolume = Object.values(importsByCountry || {}).reduce(
    (sum: number, d: any) => sum + d.volume, 0
  );

  const importData = Object.entries(importsByCountry || {})
    .map(([country, data]: [string, any]) => ({
      country,
      volume: data.volume,
      percentage: totalImportVolume > 0 ? ((data.volume / totalImportVolume) * 100).toFixed(1) : 0,
      priceCIF: data.count > 0 && data.totalCIF > 0 ? Math.round(data.totalCIF / data.volume) : 0,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4);

  // Aggregate prices by province
  const latestPricesByProvince = prices?.reduce((acc: Record<string, any>, p) => {
    const provinceName = p.provinces?.name || 'Não definida';
    if (!acc[provinceName] || new Date(p.recorded_date) > new Date(acc[provinceName].date)) {
      acc[provinceName] = {
        retail: Number(p.retail_price_aoa),
        wholesale: Number(p.wholesale_price_aoa) || 0,
        date: p.recorded_date,
      };
    }
    return acc;
  }, {});

  const priceData = Object.entries(latestPricesByProvince || {})
    .map(([province, data]: [string, any]) => ({
      province,
      retail: data.retail,
      wholesale: data.wholesale,
    }))
    .sort((a, b) => b.retail - a.retail)
    .slice(0, 5);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return num.toLocaleString('pt-AO');
    return num.toString();
  };

  return (
    <MainLayout
      title="Produção de Arroz"
      subtitle="Módulo Estratégico de Soberania Alimentar"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar dados...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Dados actualizados
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dados
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowProductionForm(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  Registar Produção
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowImportForm(true)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Registar Importação
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPriceForm(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Registar Preço
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              2024
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Main KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Produção Nacional"
            value={formatNumber(totalProduction)}
            subtitle="toneladas/ano"
            change={12.5}
            changeType="increase"
            icon={<Package className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Importações"
            value={formatNumber(totalImports)}
            subtitle="toneladas/ano"
            change={-8.2}
            changeType="decrease"
            icon={<ShoppingCart className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="Consumo Per Capita"
            value={`${perCapita.toFixed(1)} kg`}
            subtitle="pessoa/ano"
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Défice Alimentar"
            value={formatNumber(gap)}
            subtitle="toneladas (gap)"
            change={-15.3}
            changeType="increase"
            icon={<Target className="h-5 w-5" />}
            variant="accent"
          />
        </section>
        <section className="card-elevated border-l-4 border-l-accent p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Recomendações de Inteligência Analítica
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Expandir Área Cultivada
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aumentar 15% na Cuanza Sul e Malanje para reduzir importações
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Risco de Seca
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prever irrigação adicional no Huambo para Q2 2025
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Leaf className="h-4 w-4 text-primary" />
                    Variedades Melhoradas
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Introduzir NERICA-4 pode aumentar produtividade em 25%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Production by Province */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card-elevated">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">
                  Produção por Província
                </h3>
              </div>
              <span className="text-sm text-muted-foreground">2024</span>
            </div>
            <div className="p-4">
              {productionData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sem dados de produção registados
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowProductionForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produção
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {productionData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.province}</span>
                        <span className="text-muted-foreground">
                          {item.production.toLocaleString()} t
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                          style={{ width: `${Math.min((item.production / (productionData[0]?.production || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.area.toLocaleString()} ha</span>
                        <span>{item.productivity} t/ha</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Imports by Origin */}
          <div className="card-elevated">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-warning" />
                <h3 className="font-display font-semibold text-foreground">
                  Importações por Origem
                </h3>
              </div>
              <span className="text-sm text-muted-foreground">2024</span>
            </div>
            <div className="p-4">
              {importData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sem dados de importação registados
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowImportForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Importação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {importData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-sm font-bold text-warning">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.country}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.volume.toLocaleString()} toneladas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{item.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {item.priceCIF > 0 ? `$${item.priceCIF}/t CIF` : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Prices by Province */}
        <section className="card-elevated">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-display font-semibold text-foreground">
                Preços por Província (AOA/kg)
              </h3>
            </div>
            <span className="text-sm text-muted-foreground">Dezembro 2024</span>
          </div>
          {priceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Sem dados de preços registados
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowPriceForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Preço
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Província
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      Retalho
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      Atacado
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      Margem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {priceData.map((item, index) => {
                    const margin = item.wholesale > 0
                      ? ((item.retail - item.wholesale) / item.wholesale * 100).toFixed(1)
                      : '—';
                    const isHighest = item.retail === Math.max(...priceData.map(p => p.retail));
                    
                    return (
                      <tr key={index} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {item.province}
                          {isHighest && (
                            <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                              Mais alto
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {item.retail.toLocaleString()} AOA
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {item.wholesale > 0 ? `${item.wholesale.toLocaleString()} AOA` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {margin !== '—' ? `+${margin}%` : margin}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Policy Impact */}
        <section className="card-elevated">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-display font-semibold text-foreground">
              Impacto de Políticas Governamentais
            </h3>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm font-medium text-foreground">
                  Subsídio de Sementes
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">+18.5%</p>
              <p className="text-xs text-muted-foreground">
                Aumento de produtividade em áreas beneficiadas
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm font-medium text-foreground">
                  Programa de Irrigação
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">45.000 ha</p>
              <p className="text-xs text-muted-foreground">
                Área irrigada em expansão
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-info" />
                <span className="text-sm font-medium text-foreground">
                  Crédito Agrícola
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">$12.5M</p>
              <p className="text-xs text-muted-foreground">
                Desembolsado para produtores de arroz
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Forms */}
      <RiceProductionForm
        open={showProductionForm}
        onOpenChange={setShowProductionForm}
      />
      <RiceImportForm
        open={showImportForm}
        onOpenChange={setShowImportForm}
      />
      <RicePriceForm
        open={showPriceForm}
        onOpenChange={setShowPriceForm}
      />
    </MainLayout>
  );
}
