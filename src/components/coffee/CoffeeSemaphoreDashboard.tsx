import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  List,
  BarChart3,
  Download,
  RefreshCcw,
  Coffee,
  HelpCircle,
} from 'lucide-react';
import { useCoffeeLots, CoffeeLot } from '@/hooks/useCoffee';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CoffeeSemaphoreKPIs, getSemaphoreStatus } from './CoffeeSemaphoreKPIs';
import { CoffeeSemaphoreList } from './CoffeeSemaphoreList';
import { CoffeeSemaphoreCharts } from './CoffeeSemaphoreCharts';
import { CoffeeLotDetail } from './CoffeeLotDetail';
import { CoffeeLotForm } from './CoffeeLotForm';

export function CoffeeSemaphoreDashboard() {
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedLot, setSelectedLot] = useState<CoffeeLot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<CoffeeLot | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: lots, isLoading } = useCoffeeLots();

  const handleSelectLot = (lot: CoffeeLot) => {
    setSelectedLot(lot);
    setDetailOpen(true);
  };

  const handleEditLot = (lot: CoffeeLot) => {
    setEditingLot(lot);
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['coffee-lots'] });
  };

  const handleExportCSV = () => {
    if (!lots?.length) return;

    const headers = ['Código', 'Sinal', 'Qualidade', 'Volume (kg)', 'Exportador', 'Destino', 'Conformidade'];
    const rows = lots.map(lot => {
      const semaphore = getSemaphoreStatus(lot);
      const semaphoreLabel = { green: 'Verde', yellow: 'Amarelo', red: 'Vermelho', unclassified: 'Por Classificar' };
      
      let conformity = 0;
      if (lot.quality_grade) conformity++;
      if (lot.exporter_name) conformity++;
      if (lot.destination_country) conformity++;
      if (lot.transport_document_number) conformity++;
      if (lot.export_declaration_number) conformity++;

      return [
        lot.lot_code,
        semaphoreLabel[semaphore],
        lot.quality_grade || '-',
        lot.volume_kg,
        lot.exporter_name || '-',
        lot.destination_country || '-',
        `${conformity}/5`,
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `semaforizacao-cafe-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <CoffeeSemaphoreKPIs lots={lots || []} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="lista" className="gap-2">
              <List className="h-4 w-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setHelpOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Como Funciona
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value="lista" className="mt-4">
          {lots && lots.length > 0 ? (
            <CoffeeSemaphoreList
              lots={lots}
              onSelectLot={handleSelectLot}
              onEditLot={handleEditLot}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Coffee className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">Sem lotes para classificar</p>
                <p className="text-sm text-muted-foreground">
                  Adicione lotes de café para visualizar a semaforização
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          {lots && lots.length > 0 ? (
            <CoffeeSemaphoreCharts lots={lots} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">Sem dados para análise</p>
                <p className="text-sm text-muted-foreground">
                  Adicione lotes de café para ver estatísticas de semaforização
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🚦 Sistema de Semaforização
            </DialogTitle>
            <DialogDescription>
              Como funciona a classificação de lotes de café
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500">
              <div className="shrink-0">🟢</div>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">Sinal Verde</p>
                <p className="text-sm text-muted-foreground">
                  Lote aprovado para exportação. Possui qualidade Premium/Especialidade, 
                  exportador definido, destino confirmado e documentação completa.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
              <div className="shrink-0">🟡</div>
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Sinal Amarelo</p>
                <p className="text-sm text-muted-foreground">
                  Lote com qualidade classificada mas documentação incompleta. 
                  Requer atenção para completar informações de exportação.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
              <div className="shrink-0">🔴</div>
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Sinal Vermelho</p>
                <p className="text-sm text-muted-foreground">
                  Lote com qualidade inferior ou informações críticas em falta. 
                  Não está pronto para exportação.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20 border-l-4 border-slate-400">
              <div className="shrink-0">⚪</div>
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-400">Por Classificar</p>
                <p className="text-sm text-muted-foreground">
                  Lote sem classificação de qualidade. Aguarda avaliação para 
                  determinar o sinal apropriado.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Critérios de Conformidade:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Classificação de qualidade (SCA score)</li>
                <li>• Exportador atribuído</li>
                <li>• País de destino definido</li>
                <li>• Documento de transporte</li>
                <li>• Declaração de exportação</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <CoffeeLotDetail
        lot={selectedLot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditLot}
      />

      {/* Edit Form */}
      <CoffeeLotForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lot={editingLot}
      />
    </div>
  );
}
