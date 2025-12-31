import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Bell, ArrowRight, Scale, FileWarning } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'pending_response' | 'appeal_deadline' | 'high_severity' | 'repeated_offender';
  title: string;
  message: string;
  infraction_number?: string;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
}

interface EnforcementAlertsProps {
  alerts: Alert[];
  onViewInfraction?: (infractionNumber: string) => void;
}

export function EnforcementAlerts({ alerts, onViewInfraction }: EnforcementAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pending_response':
        return <Clock className="h-4 w-4" />;
      case 'appeal_deadline':
        return <Scale className="h-4 w-4" />;
      case 'high_severity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'repeated_offender':
        return <FileWarning className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    const labels: Record<string, string> = {
      high: 'Urgente',
      medium: 'Importante',
      low: 'Normal',
    };
    return <Badge variant={variants[priority] || 'secondary'}>{labels[priority] || priority}</Badge>;
  };

  // Mock alerts if none provided
  const displayAlerts: Alert[] = alerts.length > 0 ? alerts : [
    {
      id: '1',
      type: 'pending_response',
      title: 'Prazo de Resposta a Expirar',
      message: 'INF-2024-000023 aguarda resposta há 25 dias. Prazo expira em 5 dias.',
      infraction_number: 'INF-2024-000023',
      created_at: new Date().toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      type: 'high_severity',
      title: 'Infração Muito Grave Registada',
      message: 'Nova infração de corte ilegal de espécie protegida detectada em Cabinda.',
      infraction_number: 'INF-2024-000045',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      priority: 'high',
    },
    {
      id: '3',
      type: 'repeated_offender',
      title: 'Reincidência Detectada',
      message: 'Operador "Madeiras XYZ Lda" com 3ª infração no último ano.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      priority: 'medium',
    },
    {
      id: '4',
      type: 'appeal_deadline',
      title: 'Recurso em Análise',
      message: 'Recurso de INF-2024-000012 deve ser decidido até 15/02/2024.',
      infraction_number: 'INF-2024-000012',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      priority: 'medium',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-warning" />
          Alertas de Fiscalização
          <Badge variant="outline" className="ml-auto">
            {displayAlerts.length} activos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border-l-4 p-4 ${getPriorityColor(alert.priority)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {getPriorityBadge(alert.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: pt })}
                  </p>
                </div>
              </div>
              {alert.infraction_number && onViewInfraction && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="shrink-0"
                  onClick={() => onViewInfraction(alert.infraction_number!)}
                >
                  Ver
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {displayAlerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 opacity-50 mb-2" />
            <p>Nenhum alerta activo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
