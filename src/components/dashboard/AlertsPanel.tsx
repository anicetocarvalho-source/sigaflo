import { cn } from '@/lib/utils';
import { AlertTriangle, CloudRain, Bug, TrendingDown, Info } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'climate' | 'pest' | 'production' | 'market' | 'system';
  title: string;
  location?: string;
  time: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  className?: string;
}

const alertStyles = {
  critical: {
    bg: 'bg-destructive/10',
    border: 'border-l-destructive',
    icon: 'text-destructive',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-l-warning',
    icon: 'text-warning',
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-l-info',
    icon: 'text-info',
  },
};

const categoryIcons = {
  climate: CloudRain,
  pest: Bug,
  production: TrendingDown,
  market: TrendingDown,
  system: Info,
};

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  return (
    <div className={cn('card-elevated overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-display font-semibold text-foreground">Alertas Activos</h3>
        </div>
        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
          {alerts.filter(a => a.type === 'critical').length} críticos
        </span>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>Nenhum alerta activo</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const styles = alertStyles[alert.type];
              const Icon = categoryIcons[alert.category];
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 border-l-4 p-4 transition-colors hover:bg-muted/50',
                    styles.border,
                    styles.bg
                  )}
                >
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', styles.icon)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    {alert.location && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{alert.location}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
