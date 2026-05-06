import { useState } from 'react';
import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useForestCertificates, useUpsertForestCertificate } from '@/hooks/useForestryExtras';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const classColor = (c: string) => c === 'A' ? 'bg-green-600' : c === 'B' ? 'bg-amber-600' : 'bg-red-600';

export default function GreenCertificationPage() {
  const { data = [], isLoading, isError, error } = useForestCertificates();
  const upsert = useUpsertForestCertificate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ classification: 'B', score: 75, status: 'ativo' });

  return (
    <ForestryModulePage
      title="Certificação Verde"
      subtitle="Selo de sustentabilidade florestal por operador/licença"
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={data.length === 0}
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Emitir Certificado</Button>}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Classe</TableHead><TableHead>Score</TableHead><TableHead>Emitido</TableHead><TableHead>Válido até</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs"><Award className="inline h-3 w-3 mr-1" />{c.certificate_number}</TableCell>
              <TableCell><Badge className={classColor(c.classification)}>{c.classification}</Badge></TableCell>
              <TableCell>{c.score ?? '—'}</TableCell>
              <TableCell>{format(new Date(c.issue_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{c.valid_until ? format(new Date(c.valid_until), 'dd/MM/yyyy') : '—'}</TableCell>
              <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Emitir Certificado Verde</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Classificação</Label>
              <Select value={form.classification} onValueChange={v => setForm({ ...form, classification: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A — Excelente</SelectItem>
                  <SelectItem value="B">B — Bom</SelectItem>
                  <SelectItem value="C">C — Suficiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Score (0-100)</Label><Input type="number" min={0} max={100} value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })} /></div>
            <div><Label>Válido até</Label><Input type="date" value={form.valid_until ?? ''} onChange={e => setForm({ ...form, valid_until: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={async () => { await upsert.mutateAsync(form); setOpen(false); }} disabled={upsert.isPending}>Emitir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ForestryModulePage>
  );
}
