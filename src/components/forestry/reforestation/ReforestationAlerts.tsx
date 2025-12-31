import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, Sprout, TrendingDown, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'low_survival' | 'behind_schedule' | 'nursery_low' | 'monitoring_due';
  title: string;
  message: string;
  project_name?: string;
  value?: number;
  threshold?: number;
  priority: 'high' | 'medium' | 'low';
}

interface ReforestationAlertsProps {
  alerts: Alert[];
  onViewProject?: (projectName: string) => void;
}

export function ReforestationAlerts({ alerts, onViewProject }: ReforestationAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_survival':
        return <TrendingDown className="h-4 w-4" />;
      case 'behind_schedule':
        return <Clock className="h-4 w-4" />;
      case 'nursery_low':
        return <Sprout className="h-4 w-4" />;
      case 'monitoring_due':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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

  // Mock alerts if none provided
  const displayAlerts: Alert[] = alerts.length > 0 ? alerts : [
    {
      id: '1',
      type: 'low_survival',
      title: 'Taxa de Sobrevivência Crítica',
      message: 'Projecto "Maiombe Norte" com taxa de sobrevivência de 45%, abaixo do mínimo de 70%.',
      project_name: 'Maiombe Norte',
      value: 45,
      threshold: 70,
      priority: 'high',
    },
    {
      id: '2',
      type: 'behind_schedule',
      title: 'Atraso na Plantação',
      message: 'Projecto "Floresta Comunitária Uíge" com apenas 35% da área plantada. Prazo termina em 2 meses.',
      project_name: 'Floresta Comunitária Uíge',
      value: 35,
      priority: 'high',
    },
    {
      id: '3',
      type: 'nursery_low',
      title: 'Stock de Viveiro Baixo',
      message: 'Viveiro Central de Cabinda com apenas 2.500 mudas. Reposição necessária.',
      value: 2500,
      priority: 'medium',
    },
    {
      id: '4',
      type: 'monitoring_due',
      title: 'Monitorização Pendente',
      message: '3 projectos aguardam visita de monitorização há mais de 60 dias.',
      priority: 'medium',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas de Reflorestamento
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
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                      {alert.priority === 'high' ? 'Urgente' : alert.priority === 'medium' ? 'Importante' : 'Normal'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  {alert.value !== undefined && alert.threshold !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Actual: {alert.value}%</span>
                        <span className="text-muted-foreground">Meta: {alert.threshold}%</span>
                      </div>
                      <Progress 
                        value={alert.value} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </div>
              {alert.project_name && onViewProject && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="shrink-0"
                  onClick={() => onViewProject(alert.project_name!)}
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
            <Sprout className="mx-auto h-8 w-8 opacity-50 mb-2" />
            <p>Nenhum alerta activo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
