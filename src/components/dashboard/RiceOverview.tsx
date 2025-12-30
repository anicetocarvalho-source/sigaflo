import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiceMetric {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  status?: 'good' | 'warning' | 'critical';
}

const metrics: RiceMetric[] = [
  {
    label: 'Produção Nacional',
    value: '892.450',
    subValue: 'toneladas/ano',
    change: 12.5,
    changeType: 'positive',
    icon: Package,
    status: 'good',
  },
  {
    label: 'Importações',
    value: '1.245.000',
    subValue: 'toneladas/ano',
    change: -8.2,
    changeType: 'positive',
    icon: ShoppingCart,
    status: 'warning',
  },
  {
    label: 'Consumo Per Capita',
    value: '38.5',
    subValue: 'kg/pessoa/ano',
    icon: Users,
    status: 'good',
  },
  {
    label: 'Défice Alimentar',
    value: '352.550',
    subValue: 'toneladas (gap)',
    change: -15.3,
    changeType: 'positive',
    icon: Target,
    status: 'warning',
  },
];

export function RiceOverview() {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="gradient-primary p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-primary-foreground">
              Módulo Estratégico: Arroz
            </h3>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Indicadores de Soberania Alimentar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dados actualizados
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const statusColors = {
            good: 'text-success',
            warning: 'text-warning',
            critical: 'text-destructive',
          };
          
          return (
            <div
              key={index}
              className="bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <Icon className={cn('h-5 w-5', statusColors[metric.status || 'good'])} />
                {metric.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    metric.changeType === 'positive' ? 'text-success' : 
                    metric.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {metric.changeType === 'positive' ? (
                      metric.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    ) : (
                      metric.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground">{metric.subValue}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span>Recomendação: Aumentar área cultivada em 15% para reduzir dependência de importações</span>
        </div>
        <a href="/arroz" className="text-sm font-medium text-primary hover:underline">
          Ver análise completa →
        </a>
      </div>
    </div>
  );
}
