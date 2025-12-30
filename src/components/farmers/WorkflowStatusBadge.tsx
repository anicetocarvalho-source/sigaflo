import { Badge } from '@/components/ui/badge';
import type { WorkflowStatus } from '@/hooks/useFarmers';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

export const getStatusLabel = (status: WorkflowStatus): string => {
  const labels: Record<WorkflowStatus, string> = {
    draft: 'Rascunho',
    submitted: 'Submetido',
    validated: 'Validado',
    approved: 'Aprovado',
    issued: 'Emitido',
    rejected: 'Rejeitado',
    expired: 'Expirado',
  };
  return labels[status] || status;
};

export const getStatusVariant = (status: WorkflowStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'issued':
    case 'approved':
      return 'default';
    case 'validated':
    case 'submitted':
      return 'secondary';
    case 'rejected':
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusColor = (status: WorkflowStatus): string => {
  const colors: Record<WorkflowStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    submitted: 'bg-blue-100 text-blue-700 border-blue-300',
    validated: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    issued: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    expired: 'bg-amber-100 text-amber-700 border-amber-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const WorkflowStatusBadge = ({ status }: WorkflowStatusBadgeProps) => {
  return (
    <Badge className={`${getStatusColor(status)} border`}>
      {getStatusLabel(status)}
    </Badge>
  );
};
