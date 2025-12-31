import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Megaphone, 
  MapPin, 
  User, 
  Calendar, 
  FileText, 
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { useState } from 'react';

interface ComplaintDetailProps {
  open: boolean;
  onClose: () => void;
  complaint: {
    id: string;
    complaint_number: string;
    complaint_type: string;
    status: string;
    is_anonymous: boolean;
    complainant_name?: string;
    complainant_phone?: string;
    complainant_email?: string;
    location_description: string;
    description: string;
    occurrence_date?: string;
    received_at: string;
    verification_result?: string;
    investigation_notes?: string;
    actions_taken?: string;
    province?: { name: string };
    municipality?: { name: string };
  } | null;
  onUpdateStatus?: (status: string, notes: string) => void;
}

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal de Árvores',
  illegal_transport: 'Transporte Ilegal de Madeira',
  deforestation: 'Desmatamento',
  poaching: 'Caça Furtiva',
  fire: 'Queimada Ilegal',
  encroachment: 'Invasão de Área Protegida',
  pollution: 'Poluição/Contaminação',
  other: 'Outra Irregularidade',
};

const statusLabels: Record<string, string> = {
  received: 'Recebida',
  under_review: 'Em Análise',
  under_investigation: 'Em Investigação',
  verified: 'Verificada',
  unverified: 'Não Verificada',
  resolved: 'Resolvida',
  archived: 'Arquivada',
};

export function ComplaintDetail({ open, onClose, complaint, onUpdateStatus }: ComplaintDetailProps) {
  const [notes, setNotes] = useState('');

  if (!complaint) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      under_review: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      under_investigation: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      verified: 'bg-green-500/20 text-green-700 border-green-500/30',
      unverified: 'bg-red-500/20 text-red-700 border-red-500/30',
      resolved: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      archived: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Megaphone className="h-4 w-4" />;
      case 'under_review':
      case 'under_investigation':
        return <Search className="h-4 w-4" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'unverified':
        return <XCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Denúncia {complaint.complaint_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              {statusLabels[complaint.status] || complaint.status}
            </span>
            <Badge variant="outline">{typeLabels[complaint.complaint_type] || complaint.complaint_type}</Badge>
            {complaint.is_anonymous && (
              <Badge variant="secondary" className="gap-1">
                <UserX className="h-3 w-3" />
                Anónima
              </Badge>
            )}
            {complaint.verification_result === 'confirmed' && (
              <Badge variant="destructive">Irregularidade Confirmada</Badge>
            )}
          </div>

          <Separator />

          {/* Complainant Info */}
          {!complaint.is_anonymous && complaint.complainant_name && (
            <>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Denunciante
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{complaint.complainant_name}</p>
                  </div>
                  {complaint.complainant_phone && (
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="font-medium">{complaint.complainant_phone}</p>
                    </div>
                  )}
                  {complaint.complainant_email && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{complaint.complainant_email}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Location */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Província</p>
                <p className="font-medium">{complaint.province?.name || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Município</p>
                <p className="font-medium">{complaint.municipality?.name || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Descrição do Local</p>
                <p className="font-medium">{complaint.location_description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data da Ocorrência</p>
                <p className="font-medium">
                  {complaint.occurrence_date 
                    ? format(new Date(complaint.occurrence_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                    : 'Não especificada'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Data de Recepção</p>
                <p className="font-medium">
                  {format(new Date(complaint.received_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição da Irregularidade
            </h4>
            <p className="text-sm bg-muted/50 p-4 rounded-lg">{complaint.description}</p>
          </div>

          {/* Investigation Notes */}
          {complaint.investigation_notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold">Notas de Investigação</h4>
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{complaint.investigation_notes}</p>
              </div>
            </>
          )}

          {/* Actions Taken */}
          {complaint.actions_taken && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold">Acções Tomadas</h4>
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{complaint.actions_taken}</p>
              </div>
            </>
          )}

          {/* Update Status Section */}
          {onUpdateStatus && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold">Actualizar Estado</h4>
                <Textarea 
                  placeholder="Adicione notas sobre a investigação..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus('under_investigation', notes)}>
                    Iniciar Investigação
                  </Button>
                  <Button size="sm" variant="default" onClick={() => onUpdateStatus('verified', notes)}>
                    Confirmar Irregularidade
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onUpdateStatus('unverified', notes)}>
                    Não Confirmada
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus('resolved', notes)}>
                    Marcar Resolvida
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
