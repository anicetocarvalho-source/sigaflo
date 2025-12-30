import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

const productionData = [
  { province: 'Cuanza Sul', area: 45200, production: 124500, productivity: 2.75 },
  { province: 'Malanje', area: 32100, production: 89800, productivity: 2.80 },
  { province: 'Bié', area: 28500, production: 74100, productivity: 2.60 },
  { province: 'Huambo', area: 25800, production: 71540, productivity: 2.77 },
  { province: 'Benguela', area: 18900, production: 49140, productivity: 2.60 },
  { province: 'Huíla', area: 15400, production: 38500, productivity: 2.50 },
];

const importData = [
  { country: 'Tailândia', volume: 520000, percentage: 41.8, priceCIF: 485 },
  { country: 'Vietname', volume: 380000, percentage: 30.5, priceCIF: 452 },
  { country: 'Paquistão', volume: 180000, percentage: 14.5, priceCIF: 420 },
  { country: 'Índia', volume: 165000, percentage: 13.2, priceCIF: 445 },
];

const priceData = [
  { province: 'Luanda', retail: 850, wholesale: 720 },
  { province: 'Huambo', retail: 720, wholesale: 610 },
  { province: 'Benguela', retail: 780, wholesale: 660 },
  { province: 'Lubango', retail: 750, wholesale: 640 },
  { province: 'Malanje', retail: 690, wholesale: 580 },
];

export default function RiceDashboard() {
  return (
    <MainLayout
      title="Produção de Arroz"
      subtitle="Módulo Estratégico de Soberania Alimentar"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Dados actualizados há 2 horas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              2024
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="default" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Main KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Produção Nacional"
            value="892.450"
            subtitle="toneladas/ano"
            change={12.5}
            changeType="increase"
            icon={<Package className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Importações"
            value="1.245.000"
            subtitle="toneladas/ano"
            change={-8.2}
            changeType="decrease"
            icon={<ShoppingCart className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="Consumo Per Capita"
            value="38.5 kg"
            subtitle="pessoa/ano"
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Défice Alimentar"
            value="352.550"
            subtitle="toneladas (gap)"
            change={-15.3}
            changeType="increase"
            icon={<Target className="h-5 w-5" />}
            variant="accent"
          />
        </section>

        {/* AI Recommendations */}
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
                        style={{ width: `${(item.production / 130000) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.area.toLocaleString()} ha</span>
                      <span>{item.productivity} t/ha</span>
                    </div>
                  </div>
                ))}
              </div>
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
                        ${item.priceCIF}/t CIF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Variação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {priceData.map((item, index) => {
                  const margin = ((item.retail - item.wholesale) / item.wholesale * 100).toFixed(1);
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
                        {item.wholesale.toLocaleString()} AOA
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        +{margin}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm text-success">
                          <TrendingDown className="h-3 w-3" />
                          -2.3%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </MainLayout>
  );
}
