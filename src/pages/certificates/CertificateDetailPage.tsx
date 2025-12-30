import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCertificate, useUpdateCertificateStatus } from '@/hooks/useCertificates';
import { WorkflowStatusBadge, getStatusLabel } from '@/components/farmers/WorkflowStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const CertificateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: certificate, isLoading } = useCertificate(id!);
  const updateStatus = useUpdateCertificateStatus();
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleStatusChange = async (status: string) => {
    await updateStatus.mutateAsync({ 
      id: id!, 
      status: status as any,
      notes: notes || undefined
    });
    setDialogOpen(false);
    setNotes('');
    setPendingAction(null);
  };

  const openDialog = (action: string) => {
    setPendingAction(action);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout title="Certificado" subtitle="A carregar...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!certificate) {
    return (
      <MainLayout title="Certificado" subtitle="Não encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Certificado não encontrado</p>
          <Link to="/certificados">
            <Button variant="link">Voltar à lista</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const verificationUrl = `${window.location.origin}/verificar/certificado/${certificate.certificate_number}`;

  const getNextActions = () => {
    switch (certificate.status) {
      case 'draft':
        return [{ label: 'Submeter', status: 'submitted', icon: Send, variant: 'default' as const }];
      case 'submitted':
        return [
          { label: 'Validar', status: 'validated', icon: CheckCircle, variant: 'default' as const },
          { label: 'Rejeitar', status: 'rejected', icon: XCircle, variant: 'destructive' as const },
        ];
      case 'validated':
        return [
          { label: 'Aprovar', status: 'approved', icon: CheckCircle, variant: 'default' as const },
          { label: 'Rejeitar', status: 'rejected', icon: XCircle, variant: 'destructive' as const },
        ];
      case 'approved':
        return [{ label: 'Emitir', status: 'issued', icon: FileText, variant: 'default' as const }];
      default:
        return [];
    }
  };

  return (
    <MainLayout title="Detalhes do Certificado" subtitle={certificate.certificate_number}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/certificados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            {certificate.status === 'issued' && (
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            )}
            {getNextActions().map((action) => (
              <Dialog key={action.status} open={dialogOpen && pendingAction === action.status} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant={action.variant} onClick={() => openDialog(action.status)}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{action.label} Certificado</DialogTitle>
                    <DialogDescription>
                      {action.status === 'rejected' 
                        ? 'Indique o motivo da rejeição:' 
                        : 'Adicione notas (opcional):'}
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Notas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant={action.variant}
                      onClick={() => handleStatusChange(action.status)}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? 'A processar...' : `Confirmar ${action.label}`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {certificate.certificate_number}
                </CardTitle>
                <WorkflowStatusBadge status={certificate.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {certificate.certificate_type === 'production' ? 'Certificado de Produção' : 
                     certificate.certificate_type === 'organic' ? 'Certificado Orgânico' : 
                     certificate.certificate_type === 'quality' ? 'Certificado de Qualidade' : 
                     certificate.certificate_type === 'origin' ? 'Certificado de Origem' : 'Boas Práticas Agrícolas'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campanha / Ano</p>
                  <p className="font-medium">{certificate.season} {certificate.year}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Agricultor / Entidade</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{certificate.farmers?.name}</p>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {certificate.farmers?.registration_number}
                </p>
                {certificate.farmers?.provinces && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{certificate.farmers.provinces.name}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Culturas</p>
                <div className="flex flex-wrap gap-2">
                  {certificate.crops?.map((crop) => (
                    <Badge key={crop} variant="secondary">{crop}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {certificate.total_area_ha && (
                  <div>
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="font-medium">{certificate.total_area_ha} ha</p>
                  </div>
                )}
                {certificate.total_quantity_kg && (
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade Total</p>
                    <p className="font-medium">{certificate.total_quantity_kg.toLocaleString()} kg</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {certificate.status === 'issued' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Código de Verificação</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <QRCodeSVG 
                    value={verificationUrl}
                    size={160}
                    level="H"
                    includeMargin
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center break-all">
                    {verificationUrl}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico de Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificate.created_at && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Criado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.created_at).toLocaleString('pt-AO')}
                      </p>
                    </div>
                  </div>
                )}
                {certificate.submitted_at && (
                  <div className="flex items-start gap-2">
                    <Send className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Submetido</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.submitted_at).toLocaleString('pt-AO')}
                      </p>
                    </div>
                  </div>
                )}
                {certificate.validated_at && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Validado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.validated_at).toLocaleString('pt-AO')}
                      </p>
                      {certificate.validation_notes && (
                        <p className="text-xs mt-1">{certificate.validation_notes}</p>
                      )}
                    </div>
                  </div>
                )}
                {certificate.approved_at && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Aprovado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.approved_at).toLocaleString('pt-AO')}
                      </p>
                    </div>
                  </div>
                )}
                {certificate.issued_at && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Emitido</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.issued_at).toLocaleString('pt-AO')}
                      </p>
                    </div>
                  </div>
                )}
                {certificate.rejected_at && (
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Rejeitado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.rejected_at).toLocaleString('pt-AO')}
                      </p>
                      {certificate.rejection_reason && (
                        <p className="text-xs mt-1 text-red-600">{certificate.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CertificateDetailPage;
