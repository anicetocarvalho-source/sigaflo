import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreePine, Logs, Truck, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ForestTree, ForestLog, ForestTransportPermit } from '@/hooks/useForestry';

interface TraceabilityTimelineProps {
  trees: ForestTree[];
  logs: ForestLog[];
  transports: ForestTransportPermit[];
}

interface TimelineEvent {
  id: string;
  type: 'tree' | 'log' | 'transport' | 'destination';
  title: string;
  description: string;
  date: Date;
  status: 'success' | 'warning' | 'info' | 'pending';
  icon: React.ReactNode;
}

export function TraceabilityTimeline({ trees, logs, transports }: TraceabilityTimelineProps) {
  // Build timeline events
  const events: TimelineEvent[] = [];

  // Add tree events
  trees.forEach(tree => {
    if (tree.marked_at) {
      events.push({
        id: `tree-${tree.id}`,
        type: 'tree',
        title: `Árvore ${tree.tree_code} Marcada`,
        description: `${tree.species} - ${tree.estimated_volume_m3 || '?'} m³ estimados`,
        date: new Date(tree.marked_at),
        status: 'success',
        icon: <TreePine className="h-4 w-4" />,
      });
    }
    if (tree.felled_at) {
      events.push({
        id: `tree-felled-${tree.id}`,
        type: 'tree',
        title: `Árvore ${tree.tree_code} Abatida`,
        description: `${tree.species}`,
        date: new Date(tree.felled_at),
        status: 'info',
        icon: <TreePine className="h-4 w-4" />,
      });
    }
  });

  // Add log events
  logs.forEach(log => {
    if (log.created_at) {
      events.push({
        id: `log-${log.id}`,
        type: 'log',
        title: `Tora ${log.log_code} Registada`,
        description: `${log.species} - ${log.volume_m3} m³`,
        date: new Date(log.created_at),
        status: 'success',
        icon: <Logs className="h-4 w-4" />,
      });
    }
  });

  // Add transport events
  transports.forEach(transport => {
    if (transport.departure_at) {
      events.push({
        id: `transport-dep-${transport.id}`,
        type: 'transport',
        title: `Transporte ${transport.permit_number} Iniciado`,
        description: `${transport.origin_location} → ${transport.destination_location}`,
        date: new Date(transport.departure_at),
        status: 'info',
        icon: <Truck className="h-4 w-4" />,
      });
    }
    if (transport.arrival_at) {
      events.push({
        id: `transport-arr-${transport.id}`,
        type: 'destination',
        title: `Transporte ${transport.permit_number} Concluído`,
        description: `Chegou a ${transport.destination_location}`,
        date: new Date(transport.arrival_at),
        status: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      });
    }
    // Alert for expiring permits
    const validUntil = new Date(transport.valid_until);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0 && transport.status !== 'completed') {
      events.push({
        id: `transport-expiring-${transport.id}`,
        type: 'transport',
        title: `Guia ${transport.permit_number} A Expirar`,
        description: `Expira em ${daysUntilExpiry} dia(s)`,
        date: validUntil,
        status: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    }
  });

  // Sort by date descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    pending: 'bg-slate-400',
  };

  const statusBadge = {
    success: 'default' as const,
    warning: 'destructive' as const,
    info: 'secondary' as const,
    pending: 'outline' as const,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline de Eventos
        </CardTitle>
        <CardDescription>
          Histórico cronológico de todas as operações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento registado</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {events.slice(0, 20).map((event) => (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-2.5 w-4 h-4 rounded-full ${statusColors[event.status]} flex items-center justify-center`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{event.icon}</span>
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <Badge variant={statusBadge[event.status]} className="text-xs">
                          {format(event.date, "dd/MM HH:mm", { locale: pt })}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
