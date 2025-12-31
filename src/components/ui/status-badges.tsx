import { Badge } from '@/components/ui/badge';
import { 
  WORKFLOW_STATUS_LABELS, 
  WORKFLOW_STATUS_COLORS,
  OCCURRENCE_STATUS_LABELS,
  OCCURRENCE_STATUS_COLORS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  type WorkflowStatus,
  type OccurrenceStatus,
  type SeverityLevel,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  const label = WORKFLOW_STATUS_LABELS[status] || status;
  const colorClass = WORKFLOW_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge 
      variant="secondary" 
      className={cn(colorClass, 'font-medium', className)}
    >
      {label}
    </Badge>
  );
}

interface OccurrenceStatusBadgeProps {
  status: OccurrenceStatus;
  className?: string;
}

export function OccurrenceStatusBadge({ status, className }: OccurrenceStatusBadgeProps) {
  const label = OCCURRENCE_STATUS_LABELS[status] || status;
  const colorClass = OCCURRENCE_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge 
      variant="secondary" 
      className={cn(colorClass, 'font-medium', className)}
    >
      {label}
    </Badge>
  );
}

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const label = SEVERITY_LABELS[severity] || severity;
  const colorClass = SEVERITY_COLORS[severity] || 'bg-muted text-muted-foreground';

  return (
    <Badge 
      variant="secondary" 
      className={cn(colorClass, 'font-medium', className)}
    >
      {label}
    </Badge>
  );
}
