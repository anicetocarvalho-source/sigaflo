import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
  variant = 'default',
  className,
}: KPICardProps) {
  const variantStyles = {
    default: 'before:bg-gradient-to-r before:from-primary before:to-primary-light',
    primary: 'before:bg-gradient-to-r before:from-primary before:to-primary-light',
    accent: 'before:bg-gradient-to-r before:from-accent before:to-accent-light',
    success: 'before:bg-gradient-to-r before:from-success before:to-success/70',
    warning: 'before:bg-gradient-to-r before:from-warning before:to-warning/70',
  };

  const changeStyles = {
    increase: 'text-success',
    decrease: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const ChangeIcon = changeType === 'increase' ? TrendingUp : changeType === 'decrease' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'kpi-card group transition-all duration-300 hover:shadow-lg',
        'before:transition-all before:duration-300',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="module-icon transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={cn('mt-4 flex items-center gap-1.5 text-sm', changeStyles[changeType])}>
          <ChangeIcon className="h-4 w-4" />
          <span className="font-medium">{change > 0 ? '+' : ''}{change}%</span>
          <span className="text-muted-foreground">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
