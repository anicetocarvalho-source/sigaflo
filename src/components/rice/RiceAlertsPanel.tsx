import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Package, DollarSign, Check, X } from 'lucide-react';
import { useRiceAlerts } from '@/hooks/useRice';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ALERT_ICONS: Record<string, React.ReactNode> = {
  price_spike: <DollarSign className="h-4 w-4" />,
  import_surge: <Package className="h-4 w-4" />,
  production_drop: <TrendingDown className="h-4 w-4" />,
  stock_low: <AlertTriangle className="h-4 w-4" />,
  gap_increase: <TrendingUp className="h-4 w-4" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export const RiceAlertsPanel = () => {
  const { data: alerts, isLoading } = useRiceAlerts();
  const queryClient = useQueryClient();

  const markAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from('rice_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) {
      toast.error('Erro ao marcar alerta como lido');
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['rice-alerts'] });
  };

  const markAsResolved = async (alertId: string) => {
    const { error } = await supabase
      .from('rice_alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      toast.error('Erro ao resolver alerta');
      return;
    }

    toast.success('Alerta resolvido');
    queryClient.invalidateQueries({ queryKey: ['rice-alerts'] });
  };

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;
  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Alertas do Sistema</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} novo{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Carregando alertas...</div>
            </div>
          ) : unresolvedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Check className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-muted-foreground">Nenhum alerta ativo</p>
              <p className="text-xs text-muted-foreground">O sistema está funcionando normalmente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    alert.is_read 
                      ? 'bg-muted/30' 
                      : 'bg-background border-primary/30 shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-full',
                        SEVERITY_COLORS[alert.severity]
                      )}>
                        {ALERT_ICONS[alert.alert_type] || <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge variant="outline" className={cn('text-xs', SEVERITY_COLORS[alert.severity])}>
                            {SEVERITY_LABELS[alert.severity]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        {alert.current_value !== null && alert.threshold_value !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Valor: {alert.current_value} | Limiar: {alert.threshold_value}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(alert.created_at), { 
                            addSuffix: true, 
                            locale: pt 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(alert.id)}
                          title="Marcar como lido"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={() => markAsResolved(alert.id)}
                        title="Resolver"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
