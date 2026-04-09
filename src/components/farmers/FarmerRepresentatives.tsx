import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, User, Phone, Fingerprint, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
}

const RELATIONSHIPS = [
  'Cônjuge', 'Filho(a)', 'Pai/Mãe', 'Irmão(ã)', 'Tio(a)', 'Sobrinho(a)', 'Primo(a)', 'Outro'
];

export const FarmerRepresentatives = ({ farmerId }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', bi: '', phone: '', relationship: '' });

  const { data: reps, isLoading } = useQuery({
    queryKey: ['farmer-representatives', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_representatives')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (rep: typeof form) => {
      // Check BI uniqueness
      if (rep.bi) {
        const { data: existing } = await supabase
          .from('farmer_representatives')
          .select('id')
          .eq('bi', rep.bi)
          .maybeSingle();
        if (existing) throw new Error('Já existe um representante com este BI');
      }
      const { error } = await supabase
        .from('farmer_representatives')
        .insert({ ...rep, farmer_id: farmerId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-representatives', farmerId] });
      toast.success('Representante adicionado');
      setOpen(false);
      setForm({ name: '', bi: '', phone: '', relationship: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('farmer_representatives').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-representatives', farmerId] });
      toast.success('Representante removido');
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Representantes Legais
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Representante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>BI</Label>
                <Input value={form.bi} onChange={e => setForm(f => ({ ...f, bi: e.target.value }))} placeholder="000000000XX000" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Parentesco *</Label>
                <Select value={form.relationship} onValueChange={v => setForm(f => ({ ...f, relationship: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={!form.name || !form.relationship || createMutation.isPending}
                onClick={() => createMutation.mutate(form)}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : !reps?.length ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Nenhum representante registado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>BI</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead>Biometria</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reps.map(rep => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">{rep.name}</TableCell>
                  <TableCell className="font-mono text-sm">{rep.bi || '—'}</TableCell>
                  <TableCell>
                    {rep.phone ? (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{rep.phone}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell>{rep.relationship}</TableCell>
                  <TableCell>
                    <Badge variant={rep.fingerprint_complete ? 'default' : 'secondary'}>
                      <Fingerprint className="mr-1 h-3 w-3" />
                      {rep.fingers_captured || 0}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rep.id)}>
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
  );
};
