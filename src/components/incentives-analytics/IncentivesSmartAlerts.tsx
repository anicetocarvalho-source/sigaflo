import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Target,
  Bell,
  ChevronRight
} from 'lucide-react';
import { IncentiveSmartAlert } from '@/hooks/useIncentivesAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface IncentivesSmartAlertsProps {
  data?: IncentiveSmartAlert[];
  isLoading: boolean;
}

export function IncentivesSmartAlerts({ data, isLoading }: IncentivesSmartAlertsProps) {
  const getAlertIcon = (type: IncentiveSmartAlert['type']) => {
    switch (type) {
      case 'low_impact':
        return <TrendingDown className="h-5 w-5" />;
      case 'production_deviation':
        return <AlertTriangle className="h-5 w-5" />;
      case 'expired_no_evaluation':
        return <Clock className="h-5 w-5" />;
      case 'budget_exceeded':
        return <DollarSign className="h-5 w-5" />;
      case 'target_missed':
        return <Target className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: IncentiveSmartAlert['type']) => {
    switch (type) {
      case 'low_impact':
        return 'Baixo Impacto';
      case 'production_deviation':
        return 'Desvio Produtivo';
      case 'expired_no_evaluation':
        return 'Sem Avaliação';
      case 'budget_exceeded':
        return 'Orçamento';
      case 'target_missed':
        return 'Meta';
      default:
        return type;
    }
  };

  const getSeverityStyles = (severity: IncentiveSmartAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'bg-orange-100 text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const getSeverityLabel = (severity: IncentiveSmartAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts = data || [];
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Inteligentes
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} crítico{criticalCount !== 1 ? 's' : ''}</Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {highCount} alto{highCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">Sem alertas activos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os programas estão dentro dos parâmetros esperados
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {alerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${styles.bg} transition-colors hover:opacity-90`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.icon}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge className={styles.badge} variant="outline">
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getAlertTypeLabel(alert.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      {alert.programName && (
                        <p className="text-xs text-muted-foreground">
                          Programa: <span className="font-medium">{alert.programName}</span>
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
