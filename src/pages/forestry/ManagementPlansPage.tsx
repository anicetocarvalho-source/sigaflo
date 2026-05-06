import { useState } from 'react';
import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useForestManagementPlans, useUpsertManagementPlan } from '@/hooks/useForestryExtras';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ManagementPlansPage() {
  const { data = [], isLoading, isError, error } = useForestManagementPlans();
  const upsert = useUpsertManagementPlan();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: '', total_area_ha: 0, cutting_cycle_years: 25, annual_allowable_cut_m3: 0, status: 'rascunho', eudr_compliant: false });

  const submit = async () => {
    await upsert.mutateAsync(form);
    setOpen(false);
    setForm({ title: '', total_area_ha: 0, cutting_cycle_years: 25, annual_allowable_cut_m3: 0, status: 'rascunho', eudr_compliant: false });
  };

  return (
    <ForestryModulePage
      title="Planos de Maneio Florestal (EUDR)"
      subtitle="Gestão de planos de maneio com conformidade EUDR"
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={data.length === 0}
      emptyMessage="Ainda não há planos de maneio registados."
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Plano</Button>}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Título</TableHead><TableHead>Área (ha)</TableHead><TableHead>AAC (m³/ano)</TableHead><TableHead>Estado</TableHead><TableHead>EUDR</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs"><FileText className="inline h-3 w-3 mr-1" />{p.plan_number}</TableCell>
              <TableCell>{p.title}</TableCell>
              <TableCell>{Number(p.total_area_ha).toLocaleString('pt-AO')}</TableCell>
              <TableCell>{Number(p.annual_allowable_cut_m3 || 0).toLocaleString('pt-AO')}</TableCell>
              <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
              <TableCell>{p.eudr_compliant ? <Badge>Conforme</Badge> : <Badge variant="secondary">Pendente</Badge>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Plano de Maneio (PMF)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Área total (ha)</Label><Input type="number" value={form.total_area_ha} onChange={e => setForm({ ...form, total_area_ha: Number(e.target.value) })} /></div>
              <div><Label>AAC (m³/ano)</Label><Input type="number" value={form.annual_allowable_cut_m3} onChange={e => setForm({ ...form, annual_allowable_cut_m3: Number(e.target.value) })} /></div>
              <div><Label>Ciclo (anos)</Label><Input type="number" value={form.cutting_cycle_years} onChange={e => setForm({ ...form, cutting_cycle_years: Number(e.target.value) })} /></div>
              <div><Label>Estado</Label><Input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} /></div>
            </div>
            <div><Label>Notas</Label><Textarea value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={upsert.isPending || !form.title}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ForestryModulePage>
  );
}
