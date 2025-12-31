import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  AlertTriangle, 
  MapPin, 
  User, 
  Calendar, 
  FileText, 
  Scale,
  Package,
  Edit,
  Printer,
  CheckCircle
} from 'lucide-react';

interface InfractionDetailProps {
  open: boolean;
  onClose: () => void;
  infraction: {
    id: string;
    infraction_number: string;
    infraction_type: string;
    severity: string;
    status: string;
    operator_name: string;
    operator_license?: string;
    location_description: string;
    occurrence_date: string;
    description?: string;
    fine_amount_aoa: number | null;
    seized_volume_m3: number | null;
    seized_species?: string;
    inspector_name?: string;
    province?: { name: string };
    municipality?: { name: string };
  } | null;
  onEdit?: () => void;
}

const severityLabels: Record<string, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  serious: 'Grave',
  very_serious: 'Muito Grave',
};

const statusLabels: Record<string, string> = {
  detected: 'Detectada',
  under_investigation: 'Em Investigação',
  notification_sent: 'Notificação Enviada',
  awaiting_response: 'Aguarda Resposta',
  fine_applied: 'Multa Aplicada',
  appealed: 'Em Recurso',
  resolved: 'Resolvida',
  archived: 'Arquivada',
};

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal',
  transport_violation: 'Violação de Transporte',
  license_violation: 'Violação de Licença',
  protected_species: 'Espécie Protegida',
  unauthorized_area: 'Área Não Autorizada',
  document_fraud: 'Fraude Documental',
  volume_excess: 'Excesso de Volume',
  other: 'Outra',
};

export function InfractionDetail({ open, onClose, infraction, onEdit }: InfractionDetailProps) {
  if (!infraction) return null;

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      minor: 'bg-green-500/20 text-green-700 border-green-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      serious: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      very_serious: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
    return colors[severity] || 'bg-gray-100';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      detected: 'bg-yellow-500/20 text-yellow-700',
      under_investigation: 'bg-blue-500/20 text-blue-700',
      resolved: 'bg-green-500/20 text-green-700',
      fine_applied: 'bg-red-500/20 text-red-700',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Auto de Infração {infraction.infraction_number}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Severity */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${getSeverityColor(infraction.severity)}`}>
              {severityLabels[infraction.severity] || infraction.severity}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(infraction.status)}`}>
              {statusLabels[infraction.status] || infraction.status}
            </span>
            <Badge variant="outline">{typeLabels[infraction.infraction_type] || infraction.infraction_type}</Badge>
          </div>

          <Separator />

          {/* Operator Info */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Infractor
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{infraction.operator_name}</p>
              </div>
              {infraction.operator_license && (
                <div>
                  <p className="text-muted-foreground">Nº Licença</p>
                  <p className="font-medium">{infraction.operator_license}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Província</p>
                <p className="font-medium">{infraction.province?.name || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Município</p>
                <p className="font-medium">{infraction.municipality?.name || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Descrição do Local</p>
                <p className="font-medium">{infraction.location_description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date and Description */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ocorrência
            </h4>
            <div className="text-sm">
              <div className="mb-2">
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">
                  {infraction.occurrence_date 
                    ? format(new Date(infraction.occurrence_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                    : '-'}
                </p>
              </div>
              {infraction.description && (
                <div>
                  <p className="text-muted-foreground">Descrição</p>
                  <p className="font-medium">{infraction.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seizure Info */}
          {(infraction.seized_volume_m3 || infraction.seized_species) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Apreensão
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {infraction.seized_volume_m3 && (
                    <div>
                      <p className="text-muted-foreground">Volume Apreendido</p>
                      <p className="font-medium">{infraction.seized_volume_m3.toLocaleString()} m³</p>
                    </div>
                  )}
                  {infraction.seized_species && (
                    <div>
                      <p className="text-muted-foreground">Espécies</p>
                      <p className="font-medium">{infraction.seized_species}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Fine Info */}
          {infraction.fine_amount_aoa && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Sanção
                </h4>
                <div className="text-sm">
                  <p className="text-muted-foreground">Multa Aplicada</p>
                  <p className="text-2xl font-bold text-destructive">
                    {infraction.fine_amount_aoa.toLocaleString()} AOA
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Inspector */}
          {infraction.inspector_name && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fiscal Responsável
                </h4>
                <p className="text-sm font-medium">{infraction.inspector_name}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
