import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MapPin, Wrench } from 'lucide-react';
import { useMechanizationCenters, useCreateCenter, CENTER_TYPES, type MechanizationCenter } from '@/hooks/useMechanization';
import { useLocationCascade } from '@/hooks/useLocationCascade';
import { TableSkeleton } from '@/components/ui/skeletons';
import { QueryError } from '@/components/ui/query-state';

export function CentersList() {
  const { data: centers, isLoading, isError, error, refetch } = useMechanizationCenters();
  const createCenter = useCreateCenter();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<MechanizationCenter>>({ center_type: 'tractor_center', status: 'active', total_machines: 0, operational_machines: 0 });

  const { provinces, municipalities, handleProvinceChange } = useLocationCascade();

  const filtered = (centers || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.manager_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    createCenter.mutate(form, { onSuccess: () => { setOpen(false); setForm({ center_type: 'tractor_center', status: 'active', total_machines: 0, operational_machines: 0 }); } });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Centros de Mecanização</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Novo Centro</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Registar Centro de Mecanização</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Nome *</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><Label>Tipo</Label>
                    <Select value={form.center_type} onValueChange={v => setForm(f => ({ ...f, center_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CENTER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Província</Label>
                      <Select onValueChange={v => { handleProvinceChange(v); setForm(f => ({ ...f, province_id: v })); }}>
                        <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                        <SelectContent>{provinces?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Município</Label>
                      <Select onValueChange={v => setForm(f => ({ ...f, municipality_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                        <SelectContent>{municipalities?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Total Máquinas</Label><Input type="number" value={form.total_machines || 0} onChange={e => setForm(f => ({ ...f, total_machines: +e.target.value }))} /></div>
                    <div><Label>Operacionais</Label><Input type="number" value={form.operational_machines || 0} onChange={e => setForm(f => ({ ...f, operational_machines: +e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Responsável</Label><Input value={form.manager_name || ''} onChange={e => setForm(f => ({ ...f, manager_name: e.target.value }))} /></div>
                    <div><Label>Telefone</Label><Input value={form.manager_phone || ''} onChange={e => setForm(f => ({ ...f, manager_phone: e.target.value }))} /></div>
                  </div>
                  <Button onClick={handleSubmit} disabled={!form.name || createCenter.isPending} className="w-full">
                    {createCenter.isPending ? 'A guardar...' : 'Registar Centro'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError error={error as Error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum centro registado</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Máquinas</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>{CENTER_TYPES.find(t => t.value === c.center_type)?.label || c.center_type}</TableCell>
                    <TableCell>{c.operational_machines}/{c.total_machines}</TableCell>
                    <TableCell>{c.manager_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                        {c.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
