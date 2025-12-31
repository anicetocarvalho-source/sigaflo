import { Badge } from '@/components/ui/badge';
import { 
  WORKFLOW_STATUS_LABELS, 
  WORKFLOW_STATUS_COLORS,
  type WorkflowStatus 
} from '@/lib/constants';

// Re-export WorkflowStatus type for backwards compatibility
export type { WorkflowStatus };

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus | string;
}

export const getStatusLabel = (status: string): string => {
  return WORKFLOW_STATUS_LABELS[status as WorkflowStatus] || status;
};

export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'issued':
    case 'approved':
      return 'default';
    case 'validated':
    case 'submitted':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusColor = (status: string): string => {
  // Extended colors for badge styling with borders
  const colors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-muted-foreground/20',
    submitted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    validated: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    issued: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    expired: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};

export const WorkflowStatusBadge = ({ status }: WorkflowStatusBadgeProps) => {
  return (
    <Badge className={`${getStatusColor(status)} border font-medium`}>
      {getStatusLabel(status)}
    </Badge>
  );
};
