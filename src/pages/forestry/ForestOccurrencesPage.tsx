import { useState } from 'react';
import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useForestOccurrences, useCreateForestOccurrence } from '@/hooks/useForestryExtras';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const sevColor: Record<string, string> = {
  low: 'bg-blue-500', medium: 'bg-amber-500', high: 'bg-orange-600', critical: 'bg-red-600',
};

interface Props { defaultType?: 'fire' | 'pest' | 'disease' | 'invasion' | undefined; pageTitle?: string; }

export default function ForestOccurrencesPage({ defaultType, pageTitle = 'Ocorrências Florestais' }: Props) {
  const { data = [], isLoading, isError, error } = useForestOccurrences(defaultType ? { type: defaultType } : undefined);
  const create = useCreateForestOccurrence();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ occurrence_type: defaultType ?? 'fire', severity: 'medium', status: 'aberta', description: '' });

  return (
    <ForestryModulePage
      title={pageTitle}
      subtitle="Registo de incêndios, pragas, doenças e invasões"
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={data.length === 0}
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Registar Ocorrência</Button>}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Tipo</TableHead><TableHead>Severidade</TableHead><TableHead>Área (ha)</TableHead><TableHead>Reportado</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((o: any) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-xs"><AlertTriangle className="inline h-3 w-3 mr-1" />{o.occurrence_number}</TableCell>
              <TableCell>{o.occurrence_type}</TableCell>
              <TableCell><Badge className={sevColor[o.severity] ?? ''}>{o.severity}</Badge></TableCell>
              <TableCell>{o.affected_area_ha ?? '—'}</TableCell>
              <TableCell>{format(new Date(o.reported_at), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Ocorrência</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo</Label>
                <Select value={form.occurrence_type} onValueChange={v => setForm({ ...form, occurrence_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">Incêndio</SelectItem>
                    <SelectItem value="pest">Praga</SelectItem>
                    <SelectItem value="disease">Doença</SelectItem>
                    <SelectItem value="invasion">Invasão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Severidade</Label>
                <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Lat</Label><Input type="number" step="any" value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: Number(e.target.value) })} /></div>
              <div><Label>Lon</Label><Input type="number" step="any" value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: Number(e.target.value) })} /></div>
              <div><Label>Área afectada (ha)</Label><Input type="number" value={form.affected_area_ha ?? ''} onChange={e => setForm({ ...form, affected_area_ha: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={async () => { await create.mutateAsync(form); setOpen(false); }} disabled={create.isPending}>Registar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ForestryModulePage>
  );
}
