import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Clock,
  Package,
  Truck,
  Ship,
  CheckCircle2,
  Bell,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Props {
  lots: CoffeeLot[];
  onSelectLot: (lot: CoffeeLot) => void;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  lot: CoffeeLot;
  icon: React.ElementType;
  priority: number;
}

export function CoffeeLotsAlerts({ lots, onSelectLot }: Props) {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    lots.forEach((lot) => {
      const createdDate = new Date(lot.created_at);
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      // Lots stuck in registered status for too long
      if (lot.status === 'registered' && daysSinceCreated > 7) {
        alerts.push({
          id: `registered-${lot.id}`,
          type: 'warning',
          title: 'Lote pendente há muito tempo',
          message: `Lote ${lot.lot_code} está registado há ${daysSinceCreated} dias sem processamento`,
          lot,
          icon: Clock,
          priority: 2,
        });
      }

      // Lots in transit for too long
      if (lot.status === 'in_transit' && lot.dispatched_at) {
        const dispatchedDate = new Date(lot.dispatched_at);
        const daysSinceDispatch = Math.floor((Date.now() - dispatchedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceDispatch > 14) {
          alerts.push({
            id: `transit-${lot.id}`,
            type: 'warning',
            title: 'Lote em trânsito prolongado',
            message: `Lote ${lot.lot_code} está em trânsito há ${daysSinceDispatch} dias`,
            lot,
            icon: Truck,
            priority: 1,
          });
        }
      }

      // Lots without exporter assigned
      if ((lot.status === 'registered' || lot.status === 'in_processing') && !lot.exporter_name) {
        alerts.push({
          id: `no-exporter-${lot.id}`,
          type: 'info',
          title: 'Exportador não atribuído',
          message: `Lote ${lot.lot_code} ainda não tem exportador definido`,
          lot,
          icon: Ship,
          priority: 3,
        });
      }

      // Large volume lots ready for export
      if (lot.status === 'in_processing' && lot.volume_kg > 5000) {
        alerts.push({
          id: `ready-${lot.id}`,
          type: 'success',
          title: 'Lote grande pronto',
          message: `Lote ${lot.lot_code} com ${(lot.volume_kg / 1000).toFixed(1)}t pronto para expedição`,
          lot,
          icon: Package,
          priority: 4,
        });
      }

      // Recently exported (celebration)
      if (lot.status === 'exported' && lot.exported_at) {
        const exportedDate = new Date(lot.exported_at);
        const daysSinceExport = Math.floor((Date.now() - exportedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceExport <= 3) {
          alerts.push({
            id: `exported-${lot.id}`,
            type: 'success',
            title: 'Exportação concluída',
            message: `Lote ${lot.lot_code} exportado para ${lot.destination_country || 'destino'}`,
            lot,
            icon: CheckCircle2,
            priority: 5,
          });
        }
      }

      // Missing quality grade
      if (!lot.quality_grade && lot.volume_kg > 1000) {
        alerts.push({
          id: `quality-${lot.id}`,
          type: 'info',
          title: 'Classificação pendente',
          message: `Lote ${lot.lot_code} necessita classificação de qualidade`,
          lot,
          icon: AlertTriangle,
          priority: 3,
        });
      }
    });

    // Sort by priority
    return alerts.sort((a, b) => a.priority - b.priority);
  };

  const alerts = generateAlerts();

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      case 'success':
        return 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
    }
  };

  const getIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      case 'success':
        return 'text-emerald-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const getBadgeVariant = (type: Alert['type']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600" />
            Alertas e Notificações
          </CardTitle>
          <Badge variant="outline">{alerts.length} alertas</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="font-medium">Tudo em ordem!</p>
            <p className="text-sm text-muted-foreground">
              Não há alertas pendentes no momento
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const AlertIcon = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:opacity-80 ${getAlertStyles(alert.type)}`}
                    onClick={() => onSelectLot(alert.lot)}
                  >
                    <div className="flex items-start gap-3">
                      <AlertIcon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{alert.title}</p>
                          <Badge variant={getBadgeVariant(alert.type)} className="text-xs shrink-0">
                            {alert.lot.lot_code}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.lot.created_at), { addSuffix: true, locale: pt })}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
