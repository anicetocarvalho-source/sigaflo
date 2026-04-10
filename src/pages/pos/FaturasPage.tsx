import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInvoices } from '@/hooks/usePOS';
import { formatAOA, getSystemId } from '@/lib/fiscal';
import { FileText, Download, Search, QrCode, Hash, BarChart3 } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  emitida: { label: 'Emitida', variant: 'default' },
  pendente: { label: 'Pendente', variant: 'secondary' },
  comunicada: { label: 'Comunicada', variant: 'outline' },
  aceite: { label: 'Aceite', variant: 'default' },
  rejeitada: { label: 'Rejeitada', variant: 'destructive' },
};

export default function FaturasPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const filtered = invoices?.filter((inv: any) =>
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    (inv as any).farmers?.full_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalEmitido = filtered.reduce((s: number, i: any) => s + (i.total_aoa || 0), 0);
  const totalIVA = filtered.reduce((s: number, i: any) => s + (i.iva_total_aoa || 0), 0);

  return (
    <MainLayout title="Facturas" subtitle="Gestão fiscal conforme AGT">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Emitido</p>
                  <p className="text-xl font-bold">{formatAOA(totalEmitido)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total IVA</p>
                  <p className="text-xl font-bold">{formatAOA(totalIVA)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nº Facturas</p>
                  <p className="text-xl font-bold">{filtered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar por nº factura ou agricultor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Factura</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">A carregar...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma factura encontrada</TableCell></TableRow>
                ) : filtered.map((inv: any) => (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedInvoice(inv)}>
                    <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                    <TableCell><Badge variant="outline">{inv.series_code}</Badge></TableCell>
                    <TableCell>{(inv as any).farmers?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{formatAOA(inv.total_aoa)}</TableCell>
                    <TableCell>{formatAOA(inv.iva_total_aoa)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[inv.status]?.variant || 'secondary'}>
                        {STATUS_MAP[inv.status]?.label || inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(inv.created_at).toLocaleDateString('pt-AO')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Detail Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhe da Factura</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Nº:</span> <span className="font-mono">{selectedInvoice.invoice_number}</span></div>
                  <div><span className="text-muted-foreground">Série:</span> {selectedInvoice.series_code}</div>
                  <div><span className="text-muted-foreground">SystemID:</span> {selectedInvoice.system_id}</div>
                  <div><span className="text-muted-foreground">Estado:</span> <Badge variant={STATUS_MAP[selectedInvoice.status]?.variant}>{STATUS_MAP[selectedInvoice.status]?.label}</Badge></div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatAOA(selectedInvoice.subtotal_aoa)}</span></div>
                  <div className="flex justify-between"><span>IVA</span><span>{formatAOA(selectedInvoice.iva_total_aoa)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatAOA(selectedInvoice.total_aoa)}</span></div>
                </div>
                <div className="border-t pt-3 space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Hash Fiscal:</span> <span className="font-mono break-all">{selectedInvoice.hash_fiscal || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">Hash Anterior:</span> <span className="font-mono break-all">{selectedInvoice.hash_anterior || '0'}</span></p>
                </div>
                <div className="flex justify-center">
                  <div className="h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm"><Download className="h-4 w-4 mr-1" /> PDF</Button>
                  <Button variant="outline" className="flex-1" size="sm"><Download className="h-4 w-4 mr-1" /> XML</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
