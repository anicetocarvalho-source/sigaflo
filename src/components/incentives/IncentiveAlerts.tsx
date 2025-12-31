import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  ShieldAlert,
  CheckCircle,
  Bell
} from 'lucide-react';
import { useIncentiveAlerts, useResolveAlert } from '@/hooks/useIncentives';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const alertTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  no_impact: { icon: <TrendingDown className="h-4 w-4" />, color: 'text-orange-500' },
  deviation: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-500' },
  expiring: { icon: <Clock className="h-4 w-4" />, color: 'text-blue-500' },
  budget_exceeded: { icon: <DollarSign className="h-4 w-4" />, color: 'text-red-500' },
  compliance_issue: { icon: <ShieldAlert className="h-4 w-4" />, color: 'text-purple-500' },
};

const severityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Baixa', variant: 'outline' },
  medium: { label: 'Média', variant: 'secondary' },
  high: { label: 'Alta', variant: 'default' },
  critical: { label: 'Crítica', variant: 'destructive' },
};

export function IncentiveAlerts() {
  const { data: alerts, isLoading } = useIncentiveAlerts(false);
  const resolveAlert = useResolveAlert();

  const handleResolve = (id: string) => {
    resolveAlert.mutate({ id });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas
          </div>
          {alerts && alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              A carregar alertas...
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const typeConfig = alertTypeConfig[alert.alert_type] || alertTypeConfig.deviation;
                const severity = severityConfig[alert.severity] || severityConfig.medium;

                return (
                  <div 
                    key={alert.id}
                    className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={typeConfig.color}>
                          {typeConfig.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), "d MMM yyyy, HH:mm", { locale: pt })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={severity.variant} className="text-xs">
                        {severity.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>

                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolver
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>Nenhum alerta ativo</p>
              <p className="text-xs">Todos os programas estão a funcionar normalmente</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
