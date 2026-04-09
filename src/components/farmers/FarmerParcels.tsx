import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MapPin, Leaf, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
}

const CROPS = ['Milho', 'Mandioca', 'Feijão', 'Arroz', 'Café', 'Banana', 'Batata-doce', 'Amendoim', 'Soja', 'Hortícolas'];
const SOIL_TYPES = ['Argiloso', 'Arenoso', 'Franco', 'Franco-argiloso', 'Franco-arenoso'];
const WATER_SOURCES = ['Chuva', 'Rio', 'Poço', 'Nascente', 'Lagoa', 'Barragem'];
const IRRIGATION = ['Sequeiro', 'Gravidade', 'Aspersão', 'Gota-a-gota', 'Sulcos'];

export const FarmerParcels = ({ farmerId }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', area_ha: '', main_crop: '', latitude: '', longitude: '',
    soil_type: '', water_source: '', irrigation_system: '',
  });

  const { data: parcels, isLoading } = useQuery({
    queryKey: ['farmer-parcels', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_parcels')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('farmer_parcels').insert({
        farmer_id: farmerId,
        name: form.name,
        area_ha: form.area_ha ? parseFloat(form.area_ha) : null,
        main_crop: form.main_crop || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        soil_type: form.soil_type || null,
        water_source: form.water_source || null,
        irrigation_system: form.irrigation_system || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-parcels', farmerId] });
      toast.success('Parcela adicionada');
      setOpen(false);
      setForm({ name: '', area_ha: '', main_crop: '', latitude: '', longitude: '', soil_type: '', water_source: '', irrigation_system: '' });
    },
    onError: () => toast.error('Erro ao criar parcela'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('farmer_parcels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-parcels', farmerId] });
      toast.success('Parcela removida');
    },
  });

  const totalArea = parcels?.reduce((s, p) => s + (p.area_ha || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-2xl font-bold">{parcels?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Parcelas</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-2xl font-bold">{totalArea.toFixed(1)} ha</p>
          <p className="text-sm text-muted-foreground">Área Total</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-2xl font-bold">{parcels?.filter(p => p.status === 'active').length || 0}</p>
          <p className="text-sm text-muted-foreground">Parcelas Activas</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />Parcelas Agrícolas
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nova Parcela</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Registar Parcela</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label>Nome da Parcela *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Parcela Norte" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Área (ha)</Label>
                    <Input type="number" step="0.1" value={form.area_ha} onChange={e => setForm(f => ({ ...f, area_ha: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Cultura Principal</Label>
                    <Select value={form.main_crop} onValueChange={v => setForm(f => ({ ...f, main_crop: v }))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <Input type="number" step="0.000001" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input type="number" step="0.000001" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Solo</Label>
                    <Select value={form.soil_type} onValueChange={v => setForm(f => ({ ...f, soil_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{SOIL_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Água</Label>
                    <Select value={form.water_source} onValueChange={v => setForm(f => ({ ...f, water_source: v }))}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{WATER_SOURCES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Irrigação</Label>
                    <Select value={form.irrigation_system} onValueChange={v => setForm(f => ({ ...f, irrigation_system: v }))}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{IRRIGATION.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button disabled={!form.name || createMutation.isPending} onClick={() => createMutation.mutate()}>
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Parcela'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : !parcels?.length ? (
            <div className="text-center py-12">
              <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">Nenhuma parcela registada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Cultura</TableHead>
                  <TableHead>Solo</TableHead>
                  <TableHead>Irrigação</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.area_ha ? `${p.area_ha} ha` : '—'}</TableCell>
                    <TableCell>
                      {p.main_crop ? <Badge variant="secondary"><Leaf className="mr-1 h-3 w-3" />{p.main_crop}</Badge> : '—'}
                    </TableCell>
                    <TableCell>{p.soil_type || '—'}</TableCell>
                    <TableCell>{p.irrigation_system || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.latitude && p.longitude ? `${Number(p.latitude).toFixed(4)}, ${Number(p.longitude).toFixed(4)}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
