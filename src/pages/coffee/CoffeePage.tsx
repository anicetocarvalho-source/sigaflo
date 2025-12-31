import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { CoffeeProductionForm } from '@/components/coffee/CoffeeProductionForm';
import {
  Coffee,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  QrCode,
  Download,
  Eye,
  Truck,
  Plus,
} from 'lucide-react';

const coffeeLots = [
  {
    id: 'CF-2024-0892',
    producer: 'Cooperativa Cafeícola do Uíge',
    variety: 'Robusta',
    weight: 1250,
    harvestDate: '2024-09-15',
    grade: 'Grau A',
    semaphore: 'green',
    exportReady: true,
  },
  {
    id: 'CF-2024-0891',
    producer: 'Fazenda Alto Cuanza',
    variety: 'Arábica',
    weight: 850,
    harvestDate: '2024-10-02',
    grade: 'Especial',
    semaphore: 'green',
    exportReady: true,
  },
  {
    id: 'CF-2024-0890',
    producer: 'Associação de Produtores de Gabela',
    variety: 'Robusta',
    weight: 2100,
    harvestDate: '2024-08-28',
    grade: 'Grau B',
    semaphore: 'yellow',
    exportReady: false,
  },
  {
    id: 'CF-2024-0889',
    producer: 'Quinta São João',
    variety: 'Arábica',
    weight: 480,
    harvestDate: '2024-11-10',
    grade: 'Em análise',
    semaphore: 'yellow',
    exportReady: false,
  },
  {
    id: 'CF-2024-0888',
    producer: 'Cooperativa Libolo',
    variety: 'Robusta',
    weight: 1800,
    harvestDate: '2024-07-20',
    grade: 'Rejeitado',
    semaphore: 'red',
    exportReady: false,
  },
];

const semaphoreConfig = {
  green: {
    label: 'Aprovado',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  yellow: {
    label: 'Em Análise',
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  red: {
    label: 'Rejeitado',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
};

export default function CoffeePage() {
  const [showProductionForm, setShowProductionForm] = useState(false);
  const greenCount = coffeeLots.filter((l) => l.semaphore === 'green').length;
  const yellowCount = coffeeLots.filter((l) => l.semaphore === 'yellow').length;
  const redCount = coffeeLots.filter((l) => l.semaphore === 'red').length;

  return (
    <MainLayout
      title="Cadeia do Café"
      subtitle="Sistema de rastreio e semaforização INCA"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Lotes em Rastreio"
            value="12.340"
            subtitle="Total activo"
            change={15.8}
            changeType="increase"
            icon={<Coffee className="h-5 w-5" />}
            variant="primary"
          />
          <KPICard
            title="Prontos para Exportação"
            value="8.920"
            subtitle="Semáforo verde"
            change={12.3}
            changeType="increase"
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Em Análise"
            value="2.840"
            subtitle="Semáforo amarelo"
            icon={<AlertCircle className="h-5 w-5" />}
            variant="warning"
          />
          <KPICard
            title="Volume Total"
            value="45.6K"
            subtitle="toneladas"
            change={8.5}
            changeType="increase"
            icon={<Package className="h-5 w-5" />}
            variant="accent"
          />
        </section>

        {/* Semaphore Summary */}
        <section className="card-elevated p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Sistema de Semaforização (SdS)
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Classificação automática de lotes baseada em critérios de qualidade
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{greenCount}</p>
                <p className="text-sm text-muted-foreground">Aprovados para exportação</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{yellowCount}</p>
                <p className="text-sm text-muted-foreground">Aguardando análise</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{redCount}</p>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowProductionForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registar Produção
            </Button>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Pesquisar Lote
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="mr-2 h-4 w-4" />
              Verificar QR Code
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <CoffeeProductionForm open={showProductionForm} onOpenChange={setShowProductionForm} />

        {/* Lots Table */}
        <div className="card-elevated overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h3 className="font-display font-semibold text-foreground">Lotes de Café</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Código do Lote
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Produtor
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Variedade
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Peso (kg)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Grau
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Semáforo
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Exportável
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coffeeLots.map((lot) => {
                  const semaphore = semaphoreConfig[lot.semaphore as keyof typeof semaphoreConfig];
                  const SemaphoreIcon = semaphore.icon;

                  return (
                    <tr key={lot.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono font-medium text-foreground">{lot.id}</p>
                          <p className="text-xs text-muted-foreground">
                            Colheita: {new Date(lot.harvestDate).toLocaleDateString('pt-AO')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{lot.producer}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {lot.variety}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {lot.weight.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{lot.grade}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${semaphore.bg}`}>
                            <SemaphoreIcon className={`h-4 w-4 ${semaphore.color}`} />
                            <span className={`text-xs font-medium ${semaphore.color}`}>
                              {semaphore.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lot.exportReady ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <Truck className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Public Verification */}
        <section className="card-elevated overflow-hidden">
          <div className="gradient-primary p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
                <QrCode className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-primary-foreground">
                  Portal Público de Verificação
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Qualquer pessoa pode verificar a autenticidade de um lote de café angolano
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  placeholder="Ex: CF-2024-0892"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button className="sm:mt-6">
                <Search className="mr-2 h-4 w-4" />
                Verificar
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
