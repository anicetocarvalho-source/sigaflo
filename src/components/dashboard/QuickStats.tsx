import { cn } from '@/lib/utils';

interface QuickStat {
  label: string;
  value: string | number;
  subValue?: string;
}

interface QuickStatsProps {
  title: string;
  stats: QuickStat[];
  className?: string;
}

export function QuickStats({ title, stats, className }: QuickStatsProps) {
  return (
    <div className={cn('card-elevated p-5', className)}>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4 space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="text-right">
              <span className="font-display text-lg font-bold text-foreground">{stat.value}</span>
              {stat.subValue && (
                <span className="ml-1 text-xs text-muted-foreground">{stat.subValue}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
