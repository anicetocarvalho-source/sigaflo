import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, FileWarning, Truck, TreePine, Eye } from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ForestTree, ForestLog, ForestTransportPermit } from '@/hooks/useForestry';

interface TraceabilityAlertsProps {
  trees: ForestTree[];
  logs: ForestLog[];
  transports: ForestTransportPermit[];
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

export function TraceabilityAlerts({ trees, logs, transports }: TraceabilityAlertsProps) {
  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const now = new Date();

    // Check for expired transport permits
    transports.forEach(transport => {
      const validUntil = new Date(transport.valid_until);
      
      if (transport.status !== 'completed' && transport.status !== 'cancelled') {
        if (isAfter(now, validUntil)) {
          result.push({
            id: `expired-${transport.id}`,
            type: 'critical',
            title: `Guia ${transport.permit_number} Expirada`,
            description: `Expirou em ${format(validUntil, "dd/MM/yyyy", { locale: pt })}`,
            category: 'Transporte',
            icon: <FileWarning className="h-4 w-4" />,
          });
        } else {
          const daysUntil = differenceInDays(validUntil, now);
          if (daysUntil <= 3) {
            result.push({
              id: `expiring-${transport.id}`,
              type: 'warning',
              title: `Guia ${transport.permit_number} A Expirar`,
              description: `Expira em ${daysUntil} dia(s)`,
              category: 'Transporte',
              icon: <Clock className="h-4 w-4" />,
            });
          }
        }
      }
    });

    // Check for transports in transit for too long (>7 days)
    transports.forEach(transport => {
      if (transport.status === 'in_transit' && transport.departure_at) {
        const departure = new Date(transport.departure_at);
        const daysInTransit = differenceInDays(now, departure);
        if (daysInTransit > 7) {
          result.push({
            id: `long-transit-${transport.id}`,
            type: 'warning',
            title: `Transporte ${transport.permit_number} Prolongado`,
            description: `Em trânsito há ${daysInTransit} dias`,
            category: 'Transporte',
            icon: <Truck className="h-4 w-4" />,
          });
        }
      }
    });

    // Check for logs at origin for too long
    logs.forEach(log => {
      if (log.status === 'at_origin' && log.created_at) {
        const created = new Date(log.created_at);
        const daysAtOrigin = differenceInDays(now, created);
        if (daysAtOrigin > 30) {
          result.push({
            id: `stale-log-${log.id}`,
            type: 'info',
            title: `Tora ${log.log_code} Parada`,
            description: `Na origem há ${daysAtOrigin} dias`,
            category: 'Tora',
            icon: <AlertTriangle className="h-4 w-4" />,
          });
        }
      }
    });

    // Check for trees marked but not felled (>90 days)
    trees.forEach(tree => {
      if (tree.status === 'logged' && tree.marked_at) {
        const marked = new Date(tree.marked_at);
        const daysSinceMarked = differenceInDays(now, marked);
        if (daysSinceMarked > 90) {
          result.push({
            id: `old-tree-${tree.id}`,
            type: 'info',
            title: `Árvore ${tree.tree_code} Pendente`,
            description: `Marcada há ${daysSinceMarked} dias sem abate`,
            category: 'Árvore',
            icon: <TreePine className="h-4 w-4" />,
          });
        }
      }
    });

    // Sort by type priority
    const priority = { critical: 0, warning: 1, info: 2 };
    result.sort((a, b) => priority[a.type] - priority[b.type]);

    return result;
  }, [trees, logs, transports]);

  const typeColors = {
    critical: 'bg-destructive text-destructive-foreground',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const typeBadge = {
    critical: 'destructive' as const,
    warning: 'outline' as const,
    info: 'secondary' as const,
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <Card className={criticalCount > 0 ? 'border-destructive/50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${criticalCount > 0 ? 'text-destructive' : ''}`} />
              Alertas de Rastreabilidade
            </CardTitle>
            <CardDescription>
              {alerts.length === 0 
                ? 'Nenhum alerta activo'
                : `${criticalCount} crítico(s), ${warningCount} aviso(s)`
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Críticos</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                {warningCount} Avisos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Todos os sistemas operacionais</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 10).map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.type === 'critical' ? 'bg-destructive/5 border-destructive/30' :
                  alert.type === 'warning' ? 'bg-amber-500/5 border-amber-500/30' :
                  'bg-muted/50'
                }`}
              >
                <div className={`p-1.5 rounded ${typeColors[alert.type]}`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant={typeBadge[alert.type]} className="text-xs">
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
              </div>
            ))}
            {alerts.length > 10 && (
              <p className="text-center text-sm text-muted-foreground pt-2">
                +{alerts.length - 10} alertas adicionais
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
