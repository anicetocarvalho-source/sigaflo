import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClimateEvents } from '@/hooks/useClimateRisk';
import { FileCheck, Search, Plus, Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface EvidenceRecord {
  id: string;
  farmer_name: string;
  event_title: string;
  event_date: string;
  event_type: string;
  affected_area_ha: number;
  estimated_loss_aoa: number;
  status: 'pending' | 'validated' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
}

// Mock evidence data
const mockEvidence: EvidenceRecord[] = [
  {
    id: '1',
    farmer_name: 'João Manuel Silva',
    event_title: 'Seca severa no Planalto Central',
    event_date: '2024-08-15',
    event_type: 'seca',
    affected_area_ha: 45,
    estimated_loss_aoa: 2500000,
    status: 'validated',
    created_at: '2024-08-20',
  },
  {
    id: '2',
    farmer_name: 'Maria das Dores',
    event_title: 'Inundação no Vale do Cuanza',
    event_date: '2024-07-10',
    event_type: 'inundacao',
    affected_area_ha: 30,
    estimated_loss_aoa: 1800000,
    status: 'pending',
    created_at: '2024-07-15',
  },
  {
    id: '3',
    farmer_name: 'Cooperativa Agrícola do Huambo',
    event_title: 'Pragas na cultura de milho',
    event_date: '2024-06-05',
    event_type: 'pragas',
    affected_area_ha: 120,
    estimated_loss_aoa: 5600000,
    status: 'approved',
    created_at: '2024-06-10',
  },
  {
    id: '4',
    farmer_name: 'António Fernandes',
    event_title: 'Tempestade com granizo',
    event_date: '2024-05-20',
    event_type: 'tempestade',
    affected_area_ha: 15,
    estimated_loss_aoa: 950000,
    status: 'submitted',
    created_at: '2024-05-25',
  },
];

export function InsuranceEvidenceManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: events } = useClimateEvents();

  const filteredEvidence = mockEvidence.filter(record => {
    const matchesSearch = record.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      record.event_title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'validated': return <Badge className="bg-blue-500 gap-1"><CheckCircle className="h-3 w-3" />Validado</Badge>;
      case 'submitted': return <Badge className="bg-yellow-500 text-yellow-950 gap-1"><FileText className="h-3 w-3" />Submetido</Badge>;
      case 'approved': return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" />Aprovado</Badge>;
      case 'rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeitado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleGenerateEvidence = () => {
    toast.success('Evidência gerada com sucesso');
    setIsDialogOpen(false);
  };

  const handleExport = (id: string) => {
    toast.success('Relatório de evidência exportado');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Gestão de Evidências para Seguro
            </CardTitle>
            <CardDescription>
              Gere e gerencie documentação comprobatória para compensações e seguros agrícolas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Evidência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Gerar Nova Evidência</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Evento Climático</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.slice(0, 10).map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Agricultor / Entidade</Label>
                  <Input placeholder="Nome do agricultor ou entidade" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Área Afectada (ha)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Perda Estimada (Kz)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição dos Danos</Label>
                  <Textarea 
                    placeholder="Descreva os danos observados e impacto na produção..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cultura(s) Afectada(s)</Label>
                  <Input placeholder="Ex: Milho, Feijão" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGenerateEvidence}>
                    Gerar Evidência
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por agricultor ou evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="validated">Validado</SelectItem>
              <SelectItem value="submitted">Submetido</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Evidence Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agricultor/Entidade</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Data do Evento</TableHead>
                <TableHead>Área (ha)</TableHead>
                <TableHead>Perda Estimada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvidence.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma evidência encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvidence.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.farmer_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.event_title}</TableCell>
                    <TableCell>
                      {format(new Date(record.event_date), 'dd/MM/yyyy', { locale: pt })}
                    </TableCell>
                    <TableCell>{record.affected_area_ha}</TableCell>
                    <TableCell>{formatCurrency(record.estimated_loss_aoa)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(record.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{mockEvidence.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {mockEvidence.filter(e => e.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {mockEvidence.filter(e => e.status === 'validated').length}
            </p>
            <p className="text-sm text-muted-foreground">Validados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {mockEvidence.filter(e => e.status === 'approved').length}
            </p>
            <p className="text-sm text-muted-foreground">Aprovados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatCurrency(mockEvidence.reduce((sum, e) => sum + e.estimated_loss_aoa, 0))}
            </p>
            <p className="text-sm text-muted-foreground">Total Perdas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
