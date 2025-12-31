import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  IncentiveProgram, 
  useAllocations,
  useUpdateAllocation,
  IncentiveAllocation
} from '@/hooks/useIncentives';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface AllocationManagerProps {
  programs: IncentiveProgram[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  approved: { label: 'Aprovado', icon: <Check className="h-3 w-3" />, variant: 'default' },
  disbursed: { label: 'Desembolsado', icon: <DollarSign className="h-3 w-3" />, variant: 'outline' },
  cancelled: { label: 'Cancelado', icon: <X className="h-3 w-3" />, variant: 'destructive' },
  returned: { label: 'Devolvido', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
};

export function AllocationManager({ programs }: AllocationManagerProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAllocation, setSelectedAllocation] = useState<IncentiveAllocation | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'disburse' | 'cancel' | null>(null);

  const { data: allocations, isLoading } = useAllocations(
    selectedProgram === 'all' ? undefined : selectedProgram,
    selectedStatus === 'all' ? undefined : selectedStatus
  );
  const updateAllocation = useUpdateAllocation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value);
  };

  const filteredAllocations = allocations?.filter(a => {
    if (!searchTerm) return true;
    const farmerName = (a.farmer as { name: string })?.name || '';
    return farmerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAction = async () => {
    if (!selectedAllocation || !actionType) return;

    const updates: Partial<IncentiveAllocation> & { id: string } = { id: selectedAllocation.id };

    switch (actionType) {
      case 'approve':
        updates.status = 'approved';
        break;
      case 'disburse':
        updates.status = 'disbursed';
        break;
      case 'cancel':
        updates.status = 'cancelled';
        break;
    }

    await updateAllocation.mutateAsync(updates);
    setSelectedAllocation(null);
    setActionType(null);
  };

  const stats = {
    total: allocations?.length || 0,
    pending: allocations?.filter(a => a.status === 'pending').length || 0,
    approved: allocations?.filter(a => a.status === 'approved').length || 0,
    disbursed: allocations?.filter(a => a.status === 'disbursed').length || 0,
    totalAmount: allocations?.reduce((sum, a) => sum + a.amount_aoa, 0) || 0,
    disbursedAmount: allocations?.filter(a => a.status === 'disbursed').reduce((sum, a) => sum + a.amount_aoa, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Alocações</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Desembolsado</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.disbursedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Alocações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar beneficiário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Programas</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="disbursed">Desembolsados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiário</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      A carregar...
                    </TableCell>
                  </TableRow>
                ) : filteredAllocations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma alocação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllocations?.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {(allocation.farmer as { name: string })?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(allocation.farmer as { farmer_type: string })?.farmer_type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {(allocation.program as { name: string })?.name || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(allocation.amount_aoa)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(allocation.allocation_date), 'dd MMM yyyy', { locale: pt })}
                      </TableCell>
                      <TableCell>
                        {allocation.eligibility_score ? (
                          <Badge variant="outline">{allocation.eligibility_score.toFixed(0)}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusConfig[allocation.status]?.variant || 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {statusConfig[allocation.status]?.icon}
                          {statusConfig[allocation.status]?.label || allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {allocation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAllocation(allocation);
                                  setActionType('approve');
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAllocation(allocation);
                                  setActionType('cancel');
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {allocation.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAllocation(allocation);
                                setActionType('disburse');
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Desembolsar
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

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedAllocation(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Aprovar Alocação'}
              {actionType === 'disburse' && 'Confirmar Desembolso'}
              {actionType === 'cancel' && 'Cancelar Alocação'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAllocation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  {(selectedAllocation.farmer as { name: string })?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(selectedAllocation.program as { name: string })?.name}
                </p>
                <p className="text-lg font-bold mt-2">
                  {formatCurrency(selectedAllocation.amount_aoa)}
                </p>
              </div>

              {actionType === 'cancel' && (
                <p className="text-sm text-destructive">
                  Esta ação não pode ser desfeita. O beneficiário perderá o direito ao incentivo.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedAllocation(null); }}>
              Cancelar
            </Button>
            <Button 
              variant={actionType === 'cancel' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={updateAllocation.isPending}
            >
              {actionType === 'approve' && 'Aprovar'}
              {actionType === 'disburse' && 'Confirmar Desembolso'}
              {actionType === 'cancel' && 'Cancelar Alocação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
