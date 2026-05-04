import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  Send, 
  ShieldCheck, 
  FileCheck2,
  Loader2,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { useUpdateFarmer, type WorkflowStatus } from '@/hooks/useFarmers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  requiredRoles: UserRole[];
  colorClass: string;
}

const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  {
    from: 'draft',
    to: 'submitted',
    label: 'Submeter',
    description: 'Submeter o registo para validação provincial',
    icon: <Send className="h-4 w-4" />,
    variant: 'default',
    requiredRoles: ['admin_national', 'admin_provincial', 'admin_municipal', 'technician_national', 'technician_provincial', 'technician_municipal'],
    colorClass: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    from: 'submitted',
    to: 'validated',
    label: 'Validar',
    description: 'Validar os dados do registo (nível provincial)',
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: 'default',
    requiredRoles: ['admin_national', 'admin_provincial', 'technician_national', 'technician_provincial'],
    colorClass: 'bg-cyan-600 hover:bg-cyan-700',
  },
  {
    from: 'validated',
    to: 'approved',
    label: 'Aprovar',
    description: 'Aprovar o registo validado (nível provincial/nacional)',
    icon: <ShieldCheck className="h-4 w-4" />,
    variant: 'default',
    requiredRoles: ['admin_national', 'admin_provincial'],
    colorClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    from: 'approved',
    to: 'issued',
    label: 'Emitir Cartão',
    description: 'Emitir o cartão do agricultor (nível nacional)',
    icon: <FileCheck2 className="h-4 w-4" />,
    variant: 'default',
    requiredRoles: ['admin_national'],
    colorClass: 'bg-green-600 hover:bg-green-700',
  },
];

const REJECTION_TRANSITIONS: { from: WorkflowStatus; requiredRoles: UserRole[] }[] = [
  { from: 'submitted', requiredRoles: ['admin_national', 'admin_provincial', 'technician_national', 'technician_provincial'] },
  { from: 'validated', requiredRoles: ['admin_national', 'admin_provincial'] },
  { from: 'approved', requiredRoles: ['admin_national'] },
];

const STATUS_STEPS: { status: WorkflowStatus; label: string }[] = [
  { status: 'draft', label: 'Rascunho' },
  { status: 'submitted', label: 'Submetido' },
  { status: 'validated', label: 'Validado' },
  { status: 'approved', label: 'Aprovado' },
  { status: 'issued', label: 'Emitido' },
];

const getStepIndex = (status: string) => {
  const idx = STATUS_STEPS.findIndex(s => s.status === status);
  return idx >= 0 ? idx : 0;
};

interface WorkflowActionsProps {
  farmerId: string;
  currentStatus: WorkflowStatus | string;
  farmerName: string;
  /** Tipo de entidade — usado para ajustar a etiqueta da última transição. */
  farmerType?: string;
}

/** Tipos elegíveis para emissão do cartão SIGAFLO. Demais tipos apenas activam o registo. */
const CARD_ELIGIBLE_TYPES = new Set(['individual', 'family', 'company']);

export const WorkflowActions = ({ farmerId, currentStatus, farmerName, farmerType }: WorkflowActionsProps) => {
  const isCardEligible = !farmerType || CARD_ELIGIBLE_TYPES.has(farmerType);
  const finalLabel = isCardEligible ? 'Emitir Cartão' : 'Activar Registo';
  const finalDescription = isCardEligible
    ? 'Emitir o cartão do agricultor (nível nacional)'
    : 'Activar o registo aprovado (nível nacional). Esta entidade não emite cartão SIGAFLO.';
  const { user, roles, hasAnyRole } = useAuth();
  const updateFarmer = useUpdateFarmer();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<WorkflowTransition | null>(null);
  const [isRejection, setIsRejection] = useState(false);
  const [observations, setObservations] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Find available forward transition (clonada para ajustar label/description ao tipo)
  const availableTransition = (() => {
    const base = WORKFLOW_TRANSITIONS.find(
      t => t.from === currentStatus && hasAnyRole(t.requiredRoles)
    );
    if (!base) return undefined;
    if (base.from === 'approved' && base.to === 'issued') {
      return { ...base, label: finalLabel, description: finalDescription };
    }
    return base;
  })();

  // Check if rejection is available
  const canReject = REJECTION_TRANSITIONS.some(
    r => r.from === currentStatus && hasAnyRole(r.requiredRoles)
  );

  const handleOpenDialog = (transition: WorkflowTransition | null, reject: boolean) => {
    setSelectedTransition(transition);
    setIsRejection(reject);
    setObservations('');
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (isRejection && !observations.trim()) {
      toast.error('O motivo da rejeição é obrigatório');
      return;
    }

    setIsProcessing(true);
    try {
      const newStatus = isRejection ? 'rejected' : selectedTransition!.to;

      // Update farmer status
      await updateFarmer.mutateAsync({
        id: farmerId,
        status: newStatus as any,
      });

      // Log audit trail
      await supabase.from('audit_log').insert({
        user_id: user?.id,
        action: isRejection ? 'workflow_reject' : `workflow_${newStatus}`,
        entity_type: 'farmer',
        entity_id: farmerId,
        old_values: { status: currentStatus },
        new_values: { 
          status: newStatus, 
          observations: observations.trim() || null 
        },
      });

      toast.success(
        isRejection
          ? `Registo de "${farmerName}" foi rejeitado`
          : `Registo de "${farmerName}" transitou para ${STATUS_STEPS.find(s => s.status === newStatus)?.label || newStatus}`
      );
      setDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao processar a transição de estado');
      console.error('Workflow transition error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show anything if no actions available and status is terminal
  if (!availableTransition && !canReject) {
    if (currentStatus === 'issued' || currentStatus === 'rejected') {
      return null;
    }
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Sem permissão para alterar o estado actual</span>
      </div>
    );
  }

  const currentStep = getStepIndex(currentStatus as string);

  return (
    <>
      <div className="space-y-4">
        {/* Progress Timeline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, idx) => {
            const isComplete = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isRejected = currentStatus === 'rejected';

            return (
              <div key={step.status} className="flex items-center">
                <div className="flex flex-col items-center min-w-[72px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isRejected && isCurrent
                        ? 'border-destructive bg-destructive/10 text-destructive'
                        : isComplete
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1 text-center ${isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {isRejected && isCurrent
                      ? 'Rejeitado'
                      : step.status === 'issued' && !isCardEligible
                        ? 'Activo'
                        : step.label}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 mt-[-12px] ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {availableTransition && (
            <Button
              onClick={() => handleOpenDialog(availableTransition, false)}
              className={availableTransition.colorClass}
            >
              {availableTransition.icon}
              <span className="ml-2">{availableTransition.label}</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
          {canReject && (
            <Button
              variant="destructive"
              onClick={() => handleOpenDialog(null, true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isRejection ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Rejeitar Registo
                </>
              ) : (
                <>
                  {selectedTransition?.icon}
                  {selectedTransition?.label} Registo
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isRejection
                ? `Tem a certeza que deseja rejeitar o registo de "${farmerName}"? Esta acção será registada no histórico de auditoria.`
                : `${selectedTransition?.description}. O registo de "${farmerName}" será actualizado.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Transition indicator */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline">
                {STATUS_STEPS.find(s => s.status === currentStatus)?.label || currentStatus}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className={isRejection ? 'bg-destructive text-destructive-foreground' : ''}>
                {isRejection ? 'Rejeitado' : STATUS_STEPS.find(s => s.status === selectedTransition?.to)?.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">
                Observações {isRejection && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="observations"
                placeholder={
                  isRejection
                    ? 'Indique o motivo da rejeição (obrigatório)...'
                    : 'Observações opcionais sobre esta transição...'
                }
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || (isRejection && !observations.trim())}
              variant={isRejection ? 'destructive' : 'default'}
              className={!isRejection ? selectedTransition?.colorClass : ''}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  {isRejection ? <XCircle className="mr-2 h-4 w-4" /> : selectedTransition?.icon}
                  <span className="ml-1">Confirmar {isRejection ? 'Rejeição' : selectedTransition?.label}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
