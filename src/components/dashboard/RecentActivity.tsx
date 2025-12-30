import { 
  FileCheck, 
  UserPlus, 
  AlertTriangle, 
  TreePine, 
  Coffee,
  Wheat,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'certificate' | 'registration' | 'alert' | 'forest' | 'coffee' | 'rice';
  action: string;
  subject: string;
  user: string;
  location?: string;
  time: string;
}

const activityIcons = {
  certificate: FileCheck,
  registration: UserPlus,
  alert: AlertTriangle,
  forest: TreePine,
  coffee: Coffee,
  rice: Wheat,
};

const activityColors = {
  certificate: 'bg-success/10 text-success',
  registration: 'bg-info/10 text-info',
  alert: 'bg-warning/10 text-warning',
  forest: 'bg-primary/10 text-primary',
  coffee: 'bg-accent/10 text-accent-foreground',
  rice: 'bg-success/10 text-success',
};

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <div className={cn('card-elevated', className)}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">Actividade Recente</h3>
        </div>
        <a href="/actividade" className="text-sm text-primary hover:underline">
          Ver tudo
        </a>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30"
              >
                <div className={cn('rounded-lg p-2', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.action}</span>
                    {' '}
                    <span className="text-muted-foreground">{activity.subject}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    {activity.location && (
                      <>
                        <span>•</span>
                        <span>{activity.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
