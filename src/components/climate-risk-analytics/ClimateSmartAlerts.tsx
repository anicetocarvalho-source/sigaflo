import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  MapPin, 
  Shield, 
  DollarSign,
  Bell,
  ChevronRight,
  Zap
} from 'lucide-react';
import { ClimateSmartAlert } from '@/hooks/useClimateRiskAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface ClimateSmartAlertsProps {
  data?: ClimateSmartAlert[];
  isLoading: boolean;
}

export function ClimateSmartAlerts({ data, isLoading }: ClimateSmartAlertsProps) {
  const getAlertIcon = (type: ClimateSmartAlert['type']) => {
    switch (type) {
      case 'critical_zone':
        return <AlertTriangle className="h-5 w-5" />;
      case 'activate_mitigation':
        return <Shield className="h-5 w-5" />;
      case 'compensation_base':
        return <DollarSign className="h-5 w-5" />;
      case 'trend_warning':
        return <Zap className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: ClimateSmartAlert['type']) => {
    switch (type) {
      case 'critical_zone':
        return 'Zona Crítica';
      case 'activate_mitigation':
        return 'Mitigação';
      case 'compensation_base':
        return 'Compensação';
      case 'trend_warning':
        return 'Tendência';
      default:
        return type;
    }
  };

  const getSeverityStyles = (severity: ClimateSmartAlert['severity']) => {
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

  const getSeverityLabel = (severity: ClimateSmartAlert['severity']) => {
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
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts = data || [];
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const mitigationCount = alerts.filter(a => a.type === 'activate_mitigation').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Climáticos
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {mitigationCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {mitigationCount} mitigação
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
              Condições climáticas dentro dos parâmetros normais
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
                      
                      {alert.provinceName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.provinceName}</span>
                        </div>
                      )}
                      
                      {alert.actionRequired && (
                        <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                          <span className="font-medium">Acção requerida: </span>
                          {alert.actionRequired}
                        </div>
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
