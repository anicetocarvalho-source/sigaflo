import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TimelineEvent } from '@/hooks/useONAF';
import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Calendar,
  Wheat,
  CloudRain,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface PredictiveTimelineProps {
  events: TimelineEvent[];
}

export function PredictiveTimeline({ events }: PredictiveTimelineProps) {
  const today = new Date();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'food':
        return <Wheat className="h-4 w-4" />;
      case 'climate':
        return <CloudRain className="h-4 w-4" />;
      case 'economic':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'food':
        return 'text-amber-500 bg-amber-500/10';
      case 'climate':
        return 'text-blue-500 bg-blue-500/10';
      case 'economic':
        return 'text-emerald-500 bg-emerald-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: TimelineEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTimeframeLabel = (date: string) => {
    const days = differenceInDays(new Date(date), today);
    if (days <= 30) return '30 dias';
    if (days <= 60) return '60 dias';
    return '90 dias';
  };

  // Group events by timeframe
  const eventsByTimeframe = {
    '30d': events.filter(e => differenceInDays(new Date(e.date), today) <= 30),
    '60d': events.filter(e => {
      const days = differenceInDays(new Date(e.date), today);
      return days > 30 && days <= 60;
    }),
    '90d': events.filter(e => differenceInDays(new Date(e.date), today) > 60),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline Preditiva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Header */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-amber-500/10">
            <p className="text-2xl font-bold text-amber-500">30</p>
            <p className="text-xs text-muted-foreground">dias</p>
            <p className="text-sm font-medium mt-1">{eventsByTimeframe['30d'].length} eventos</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <p className="text-2xl font-bold text-blue-500">60</p>
            <p className="text-xs text-muted-foreground">dias</p>
            <p className="text-sm font-medium mt-1">{eventsByTimeframe['60d'].length} eventos</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <p className="text-2xl font-bold text-purple-500">90</p>
            <p className="text-xs text-muted-foreground">dias</p>
            <p className="text-sm font-medium mt-1">{eventsByTimeframe['90d'].length} eventos</p>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event, index) => {
            const daysUntil = differenceInDays(new Date(event.date), today);
            
            return (
              <div 
                key={index} 
                className="relative pl-8 pb-4 border-l-2 border-muted last:pb-0"
              >
                {/* Timeline dot */}
                <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${getEventColor(event.type)} flex items-center justify-center`}>
                  {getEventIcon(event.type)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                          {event.severity === 'critical' ? 'Crítico' : 
                           event.severity === 'high' ? 'Alto' : 
                           event.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {daysUntil} dias ({getTimeframeLabel(event.date)})
                        </span>
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{event.projectedImpact}</p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Probabilidade:</span>
                    <Progress value={event.probability * 100} className="flex-1 h-2" />
                    <span className="text-xs font-medium">{Math.round(event.probability * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sem eventos projectados</p>
          </div>
        )}

        {/* Risk Summary */}
        <div className="p-4 rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3">Resumo de Riscos por Categoria</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/10">
                <Wheat className="h-3 w-3 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">{events.filter(e => e.type === 'food').length}</p>
                <p className="text-xs text-muted-foreground">Alimentares</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-500/10">
                <CloudRain className="h-3 w-3 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{events.filter(e => e.type === 'climate').length}</p>
                <p className="text-xs text-muted-foreground">Climáticos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-500/10">
                <DollarSign className="h-3 w-3 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">{events.filter(e => e.type === 'economic').length}</p>
                <p className="text-xs text-muted-foreground">Económicos</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
