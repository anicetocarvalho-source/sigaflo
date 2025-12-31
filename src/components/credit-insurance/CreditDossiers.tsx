import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useCreditDossiers, useCreateCreditDossier } from '@/hooks/useCreditInsurance';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export function CreditDossiers() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: farmers } = useFarmers();
  const { data: dossiers, isLoading, refetch } = useCreditDossiers({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  const createDossier = useCreateCreditDossier();

  const handleCreate = async () => {
    if (!selectedFarmerId) {
      toast.error('Seleccione um agricultor');
      return;
    }

    try {
      await createDossier.mutateAsync(selectedFarmerId);
      toast.success('Dossiê criado com sucesso');
      refetch();
    } catch (e) {
      toast.error('Erro ao criar dossiê');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      'draft': { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      'ready': { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Pronto' },
      'submitted': { icon: Send, color: 'bg-yellow-100 text-yellow-800', label: 'Submetido' },
      'approved': { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      'rejected': { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      'expired': { icon: AlertCircle, color: 'bg-orange-100 text-orange-800', label: 'Expirado' },
    };
    const config = configs[status] || { icon: Clock, color: 'bg-gray-100 text-gray-800', label: status };
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (classification: string | null) => {
    if (!classification) return <Badge variant="outline">N/A</Badge>;
    switch (classification) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Baixo</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alto</Badge>;
      default:
        return <Badge variant="outline">{classification}</Badge>;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Create Dossier */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Dossiê Digital de Crédito Agrícola</CardTitle>
          <CardDescription>
            Gere um dossiê completo contendo perfil financeiro, certificados, simulações e mapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
              <SelectTrigger className="md:w-[400px]">
                <SelectValue placeholder="Seleccione um agricultor" />
              </SelectTrigger>
              <SelectContent>
                {farmers?.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={createDossier.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Dossiê
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Dossiês de Crédito</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="ready">Pronto</SelectItem>
                <SelectItem value="submitted">Submetido</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Crédito Recomendado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : dossiers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum dossiê encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  dossiers?.map((dossier: any) => (
                    <TableRow key={dossier.id}>
                      <TableCell className="font-mono text-sm">{dossier.dossier_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dossier.farmer?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {dossier.farmer?.registration_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          (dossier.credit_score || 0) >= 70 ? 'text-green-600' :
                          (dossier.credit_score || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {dossier.credit_score || '-'}/100
                        </span>
                      </TableCell>
                      <TableCell>{getRiskBadge(dossier.risk_classification)}</TableCell>
                      <TableCell>{formatCurrency(dossier.recommended_credit_aoa)}</TableCell>
                      <TableCell>{getStatusBadge(dossier.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(dossier.created_at).toLocaleDateString('pt-AO')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          {dossier.status === 'ready' && (
                            <Button size="sm" variant="ghost">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
