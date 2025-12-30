import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  stats?: { label: string; value: string | number }[];
  status?: 'active' | 'pending' | 'inactive';
  className?: string;
}

export function ModuleCard({
  title,
  description,
  icon,
  href,
  stats,
  status = 'active',
  className,
}: ModuleCardProps) {
  const statusStyles = {
    active: 'border-l-success',
    pending: 'border-l-warning',
    inactive: 'border-l-muted',
  };

  return (
    <Link
      to={href}
      className={cn(
        'card-interactive group block border-l-4 p-5',
        statusStyles[status],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="module-icon shrink-0 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-foreground truncate">
              {title}
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
          
          {stats && stats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
