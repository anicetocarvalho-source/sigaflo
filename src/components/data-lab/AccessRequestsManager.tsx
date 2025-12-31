import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAccessRequests, useUpdateAccessRequest } from '@/hooks/useDataLab';
import { Shield, Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AccessRequestsManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { data: requests, isLoading } = useAccessRequests();
  const updateRequest = useUpdateAccessRequest();

  const filteredRequests = requests?.filter(r => {
    const matchesSearch = r.purpose.toLowerCase().includes(search.toLowerCase()) ||
      r.request_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const request = requests?.find(r => r.id === selectedRequest);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'under_review': return <Badge className="bg-blue-500 gap-1"><Eye className="h-3 w-3" />Em Análise</Badge>;
      case 'approved': return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" />Aprovado</Badge>;
      case 'rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeitado</Badge>;
      case 'expired': return <Badge variant="secondary">Expirado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      updateRequest.mutate({
        id: selectedRequest,
        status: 'approved',
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        approved_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }, {
        onSuccess: () => {
          setSelectedRequest(null);
          setReviewNotes('');
        }
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      updateRequest.mutate({
        id: selectedRequest,
        status: 'rejected',
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      }, {
        onSuccess: () => {
          setSelectedRequest(null);
          setReviewNotes('');
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Pedidos de Acesso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar pedidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="under_review">Em Análise</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Investigador</TableHead>
                <TableHead>Datasets</TableHead>
                <TableHead>Propósito</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando pedidos...
                  </TableCell>
                </TableRow>
              ) : filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono">{req.request_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{(req.researcher as any)?.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {(req.organization as any)?.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {req.dataset_ids.slice(0, 2).map((ds) => (
                          <Badge key={ds} variant="outline" className="text-xs">
                            {ds}
                          </Badge>
                        ))}
                        {req.dataset_ids.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{req.dataset_ids.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {req.purpose}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(req.created_at), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(req.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Analisar Pedido de Acesso</DialogTitle>
            </DialogHeader>
            {request && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono">{request.request_number}</span>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Investigador</p>
                    <p className="font-medium">{(request.researcher as any)?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Organização</p>
                    <p className="font-medium">{(request.organization as any)?.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Propósito</p>
                  <p className="text-sm">{request.purpose}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Descrição da Pesquisa</p>
                  <p className="text-sm">{request.research_description || 'Não fornecida'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Datasets Solicitados</p>
                  <div className="flex flex-wrap gap-1">
                    {request.dataset_ids.map((ds) => (
                      <Badge key={ds} variant="outline">
                        {ds}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Formato de Saída</p>
                    <p>{request.output_format}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duração Pretendida</p>
                    <p>{request.expected_duration_days} dias</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Notas de Análise</p>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Adicione notas sobre a decisão..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleReject}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
