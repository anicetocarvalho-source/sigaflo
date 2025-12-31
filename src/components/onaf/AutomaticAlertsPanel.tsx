import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PredictiveAlert } from '@/hooks/useONAF';
import {
  AlertTriangle,
  ShoppingCart,
  Wheat,
  CloudRain,
  TreePine,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface AutomaticAlertsPanelProps {
  alerts: PredictiveAlert[];
  onAlertClick?: (alert: PredictiveAlert) => void;
}

export function AutomaticAlertsPanel({ alerts, onAlertClick }: AutomaticAlertsPanelProps) {
  const getAlertIcon = (type: PredictiveAlert['type']) => {
    switch (type) {
      case 'food_deficit':
        return <Wheat className="h-5 w-5" />;
      case 'import_surge':
        return <ShoppingCart className="h-5 w-5" />;
      case 'production_low':
        return <AlertTriangle className="h-5 w-5" />;
      case 'climate_risk':
        return <CloudRain className="h-5 w-5" />;
      case 'forest_pressure':
        return <TreePine className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: PredictiveAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-500/10',
          text: 'text-red-500',
          badge: 'destructive' as const,
        };
      case 'high':
        return {
          border: 'border-orange-500/50',
          bg: 'bg-orange-500/10',
          text: 'text-orange-500',
          badge: 'default' as const,
        };
      case 'medium':
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-500',
          badge: 'secondary' as const,
        };
      default:
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-500/10',
          text: 'text-blue-500',
          badge: 'outline' as const,
        };
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <Card className={criticalCount > 0 ? 'border-red-500/30' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className={`h-5 w-5 ${criticalCount > 0 ? 'text-red-500 animate-pulse' : ''}`} />
            Alertas Automáticos
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} crítico{criticalCount > 1 ? 's' : ''}</Badge>
            )}
            {highCount > 0 && (
              <Badge variant="default">{highCount} alto{highCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sem alertas activos</p>
            <p className="text-sm">O sistema está a monitorizar indicadores</p>
          </div>
        ) : (
          alerts.map(alert => {
            const styles = getSeverityStyles(alert.severity);
            
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border ${styles.border} ${styles.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${styles.text}`}>{alert.title}</h4>
                      <Badge variant={styles.badge} className="text-xs">
                        {alert.severity === 'critical' ? 'Crítico' : 
                         alert.severity === 'high' ? 'Alto' : 
                         alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Impacto: <span className="font-medium">{formatCurrency(alert.projectedImpact)} AOA</span>
                      </span>
                      <span className="text-muted-foreground">
                        Horizonte: <span className="font-medium">
                          {alert.timeframe === '30d' ? '30 dias' : 
                           alert.timeframe === '60d' ? '60 dias' : '90 dias'}
                        </span>
                      </span>
                    </div>
                    
                    {/* Recommended Actions */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2">Acções Recomendadas:</p>
                      <ul className="space-y-1">
                        {alert.recommendedActions.slice(0, 2).map((action, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {alerts.length > 0 && (
          <Button variant="outline" className="w-full" size="sm">
            Ver Todos os Alertas ({alerts.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
