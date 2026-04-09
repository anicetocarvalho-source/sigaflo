import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubsidizedPurchases, useApprovePurchase, usePOSProducts } from '@/hooks/usePOS';
import { formatAOA } from '@/lib/fiscal';
import { ShoppingBag, Search, CheckCircle, XCircle, BarChart3, Percent, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  approved: { label: 'Aprovada', variant: 'default' },
  rejected: { label: 'Rejeitada', variant: 'destructive' },
  completed: { label: 'Concluída', variant: 'outline' },
};

export default function ComprasPage() {
  const { data: purchases, isLoading } = useSubsidizedPurchases();
  const approvePurchase = useApprovePurchase();
  const [search, setSearch] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = purchases?.filter((p: any) =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).farmers?.full_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalCompras = filtered.reduce((s: number, p: any) => s + (p.total_value_aoa || 0), 0);
  const totalSubsidio = filtered.reduce((s: number, p: any) => s + (p.subsidy_value_aoa || 0), 0);
  const totalCopagamento = filtered.reduce((s: number, p: any) => s + (p.copayment_value_aoa || 0), 0);

  const handleApprove = (id: string) => {
    approvePurchase.mutate({ id, status: 'approved' });
  };

  const handleReject = () => {
    if (!rejectId || !rejectReason) { toast.error('Indique o motivo da rejeição'); return; }
    approvePurchase.mutate({ id: rejectId, status: 'rejected', rejection_reason: rejectReason });
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <MainLayout title="Compras Subsidiadas" subtitle="Gestão de compras com split 70/30 subsídio/copagamento">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Compras</p><p className="text-xl font-bold">{formatAOA(totalCompras)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Percent className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Valor Subsidiado</p><p className="text-xl font-bold">{formatAOA(totalSubsidio)}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Wallet className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Copagamento</p><p className="text-xl font-bold">{formatAOA(totalCopagamento)}</p></div></div></CardContent></Card>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar compras..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Subsídio (70%)</TableHead>
                  <TableHead>Copagamento (30%)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">A carregar...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma compra encontrada</TableCell></TableRow>
                ) : filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{(p as any).farmers?.full_name || 'N/A'}</TableCell>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell className="font-medium">{formatAOA(p.total_value_aoa)}</TableCell>
                    <TableCell>{formatAOA(p.subsidy_value_aoa)}</TableCell>
                    <TableCell>{formatAOA(p.copayment_value_aoa)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[p.status]?.variant || 'secondary'}>
                        {STATUS_MAP[p.status]?.label || p.status}
                      </Badge>
                      {p.is_deferred && <Badge variant="outline" className="ml-1">Diferido</Badge>}
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(p.id)} className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setRejectId(p.id)} className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rejeitar Compra</DialogTitle></DialogHeader>
            <div><Label>Motivo da Rejeição</Label><Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Motivo..." /></div>
            <DialogFooter><Button variant="outline" onClick={() => setRejectId(null)}>Cancelar</Button><Button variant="destructive" onClick={handleReject}>Rejeitar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
