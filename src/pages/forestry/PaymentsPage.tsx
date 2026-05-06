import { useState } from 'react';
import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useForestPayments, useChargeAGT } from '@/hooks/useForestryExtras';
import { useForestLicenses } from '@/hooks/useForestry';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmtAOA = (n: number) => `${Number(n || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`;

export default function PaymentsPage() {
  const { data = [], isLoading, isError, error } = useForestPayments();
  const { data: licenses = [] } = useForestLicenses();
  const charge = useChargeAGT();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ reference_type: 'license', reference_id: '', base_amount_aoa: 0 });

  const submit = async () => {
    await charge.mutateAsync(form);
    setOpen(false);
  };

  const surcharge = (Number(form.base_amount_aoa) || 0) * 0.10;
  const total = (Number(form.base_amount_aoa) || 0) + surcharge;

  return (
    <ForestryModulePage
      title="Pagamentos AGT (com surcharge 10% RL)"
      subtitle="Transações de pagamento de licenças e guias de transporte"
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={data.length === 0}
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Cobrar AGT</Button>}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Nº TRX</TableHead><TableHead>Tipo</TableHead><TableHead>Base</TableHead><TableHead>+10% RL</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead><TableHead>Ref AGT</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs"><CreditCard className="inline h-3 w-3 mr-1" />{t.transaction_number}</TableCell>
              <TableCell>{t.reference_type}</TableCell>
              <TableCell>{fmtAOA(t.base_amount_aoa)}</TableCell>
              <TableCell className="text-amber-600">{fmtAOA(t.surcharge_rl_aoa)}</TableCell>
              <TableCell className="font-semibold">{fmtAOA(t.total_amount_aoa)}</TableCell>
              <TableCell><Badge variant={t.status === 'pago' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
              <TableCell className="font-mono text-xs">{t.agt_reference || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova cobrança AGT</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tipo de referência</Label>
              <Select value={form.reference_type} onValueChange={v => setForm({ ...form, reference_type: v, reference_id: '' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="license">Licença</SelectItem>
                  <SelectItem value="permit">Guia de Transporte</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.reference_type === 'license' && (
              <div>
                <Label>Licença</Label>
                <Select value={form.reference_id} onValueChange={v => setForm({ ...form, reference_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar licença" /></SelectTrigger>
                  <SelectContent>
                    {licenses.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>{l.license_number} — {l.concession_area_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Valor base (AOA)</Label>
              <Input type="number" value={form.base_amount_aoa} onChange={e => setForm({ ...form, base_amount_aoa: Number(e.target.value) })} />
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Base</span><span>{fmtAOA(form.base_amount_aoa)}</span></div>
              <div className="flex justify-between text-amber-600"><span>Surcharge 10% RL</span><span>{fmtAOA(surcharge)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-1"><span>Total</span><span>{fmtAOA(total)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={charge.isPending || !form.base_amount_aoa}>Cobrar via AGT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ForestryModulePage>
  );
}
